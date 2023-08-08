import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
  Req,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { join } from 'path';
import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';
import { Response } from 'express';
import { JwtExpiration } from 'src/auth/guards/jwt-expiration';
// import { Request as ExpressRequest } from 'express';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};

interface AuthenticatedRequest extends Request {
  user: any;
}

@Controller('users')
export class ControllerController {
  constructor(private userService: UserService) { }

  @Post('register')
  // eslint-disable-next-line @typescript-eslint/ban-types
  async create(@Body() user: User): Promise<any> {
    return this.userService.create(user);
  }

  @Post('login')
  // eslint-disable-next-line @typescript-eslint/ban-types
  async login(
    @Body() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const res = await this.userService.login(user);

    response.cookie('jwt', res.access_token, {
      httpOnly: true,
    });
    response.cookie('logged_in', true);

    return { userInfo: res.user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    response.clearCookie('logged_in');
  }

  // @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param() params,
    @Req() request: AuthenticatedRequest,
  ): Observable<User | string> {
    // console.log(request.user);
    // return this.userService.findOne(params.id);
    return this.userService.findOne(request.user.id);
  }

  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get()
  // index(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  //   @Query('username') username: string,
  // ): Observable<Pagination<User>> {
  //   limit = limit > 100 ? 100 : limit;

  //   if (username === null || username === undefined) {
  //     return this.userService.paginate({
  //       page: Number(page),
  //       limit: Number(limit),
  //       route: 'http://localhost:3000/users',
  //     });
  //   } else {
  //     return this.userService.paginateFilterByUsername(
  //       {
  //         page: Number(page),
  //         limit: Number(limit),
  //         route: 'http://localhost:3000/api/users',
  //       },
  //       { username },
  //     );
  //   }
  // }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  index(): Observable<User[]> {
    return this.userService.findAll();
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<User> {
    return this.userService.deleteOne(Number(id));
  }

  // @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  // @UseInterceptors(FileInterceptor('file', storage))
  updateOne(
    // @UploadedFile() file,
    @Param('id') id: string,
    @Body() user: User,
  ): Promise<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @Put('confirm-profile/:id')
  confirmAccount(@Param('id') id: string, @Body() user: User): any {
    return this.userService.confirmAccount(Number(id), user);
  }

  // @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @UseGuards(JwtAuthGuard)
  // @Put('reset-password/:id')
  @Post('reset-password')
  async updatePassword(@Param() params, @Body() user, @Request() req) {
    return this.userService.updatePassword(Number(req.user.id), user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Put(':id/role')
  updateRoleOfUser(
    @Param('id') id: string,
    @Body() user: User,
  ): Observable<User> {
    return this.userService.updateRoleOfUser(Number(id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req) {
    const user: User = req.user;
    // console.log(user.id, file.filename);
    return this.userService.updateOne(user.id, { profileImage: file.filename });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile-image/:imagename')
  async findProfileImage(
    @Param('imagename') imagename,
    @Res() res,
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<any> {
    // console.log(imagename);
    // return of(
    //   res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)),
    // );
    let file = null
    const user = await this.userService.findById(req.user.id);
    res.sendFile(
      join(process.cwd(), 'uploads/profileimages/' + user.profileImage),
    );
  }

  @Post('test-email')
  // eslint-disable-next-line @typescript-eslint/ban-types
  async test(): Promise<any> {
    return this.userService.testEmail();
  }
}
