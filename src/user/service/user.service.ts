import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/auth/service/auth.service';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User, UserRole } from '../models/user.interface';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from 'src/mail/service/mail.service';
import { NotificationService } from 'src/notifications/service/notification.service';
import { NotificationType } from 'src/notifications/model/notification.interface';
import { format } from 'date-fns';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
    private mailService: MailService,
    private notificationService: NotificationService,
  ) {}

  // create(user: User): Observable<User> {
  //   return this.authService.hashPassword(user.password).pipe(
  //     // tap((e) => console.log(e)
  //     switchMap((passwordHash: string) => {
  //       const newUser = new UserEntity();
  //       newUser.name = user.name;
  //       newUser.username = user.username;
  //       newUser.email = user.email;
  //       newUser.password = passwordHash;
  //       newUser.role = UserRole.USER;
  //       newUser.confirmToken = uuidv4();
  //       return from(this.userRepository.save(newUser)).pipe(
  //         map((user: User) => {
  //           if (
  //             this.mailService.sendUserConfirmation(
  //               newUser.confirmToken,
  //               newUser.name,
  //               newUser.email,
  //             )
  //           ) {
  //             const { password, ...result } = user;
  //             return result;
  //           }
  //         }),
  //         catchError((err) => throwError(err)),
  //       );
  //     }),
  //   );
  // }

  async testEmail(): Promise<any> {
    // return 'Hello bro';
    // return this.mailService.sendUserConfirmation(
    //   'token',
    //   'name',
    //   'adlipeeters@gmail.com',
    // );
    return this.mailService.sendBulkEmailExample();
  }

  async create(user: User): Promise<any> {
    const userExists = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (userExists != null) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const newUser = new UserEntity();
      newUser.name = user.name;
      newUser.username = user.username;
      newUser.email = user.email;
      newUser.password = await this.authService.hashPassword(user.password);
      newUser.role = UserRole.USER;
      await this.userRepository.save(newUser);
      return { message: 'User created successfully' };
    } catch (error) {
      throw new Error('Failed to create user. Please try again later.');
    }
  }

  findOne(id: number): Observable<User | string> {
    return from(
      this.userRepository.findOne({
        where: { id: id },
        // relations: ['blogEntries'],
      }),
    ).pipe(
      map((user: User) => {
        if (user) {
          const { password, ...result } = user;
          return result;
        }
      }),
    );
  }

  // find with async version

  async findById(id: number): Promise<any> {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users) => {
        users.forEach(function (v) {
          delete v.password;
          delete v.confirmToken;
        });
        return users;
      }),
    );
  }

  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepository, options)).pipe(
      map((usersPageable: Pagination<User>) => {
        usersPageable.items.forEach(function (v) {
          delete v.password;
        });
        return usersPageable;
      }),
    );
  }

  paginateFilterByUsername(
    options: IPaginationOptions,
    user: User,
  ): Observable<Pagination<User>> {
    return from(
      this.userRepository.findAndCount({
        skip: Number(options.page) * Number(options.limit) || 0,
        take: Number(options.limit) || 10,
        order: { id: 'ASC' },
        select: ['id', 'name', 'username', 'email', 'role'],
        relations: ['blogEntries'],
        where: [{ username: Like(`%${user.username}%`) }],
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        const usersPageable: Pagination<User> = {
          items: users,
          links: {
            first: options.route + `?limit=${options.limit}`,
            previous: options.route + ``,
            next:
              options.route +
              `?limit=${options.limit}&page=${Number(options.page) + 1}`,
            last:
              options.route +
              `?limit=${options.limit}&page=${Math.ceil(
                totalUsers / Number(options.limit),
              )}`,
          },
          meta: {
            currentPage: Number(options.page),
            itemCount: users.length,
            itemsPerPage: Number(options.limit),
            totalItems: totalUsers,
            totalPages: Math.ceil(totalUsers / Number(options.limit)),
          },
        };
        return usersPageable;
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  async updateOne(id: number, user: User): Promise<any> {
    // delete user.email;
    delete user.password;
    delete user.role;
    // delete user.profileImage;
    // return this.findOne(id);
    // console.log(user.profileImage);

    return await this.userRepository.update(id, user);
  }

  async confirmAccount(id: number, user: User) {
    console.log(user);
    const currentUser = await this.userRepository.findOne({
      where: { id: id },
    });
    if (
      currentUser.confirmToken == user.confirmToken &&
      currentUser.isConfirmed == 0
    ) {
      const confirmAcc = await this.userRepository.update(id, {
        isConfirmed: 1,
      });
      if (confirmAcc) {
        return true;
      }
    } else if (currentUser.isConfirmed == 1) {
      throw new HttpException(
        'This account is already confirmed',
        HttpStatus.FORBIDDEN,
      );
    } else {
      throw new HttpException('Error', HttpStatus.FORBIDDEN);
    }
  }

  updateRoleOfUser(id: number, user: User): Observable<any> {
    return from(this.userRepository.update(id, user));
  }

  // updatePassword(id, user) {
  // return from(
  //   this.userRepository.findOne({
  //     where: { id: id },
  //     select: ['password'],
  //   }),
  // ).pipe(
  //   switchMap((user) =>
  //     this.authService.comparePasswords(password, user.password).pipe(
  //       map((match: boolean) => {
  //         return match;
  //       }),
  //     ),
  //   ),
  // );
  //----------------
  // return this.validateUserPasswords(id, user.oldPassword).pipe(
  //   switchMap((match) => {
  //     if (match) {
  //       return from(this.authService.hashPassword(user.newPassword)).pipe(
  //         map((hash) => {
  //           return this.userRepository.update(id, { password: hash });
  //         }),
  //       );
  //     } else {
  //       throw new HttpException('Not found', HttpStatus.FORBIDDEN);
  //     }
  //   }),
  // );
  // }

  async updatePassword(id, user) {
    const dbUser = await this.userRepository.findOne({
      where: { id: id },
      select: ['password'],
    });

    if (!dbUser) {
      throw new BadRequestException('user Not Found');
    }

    const verifyPassword = await this.authService.comparePasswords(
      user.oldPassword,
      dbUser.password,
    );
    if (verifyPassword) {
      const newPassword = await this.authService.hashPassword(user.newPassword);
      try {
        const isPassUpdated = await this.userRepository.update(id, {
          password: newPassword,
        });
        if (isPassUpdated) {
          const user = await this.userRepository.findOne({ where: { id: id } });
          this.notificationService.create(user, {
            name: 'Password Change',
            type: NotificationType.PASSWORD_CHANGE,
            description: 'Your password was recently changed',
          });
          return true;
        }
        // return this.userRepository.update(id, { password: newPassword });
      } catch (error) {
        throw new BadRequestException('Something went wrong');
      }
    } else {
      throw new BadRequestException('Invalid old password');
    }
  }

  async login(user: User): Promise<any> {
    const db_user = await this.validateUser(user.email, user.password);
    if (db_user) {
      const access_token = await this.authService.generateJWT(db_user);
      console.log(access_token, db_user);
      return { access_token, user: db_user };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: email },
      select: [
        'id',
        'password',
        'name',
        'username',
        'email',
        'role',
        'profileImage',
      ],
      relations: ['subscription'],
    });

    if (user != null) {
      const passwCheck = await this.authService.comparePasswords(
        password,
        user.password,
      );
      if (passwCheck) {
        const { password, ...result } = user;
        return result;
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      throw new NotFoundException('User not found');
    }
  }

  validateUserPasswords(id: number, password: string): Observable<any> {
    // return from(
    //   this.userRepository.findOne({
    //     where: { id: id },
    //     select: ['password'],
    //   }),
    // ).pipe(
    //   switchMap((user) =>
    //     this.authService.comparePasswords(password, user.password).pipe(
    //       map((match: boolean) => {
    //         return match;
    //       }),
    //     ),
    //   ),
    // );
    return;
  }

  findByEmail(email: string): Observable<User> {
    return from(this.userRepository.findOneBy({ email }));
  }
}
