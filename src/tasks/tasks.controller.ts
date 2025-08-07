import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import { RoleGuard } from '../auth/guards/role.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from 'src/auth/guards/multi-tenant.guard';
import { Task } from './entities/task.entity';
import { Property } from '../properties/entities/property.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PageOptionsDto } from 'src/pagination/dtos';
import { ValidationPipe } from '@nestjs/common/pipes';
import { UpdateTaskAttachmentsDto, UpdateSingleTaskAttachmentDto } from './dto/update-task-attachment.dto';
import { CreateTaskAttachmentsDto } from './dto/create-task-attachment.dto';

@ApiBearerAuth()
@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_BODY, SECURITY_KEY.TENANT_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_BODY, SECURITY_KEY.PROPERTY_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  create(
    @Param('guard_Tenant') tenant: Tenant,
    @Param('guard_Property') property: Property,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(tenant, property, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all task.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  @UsePipes(ValidationPipe)
  getAllTask(@Query() pageOptionsDto: PageOptionsDto) {
    return this.tasksService.getAllTasks(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by Id.' })
  @UseGuards(
    MultiTenantGuard(Task, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getTaskById(@Param('guard_Task') task: Task, @Param('id') id: number) {
    return this.tasksService.getTaskById(task, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task by Id.' })
  @UseGuards(
    MultiTenantGuard(Task, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  removeTaskById(@Param('guard_Task') task: Task, @Param('id') id: number) {
    return this.tasksService.removeTaskById(task, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task by Id.' })
  @UseGuards(
    MultiTenantGuard(Task, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UsePipes(ValidationPipe)
  update(
    @Param('guard_Task') task: Task,
    @Param('id') id: number,
    @Body() updateTenantDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTaskById(task, id, updateTenantDto);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Add new attachments to a task' })
  @ApiResponse({ status: 201, description: 'If the attachments were added successfully.' })
  @UseGuards(
    MultiTenantGuard(Task, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UsePipes(ValidationPipe)
  createTaskAttachments(
    @Param('id') id: number,
    @Body() createDto: CreateTaskAttachmentsDto,
  ) {
    return this.tasksService.createTaskAttachments(
      id,
      createDto,
    );
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Get all attachments for a task' })
  @UseGuards(
    MultiTenantGuard(Task, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getAttachments(@Param('guard_Task') task: Task, @Param('id') id: string) {
    return this.tasksService.getTaskAttachments(+id);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete an attachment from a task' })
  @UseGuards(
    MultiTenantGuard(Task, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  deleteAttachment(
    @Param('guard_Task') task: Task,
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.tasksService.deleteTaskAttachment(+id, +attachmentId);
  }

  @Patch(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Update a single task attachment' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Task, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UsePipes(ValidationPipe)
  updateSingleTaskAttachment(
    @Param('id') id: number,
    @Param('attachmentId') attachmentId: number,
    @Body() updateDto: UpdateSingleTaskAttachmentDto,
  ) {
    return this.tasksService.updateSingleTaskAttachment(
      id,
      attachmentId,
      updateDto,
    );
  }
}
