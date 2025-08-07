import {
  type DynamicModule,
  type ForwardReference,
  type INestApplication,
  type Type,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import type { DataSource } from 'typeorm';

import { database } from './database';
import * as Joi from 'joi';
import { dbConfig } from '../typeOrm.config';
export async function buildTestApplication(
  ...modules: Array<
    Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [

      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], 
        validationSchema: Joi.object({
          DB_HOST: Joi.string().required(),
          DB_USERNAME: Joi.string().required(),
          DB_PASSWORD: Joi.string().required(),
          DB_NAME: Joi.string().required(),
          ACCESS_TOKEN_SECRET: Joi.string().required(),
          ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
          REFRESH_TOKEN_SECRET: Joi.string().required(),
          REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
        }),
      }),
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => dbConfig(configService),
        dataSourceFactory: (options) =>
          database.adapters.createTypeormDataSource(
            options,
          ) as Promise<DataSource>,
      }),
      ...modules,
    ],
  }).compile();
  const app = module.createNestApplication();

  app.useGlobalPipes(new ValidationPipe());
  useContainer(module, { fallbackOnErrors: true });

  return app.init();
}
