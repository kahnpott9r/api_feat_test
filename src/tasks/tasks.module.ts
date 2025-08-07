import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Property } from '../properties/entities/property.entity';
import { TaskAttachment } from './entities/task-attachments.entity';
import { Supplier } from '../suppliers/entities/suppliers.entity';
import { EmailService } from '../Utils/EmailService';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Tenant, Property, TaskAttachment, Supplier])],
  providers: [TasksService, EmailService, ConfigService],
  controllers: [TasksController],
})
export class TasksModule {}
