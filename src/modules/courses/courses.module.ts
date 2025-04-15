import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '@/modules/users';

import { CoursesMapper } from './courses.mapper';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesMapper],
  exports: [CoursesService],
})
export class CoursesModule {}
