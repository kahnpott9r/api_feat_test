import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AgreementsModule } from './agreements/agreements.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EarnEModule } from './earn-e/earn-e.module';
import { ExactOnlineModule } from './exact-online/exact-online.module';
import { FinanceModule } from './finance/finance.module';
import { LogisticalItemsModule } from './logistical_items/logistical_items.module';
import { MortgageLineModule } from './mortgage_lines/mortgage-line.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentNotifyModule } from './payment_notify/payment_notify.module';
import { PropertiesModule } from './properties/properties.module';
import { RentersModule } from './renters/renters.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { TasksModule } from './tasks/tasks.module';
import { TaxCodesModule } from './tax_codes/tax_codes.module';
import { TenantsModule } from './tenants/tenants.module';
import { dbConfig } from './typeOrm.config';
import { UserRolesModule } from './user_roles/user_roles.module';
import { UsersModule } from './users/users.module';

console.log('Environment:', process.env.NODE_ENV);
console.log('Database Host:', process.env.DB_HOST ? 'Set' : 'Not set');
console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET ? 'Set' : 'Not set');

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      // For Railway, remove envFilePath or make it conditional
      envFilePath: process.env.NODE_ENV === 'local' ? ['.env.local', '.env'] : undefined,
      // Railway injects env vars directly, no file needed
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_USERNAME: Joi.string().required(), 
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
        RESET_TOKEN_SECRET: Joi.string().required(),
        RESET_TOKEN_EXPIRATION: Joi.string().required(),
        NODE_ENV: Joi.string().valid('local', 'development', 'production').default('development'),
        PORT: Joi.number().default(3000),
        ENVIRONMENT: Joi.string().default('development'),
      }),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => dbConfig(configService),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'nl',
      loaderOptions: {
        path: path.join(__dirname, './i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ExactOnlineModule,
    AuthModule,
    UsersModule,
    TasksModule,
    TenantsModule,
    PaymentModule,
    UserRolesModule,
    PropertiesModule,
    RentersModule,
    TaxCodesModule,
    LogisticalItemsModule,
    AgreementsModule,
    FinanceModule,
    SchedulerModule,
    PaymentNotifyModule,
    NotificationModule,
    MortgageLineModule,
    SuppliersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}