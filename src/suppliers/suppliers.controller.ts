import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SuppliersService } from "./suppliers.service";
import MultiTenantGuard, { SECURITY, SECURITY_KEY } from "src/auth/guards/multi-tenant.guard";
import { ROLE } from "src/user_roles/entities/user_role.entity";
import { Tenant } from "src/tenants/entities/tenant.entity";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { PageOptionsDto } from "src/pagination/dtos";
import { Supplier } from "./entities/suppliers.entity";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { TasksService } from "src/tasks/tasks.service";
import { UpdateSupplierAttachmentsDto, UpdateSingleSupplierAttachmentDto } from "./dto/update-supplier-attachment.dto";
import { CreateSupplierAttachmentsDto } from "./dto/create-supplier-attachment.dto";
import { UpdateSupplierNoteDto } from "./dto/update-supplier-note.dto";
import { CreateSupplierNoteDto } from "./dto/create-supplier-note.dto";
import { UpdateSingleSupplierNoteDto } from "./dto/update-single-supplier-note.dto";
@ApiBearerAuth()
@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private suppliersService: SuppliersService,
    private tasksService: TasksService,
  ) {}

  
  @Post()
  @ApiOperation({ summary: 'Create a supplier.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If tenant does not exit.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_BODY, SECURITY_KEY.TENANT_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  create(
    @Param('guard_Tenant') tenant: Tenant,
    @Body() createDto: CreateSupplierDto,
  ) {
    console.log(tenant);
    return this.suppliersService.create(tenant, createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If tenant does not exit.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getSupplierById(@Param('guard_Supplier') supplier: Supplier) {
    return this.suppliersService.getSupplierById(supplier);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If supplier or tenant do not exit.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updateSupplier(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Body() updateDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.updateSupplierById(supplier, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete supplier by Id.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  removeSupplierById(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
  ) {
    return this.suppliersService.removeSupplierById(supplier, id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get tasks by supplier ID.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If supplier or tenant do not exit.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getTasksBySupplier(@Param('guard_Supplier') supplier: Supplier, @Query() pageOptionsDto: PageOptionsDto) {
    return this.tasksService.getTasksBySupplier(supplier.id, pageOptionsDto);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Get all attachments for a supplier' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getAttachments(@Param('guard_Supplier') supplier: Supplier, @Param('id') id: string) {
    return this.suppliersService.getSupplierAttachments(+id);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get all notes for a supplier' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getNotes(@Param('guard_Supplier') supplier: Supplier, @Param('id') id: string) {
    return this.suppliersService.getSupplierNotes(+id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Create a new note for a supplier' })
  @ApiResponse({ status: 201, description: 'If the note was created successfully.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UsePipes(ValidationPipe)
  createSupplierNote(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Body() createDto: CreateSupplierNoteDto,
  ) {
    return this.suppliersService.createSupplierNote(
      id,
      supplier,
      createDto,
    );
  }

  @Patch(':id/notes/:noteId')
  @ApiOperation({ summary: 'Update a specific supplier note' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UsePipes(ValidationPipe)
  updateSingleSupplierNote(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Param('noteId') noteId: string,
    @Body() updateDto: UpdateSingleSupplierNoteDto,
  ) {
    return this.suppliersService.updateSingleSupplierNote(
      id,
      +noteId,
      updateDto,
    );
  }

  @Delete(':id/notes/:noteId')
  @ApiOperation({ summary: 'Delete a specific supplier note' })
  @ApiResponse({ status: 200, description: 'If the note was deleted successfully.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  deleteSupplierNote(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Param('noteId') noteId: string,
  ) {
    return this.suppliersService.deleteSupplierNote(id, +noteId);
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update supplier notes by Id (bulk operation).' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updateSupplierNotes(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Body() updateDto: UpdateSupplierNoteDto,
  ) {
    return this.suppliersService.updateSupplierNoteById(
      id,
      supplier,
      updateDto,
    );
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Create new supplier attachments' })
  @ApiResponse({ status: 201, description: 'If the attachments were created successfully.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UsePipes(ValidationPipe)
  createSupplierAttachments(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Body() createDto: CreateSupplierAttachmentsDto,
  ) {
    return this.suppliersService.createSupplierAttachments(
      id,
      supplier,
      createDto,
    );
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete a specific supplier attachment' })
  @ApiResponse({ status: 200, description: 'If the attachment was deleted successfully.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  deleteSupplierAttachment(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.suppliersService.deleteSupplierAttachment(id, +attachmentId);
  }

  @Patch(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Update a single supplier attachment' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Supplier, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  @UsePipes(ValidationPipe)
  updateSingleSupplierAttachment(
    @Param('guard_Supplier') supplier: Supplier,
    @Param('id') id: number,
    @Param('attachmentId') attachmentId: string,
    @Body() updateDto: UpdateSingleSupplierAttachmentDto,
  ) {
    return this.suppliersService.updateSingleSupplierAttachment(
      id,
      +attachmentId,
      updateDto,
    );
  }
}   
