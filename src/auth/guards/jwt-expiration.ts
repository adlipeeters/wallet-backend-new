import {
  Injectable,
  CanActivate,
  Inject,
  forwardRef,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/models/user.interface';
import { map } from 'rxjs/operators';

@Injectable()
export class JwtExpiration implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
    // ): boolean | Promise<boolean> | Observable<boolean> {
  ): any {
    const request = context.switchToHttp().getRequest();
    console.log('adasdsdasa');
    return true;
    // const params = request.params;
    // const user: User = request.user;

    // return this.userService.findOne(user.id).pipe(
    //   map((user: User) => {
    //     let hasPermission = false;

    //     if (user.id === Number(params.id)) {
    //       hasPermission = true;
    //     }
    //     return user && hasPermission;
    //   }),
    // );
  }
}
