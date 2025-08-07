import { Module } from '@nestjs/common';
import { EarnEService } from './earn-e.service';
import { EarnEController } from './earn-e.controller';
import { CustomRMQClient } from './custom-rmq-server';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { EarnEProperty } from './entities/earn-e-property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, EarnEProperty])],
  providers: [
    EarnEService,
    {
      provide: 'RABBITMQ_SERVICE',
      useFactory: () => {
        return new CustomRMQClient({
          urls: [
            `amqps://dd_project_1-pl:5YU9u6ypTnqLA7yJMK@large-coral-jaguar.rmq4.cloudamqp.com/dd_project_1`,
          ],
          heartbeat: 0,
          queue: 'dd_project_1_cache_3',
        });
      },
    },
  ],
  controllers: [EarnEController],
})
export class EarnEModule {}
