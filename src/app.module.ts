import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ConfigModule } from '@nestjs/config';

import { getDatabaseConfig } from './configs';
import {
  HealthModule,
  AuthModule,
  UserModule,
  CoursesModule,
  CardsModule,
  LoggerModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    LoggerModule,
    HealthModule,
    UserModule,
    AuthModule,
    CoursesModule,
    CardsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
