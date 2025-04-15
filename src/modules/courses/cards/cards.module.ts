import { ConfigModule } from '@nestjs/config';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoursesModule } from '../courses.module';

import { CardsMapper } from './cards.mapper';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { CardEntity } from './entities';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CardEntity]),
    forwardRef(() => CoursesModule),
  ],
  controllers: [CardsController],
  providers: [CardsService, CardsMapper],
  exports: [CardsService],
})
export class CardsModule {}
