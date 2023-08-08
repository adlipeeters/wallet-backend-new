import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slugify = require('slugify');

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    private userService: UserService,
  ) { }

  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry));
      }),
    );
  }

  findAll(forAll: boolean): Observable<BlogEntry[]> {
    const whereClause = {
      status: 1,
    };

    if (forAll) {
      whereClause['isPublished'] = true;
    }
    return from(
      this.blogRepository.find({
        relations: ['author'],
        where: whereClause,
      }));
  }

  paginateAll(options: IPaginationOptions): Observable<Pagination<BlogEntry>> {
    return from(
      paginate<BlogEntry>(this.blogRepository, options, {
        relations: ['author'],
      }),
    ).pipe(map((blogEntries: Pagination<BlogEntry>) => blogEntries));
  }

  paginateByUser(
    options: IPaginationOptions,
    userId: number,
  ): Observable<Pagination<BlogEntry>> {
    return from(
      paginate<BlogEntry>(this.blogRepository, options, {
        relations: ['author'],
        where: {
          author: {
            id: Number(userId),
          },
        },
      }),
    ).pipe(map((blogEntries: Pagination<BlogEntry>) => blogEntries));
  }

  findByUser(userId: number): Observable<BlogEntry[]> {
    return from(
      this.blogRepository.find({
        where: {
          author: {
            id: Number(userId),
          },
        },
        relations: ['author'],
      }),
    ).pipe(map((blogEntries: BlogEntry[]) => blogEntries));
  }

  findOne(id: number): Observable<BlogEntry> {
    return from(
      this.blogRepository.findOne({
        where: {
          id: id,
        },
        relations: ['author'],
      }),
    );
  }

  updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
    return from(this.blogRepository.update(id, blogEntry)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.blogRepository.update(id, { status: 0 }));
  }

  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }
}
