import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import * as moment from 'moment';

import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus, TaskPriority, TaskCategory } from './entities/task.entity';
import { Property } from '../properties/entities/property.entity';
import { PageOptionsDto } from '../pagination/dtos';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageDto } from 'src/pagination/page.dto';
import { configQuery, getPaginationKeys, DURATION, ATACHMENT_TYPE } from 'src/Utils/utils';
import { TaskAttachment } from './entities/task-attachments.entity';
import { Supplier } from '../suppliers/entities/suppliers.entity';
import { EmailService } from '../Utils/EmailService';
import { ConfigService } from '@nestjs/config';
import { CreateTaskAttachmentsDto } from './dto/create-task-attachment.dto';
import { UpdateSingleTaskAttachmentDto } from './dto/update-task-attachment.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(TaskAttachment)
    private taskAttachmentRepository: Repository<TaskAttachment>,
    @InjectRepository(Supplier) private supplierRepository: Repository<Supplier>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    tenant: Tenant,
    property: Property,
    createTaskDto: CreateTaskDto,
  ) {
    const task = new Task();
    task.description = createTaskDto.description;
    task.priority = createTaskDto.priority;
    task.status = createTaskDto.status;
    task.started_at = createTaskDto.started_at;
    task.deadline_at = createTaskDto.deadline_at;
    task.property = property;
    task.tenant = tenant;
    task.category = createTaskDto.category;
    task.subCategory = createTaskDto.subCategory;

    // Handle attachments if they're provided
    if (createTaskDto.attachments && createTaskDto.attachments.length > 0) {
      task.attachments = createTaskDto.attachments.map((attachment) => {
        const taskAttachment = new TaskAttachment();
        taskAttachment.url = attachment;
        return taskAttachment;
      });
    }

    await task.save();
    return task;
  }

  async configRelative(queryBuilder: SelectQueryBuilder<Task>) {
    const query = await queryBuilder
      .leftJoinAndSelect('task.tenant', 'tenant')
      .leftJoinAndSelect('task.property', 'property');
    return query;
  }

  async getAllTasks(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.taskRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'task',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.taskRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getTasksByTenant(tenantId: number, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.taskRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'task',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.taskRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getTasksRecentByTenant(tenantId: number, duration: string) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    let query = await this.configRelative(queryBuilder);
    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.taskRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'task',
      pageDtoKeys,
      entityFields,
      {},
      this.taskRepository.metadata,
      query,
    );

    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    query = query.andWhere('task.status IN (:...statuses)', {
      statuses: [
        TaskStatus.OPEN,
        TaskStatus.IN_PROGRESS,
        TaskStatus.COMPLETED,
      ],
    });

    if (duration == DURATION.Today) {
      query = query.andWhere('task.created_at >= :today', {
        today: moment().add(-1, 'day').endOf('day'),
      });
    } else if (duration == DURATION.Week) {
      query = query.andWhere('task.created_at >= :today', {
        today: moment().add(-7, 'day').endOf('day'),
      });
    } else if (duration == DURATION.Month) {
      query = query.andWhere('task.created_at >= :today', {
        today: moment().add(-30, 'day').endOf('day'),
      });
    }

    console.log('duration', duration);
    console.log('query', query.getQueryAndParameters());

    const entities = await query.limit(6).getMany();
    return entities;
  }

  async getTasksBySupplier(supplierId: number, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.taskRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'task',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.taskRepository.metadata,
      query,
    );
    query = query.leftJoinAndSelect('task.supplier', 'supplier');
    query = query.andWhere('supplier.id = :supplierId', {
      supplierId: supplierId,
    });
    const entities = await query.getMany();
    const itemCount = await query.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getTasksByProperty(propertyId: number, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.taskRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'task',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.taskRepository.metadata,
      query,
    );
    query = query.andWhere('property.id = :propertyId', {
      propertyId: propertyId,
    });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getTaskById(task: Task, id: number) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    return queryBuilder
      .leftJoinAndSelect('task.property', 'property')
      .leftJoinAndSelect('task.tenant', 'tenant')
      .leftJoinAndSelect('task.supplier', 'supplier')
      .where('task.id = :id', { id })
      .getOne();
  }

  async removeTaskById(task: Task, id: number) {
    await this.taskRepository.delete(id);
    return 'Task was deleted.';
  }

  async updateTaskById(task: Task, id: number, updateTaskDto: UpdateTaskDto) {
    console.log('updateTaskDto', updateTaskDto);
    console.log('task', task);
    
    // Create a new object with only the fields that exist on the Task entity
    const { propertyId, supplierId, ...taskDataToUpdate } = updateTaskDto;
    
    // Update task status if scheduled_at is provided and current status is OPEN
    if (updateTaskDto.scheduled_at && task.status === TaskStatus.OPEN) {
      taskDataToUpdate.status = TaskStatus.IN_PROGRESS;
    }
    
    // Update task properties
    await this.taskRepository.update(id, taskDataToUpdate);
    
    // Handle supplier relationship if provided
    let supplier: Supplier | null = null;
    if (supplierId !== undefined) {
      supplier = await this.supplierRepository.findOne({
        where: { id: supplierId },
      });
      
      if (supplier) {
        await this.taskRepository.createQueryBuilder()
          .relation(Task, "supplier")
          .of(id)
          .set(supplier.id);
      }
    }
    
    // Handle property relationship if provided
    let property: Property | null = null;
    if (propertyId !== undefined) {
      property = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });
      
      if (property) {
        await this.taskRepository.createQueryBuilder()
          .relation(Task, "property")
          .of(id)
          .set(property.id);
      }
    }
    
    // Get the updated task with all relations for email
    const updatedTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['supplier', 'property', 'tenant'],
    });
    
    // Send email if task has a scheduled date and supplier
    if (updateTaskDto.scheduled_at && updatedTask?.supplier && updatedTask?.scheduled_at) {
      await this.sendTaskScheduledEmail(updatedTask);
    }
    
    return 'Task was updated';
  }

  private getPriorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Laag';
      case TaskPriority.MEDIUM:
        return 'Gemiddeld';
      case TaskPriority.HIGH:
        return 'Hoog';
      default:
        return 'Onbekend';
    }
  }

  private getCategoryLabel(category: TaskCategory): string {
    switch (category) {
      case TaskCategory.TECHNICAL:
        return 'Technisch';
      case TaskCategory.MAINTENANCE:
        return 'Onderhoud';
      case TaskCategory.CLEANING:
        return 'Schoonmaak';
      case TaskCategory.OTHER:
        return 'Overig';
      default:
        return 'Onbekend';
    }
  }

  private async sendTaskScheduledEmail(task: Task): Promise<void> {
    try {
      const supplierEmail = task.supplier.contact?.email || task.supplier.invoice_email;
      const supplierName = task.supplier.contact?.name || task.supplier.company_name;
      
      if (!supplierEmail) {
        console.error(`No email found for supplier ${task.supplier.id}`);
        return;
      }

      const templateId = this.configService.get('SEND_GRID_SUPPLIER_SCHEDULE');
      const fromEmail = this.configService.get('SEND_GRID_FROM');
      
      // Check required configuration
      if (!templateId) {
        console.error('SEND_GRID_SUPPLIER_SCHEDULE environment variable is not set');
        return;
      }
      
      if (!fromEmail) {
        console.error('SEND_GRID_FROM environment variable is not set');
        return;
      }

      const scheduledDate = moment(task.scheduled_at);
      
      // Build tenant address if available
      const tenantAddress = task.tenant.street && task.tenant.housenumber 
        ? `${task.tenant.street} ${task.tenant.housenumber}${task.tenant.extensions ? task.tenant.extensions : ''}, ${task.tenant.zipcode} ${task.tenant.city}`.trim()
        : null;
      
      const emailData = {
        supplier_name: supplierName,
        task_description: task.description,
        street: task.property.street,
        house_number: task.property.house_number,
        extension: task.property.extension || '',
        zip_code: task.property.zip_code,
        city: task.property.city,
        scheduled_date: scheduledDate.format('DD-MM-YYYY'),
        scheduled_time: scheduledDate.format('HH:mm'),
        priority_label: this.getPriorityLabel(task.priority),
        task_category: this.getCategoryLabel(task.category),
        deadline_date: task.deadline_at ? moment(task.deadline_at).format('DD-MM-YYYY') : null,
        task_id: task.id.toString(),
        // Tenant details
        tenant_name: task.tenant.name,
        tenant_email: task.tenant.email,
        tenant_phone: task.tenant.phone || null,
        tenant_mobile: task.tenant.mobile || null,
        tenant_address: tenantAddress,
      };

      const subject = 'Nieuwe taak toegewezen';
      const text = 'Er is een nieuwe taak aan u toegewezen';

      // Log email configuration for debugging
      console.log('Sending email with config:', {
        to: supplierEmail,
        from: fromEmail,
        templateId,
        hasApiKey: !!this.configService.get('SEND_GRID_KEY'),
        apiKeyPrefix: this.configService.get('SEND_GRID_KEY')?.substring(0, 10) + '...',
      });

      const sent = await this.emailService.sendEmail(
        supplierEmail,
        subject,
        text,
        emailData,
        templateId,
        task.tenant.email,
      );

      if (sent) {
        console.log(`Task scheduled email sent successfully to ${supplierEmail} for task ${task.id}`);
      } else {
        console.error(`Failed to send task scheduled email to ${supplierEmail} for task ${task.id}`);
      }
    } catch (error) {
      console.error('Error sending task scheduled email:', error);
      if (error.response?.body?.errors) {
        console.error('SendGrid errors:', error.response.body.errors);
      }
      
      // Provide specific error guidance
      if (error.code === 401) {
        console.error('🚨 SendGrid 401 Error - Check:');
        console.error('1. API key is valid and has Mail Send permissions');
        console.error('2. Sender email is verified in SendGrid dashboard');
        console.error('3. Template ID exists and is active');
      }
    }
  }
  
  async getOpenTasksCountByTenant(tenantId: number): Promise<number> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    return await queryBuilder
      .where('task.tenant.id = :tenantId', { tenantId })
      .andWhere('task.status = :status', { status: TaskStatus.OPEN })
      .getCount();
  }

  async getCompletedTasksCountByTenant(tenantId: number): Promise<number> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    return await queryBuilder
      .where('task.tenant.id = :tenantId', { tenantId })
      .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
      .getCount();
  }

  async getInProgressTasksCountByTenant(tenantId: number): Promise<number> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    return await queryBuilder
      .where('task.tenant.id = :tenantId', { tenantId })
      .andWhere('task.status = :status', {
        status: TaskStatus.IN_PROGRESS,
      })
      .getCount();
  }

  async updateExpiredOpenTasks() {
    const currentTime = new Date();

    const tasksToUpdate = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.status IN (:...statuses)', {
        statuses: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS],
      })
      .andWhere('task.deadline_at IS NOT NULL')
      .andWhere('task.deadline_at < :currentTime', {
        currentTime,
      })
      .getMany();

    for (const task of tasksToUpdate) {
      task.status = TaskStatus.COMPLETED;
      await this.taskRepository.save(task);
    }
  }

  async getTaskAttachments(taskId: number) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['attachments'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task.attachments;
  }

  async createTaskAttachments(
    taskId: number,
    createAttachmentsDto: CreateTaskAttachmentsDto,
  ) {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const attachmentEntities = createAttachmentsDto.attachments.map(dto => {
      let attachmentType = ATACHMENT_TYPE.FILE;
      if (dto.type) {
        attachmentType = dto.type;
      } else if (dto.mimeType && dto.mimeType.startsWith('image/')) {
        attachmentType = ATACHMENT_TYPE.IMAGE;
      }

      return this.taskAttachmentRepository.create({
        ...dto,
        mimeType: dto.mimeType || '',
        size: dto.size || 0,
        description: dto.description,
        url: dto.url,
        type: attachmentType,
        task: task,
      });
    });

    if (attachmentEntities.length > 0) {
      await this.taskAttachmentRepository.save(attachmentEntities);
    }

    return { message: 'Task attachments were added successfully', attachments: attachmentEntities };
  }

  async deleteTaskAttachment(taskId: number, attachmentId: number) {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const attachment = await this.taskAttachmentRepository.findOneBy({
      id: attachmentId,
      task: { id: taskId },
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found for task ${taskId}`,
      );
    }

    await this.taskAttachmentRepository.delete(attachmentId);
    return { message: 'Task attachment deleted successfully' };
  }

  async updateSingleTaskAttachment(
    taskId: number, 
    attachmentId: number, 
    updateDto: UpdateSingleTaskAttachmentDto
  ) {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const attachment = await this.taskAttachmentRepository.findOneBy({
      id: attachmentId,
      task: { id: taskId },
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found for task ${taskId}`,
      );
    }

    if (updateDto.description !== undefined) {
      attachment.description = updateDto.description;
    }
    if (updateDto.type !== undefined) {
      attachment.type = updateDto.type;
    }

    await this.taskAttachmentRepository.save(attachment);
    return attachment;
  }
}

