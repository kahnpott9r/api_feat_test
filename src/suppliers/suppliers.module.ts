import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliersController } from './suppliers.controller';
import { Supplier } from './entities/suppliers.entity';
import { SuppliersService } from './suppliers.service';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { Property } from 'src/properties/entities/property.entity';
import { TaskAttachment } from 'src/tasks/entities/task-attachments.entity';
import { SupplierAttachment } from './entities/supplier-attachments.entity';
import { EmailService } from 'src/Utils/EmailService';
import { NoteEntity } from 'src/properties/entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Tenant, Task, TaskAttachment, Property, SupplierAttachment, NoteEntity])],
  providers: [SuppliersService, TasksService, EmailService],
  controllers: [SuppliersController],
})
export class SuppliersModule {}
 