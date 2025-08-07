import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';

// Only load dotenv in local development
if (process.env.NODE_ENV === 'local' || !process.env.NODE_ENV) {
  require('dotenv').config();
}
console.log("DB detail=====>", process.env.DB_PASSWORD)
export const dbConfig = (configService: ConfigService): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // For Railway/production, use SSL
  ...(configService.get('NODE_ENV') === 'production'
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
    
  synchronize: false, // Never true in prod
  entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
  migrationsRun: false,
  //migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  logging: configService.get('NODE_ENV') !== 'production' ? ['error', 'warn'] : false,
  namingStrategy: new SnakeNamingStrategy(),
});

const configService = new ConfigService();
const dataSource = new DataSource(dbConfig(configService));

// Add connection event listeners
dataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully!');
    console.log(`🔧 Database Type: ${dataSource.options.type}`);
    console.log(`🏗️  Synchronize: ${dataSource.options.synchronize}`);
    console.log(`🔗 Connection established at: ${new Date().toISOString()}`);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
  });

export default dataSource;
