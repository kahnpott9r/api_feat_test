import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmSQLITETestingModule = () => [
  TypeOrmModule.forRoot({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    entities: ['src/**/*.entity.ts'],
    logging: true,
    synchronize: true,
    autoLoadEntities: true,
  }),
];
