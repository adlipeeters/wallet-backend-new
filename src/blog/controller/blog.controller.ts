import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';
import { diskStorage } from 'multer';
// import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { Image } from '../model/Image.interface';

import * as fs from 'fs';
import * as path from 'path';

export const BLOG_ENTRIES_URL = 'http://localhost:3000/api/blogs';

export const storage = {
  storage: diskStorage({
    destination: './uploads/blog-entry-images',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', storage))
  create(
    @UploadedFile() file,
    @Body() blogEntry: BlogEntry,
    @Request() req): Observable<BlogEntry> {
    const user = req.user;
    if (file) {
      blogEntry.headerImage = file.filename;
    }
    return this.blogService.create(user, blogEntry);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-articles')
  findBlogEntries(@Query() queryParam): Observable<BlogEntry[]> {
    const publishedArticles = false;
    return this.blogService.findAll(publishedArticles);
  }

  @Get('public-articles')
  findPublicArticles(@Query() queryParam): Observable<BlogEntry[]> {
    const publishedArticles = true;
    return this.blogService.findAll(publishedArticles);
  }

  // @Get()
  // findBlogEntries(@Query() queryParam): Observable<BlogEntry[]> {
  //   if (queryParam == null) {
  //     return this.blogService.findAll();
  //   } else {
  //     return this.blogService.findByUser(Number(queryParam.userId));
  //   }
  // }

  // @Get()
  // index(@Query('page') page = 1, @Query('limit') limit = 10) {
  //   limit = limit > 100 ? 100 : limit;
  //   console.log(page);
  //   console.log(limit);
  //   return this.blogService.paginateAll({
  //     limit: Number(limit),
  //     page: Number(page),
  //     route: BLOG_ENTRIES_URL,
  //   });
  // }

  @Get('user/:user')
  indexByUser(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Param('user') userId: number,
  ) {
    limit = limit > 100 ? 100 : limit;

    return this.blogService.paginateByUser(
      {
        limit: Number(limit),
        page: Number(page),
        route: BLOG_ENTRIES_URL + '/user/' + userId,
      },
      Number(userId),
    );
  }

  // @Get('user/:user')
  // indexByUser(
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  //   @Param('user') userId: number,
  // ) {
  //   limit = limit > 100 ? 100 : limit;

  //   return this.blogService.paginateByUser(
  //     {
  //       limit: Number(limit),
  //       page: Number(page),
  //       route: BLOG_ENTRIES_URL + '/user/' + userId,
  //     },
  //     Number(userId),
  //   );
  // }

  @Get(':id')
  findOne(@Param() params): Observable<BlogEntry> {
    return this.blogService.findOne(Number(params.id));
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', storage))
  updateOne(
    @UploadedFile() file,
    @Param() params,
    @Body() blogEntry: BlogEntry,
  ): Observable<BlogEntry> {
    // console.log('aici ?')
    console.log(file)
    console.log(blogEntry)
    if (file) {
      blogEntry.headerImage = file.filename;
    }
    return this.blogService.updateOne(Number(params.id), blogEntry);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete(':id')
  deleteOne(@Param() params): Observable<any> {
    return this.blogService.deleteOne(params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('image/upload/:id')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(
    @UploadedFile() file,
    @Request() req,
    @Param() params,
  ): Observable<BlogEntry> {
    // const user: User = req.user;
    return this.blogService
      .updateOne(Number(params.id), {
        headerImage: file.filename,
      })
      .pipe(
        map((blogEntry: BlogEntry) => ({ headerImage: blogEntry.headerImage })),
      );
  }

  @Get('image/:imagename')
  // eslint-disable-next-line @typescript-eslint/ban-types
  findImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
    return of(
      res.sendFile(
        join(process.cwd(), 'uploads/blog-entry-images/' + imagename),
      ),
    );
  }
}
