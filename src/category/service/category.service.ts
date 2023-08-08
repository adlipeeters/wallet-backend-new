import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { In, Repository } from 'typeorm';
import { Category } from '../model/category.entity';
import { CategoryEntry } from '../model/category.interface';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(user: User, category: CategoryEntry): Observable<CategoryEntry> {
    category.user = user;
    return from(this.categoryRepository.save(category));
  }

  updateOne(id: number, category: CategoryEntry): Observable<CategoryEntry> {
    return from(this.categoryRepository.update(id, category)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  findOne(id: number): Observable<CategoryEntry> {
    return from(
      this.categoryRepository.findOne({
        where: {
          id: id,
        },
      }),
    );
  }

  findAll(): Observable<CategoryEntry[]> {
    return from(
      this.categoryRepository.find({
        where: {
          // status: 1,
          status: In([1, 2]),
        },
        order: {
          id: 'DESC',
        },
      }),
    ).pipe(
      map((categories) => {
        return categories;
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.categoryRepository.update(id, { status: 0 }));
  }
}
