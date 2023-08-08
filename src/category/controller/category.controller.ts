import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/models/user.interface';
import { CategoryEntry } from '../model/category.interface';
import { CategoryService } from '../service/category.service';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() category: CategoryEntry,
    @Request() req,
  ): Observable<CategoryEntry> {
    const user = req.user;
    return this.categoryService.create(user, category);
  }

  @Put(':id')
  updateOne(
    @Param() params: CategoryEntry,
    @Body() category: CategoryEntry,
  ): Observable<CategoryEntry> {
    return this.categoryService.updateOne(Number(params.id), category);
  }

  @Get(':id')
  findOne(@Param() params: CategoryEntry): Observable<CategoryEntry> {
    return this.categoryService.findOne(Number(params.id));
  }

  @Get()
  findAll(): Observable<CategoryEntry[]> {
    return this.categoryService.findAll();
  }

  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteOne(@Param() params: CategoryEntry): Observable<any> {
    return this.categoryService.deleteOne(Number(params.id));
  }
}
