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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RoleGuard } from '../auth/guards/role.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';
import { RentersService } from './renters.service';
import { CreateRenterDto } from './dto/create-renter.dto';
import { UpdateRenterDto } from './dto/update-renter.dto';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from '../auth/guards/multi-tenant.guard';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Renter } from './entities/renters.entity';
import { PageOptionsDto } from '../pagination/dtos';
import { UpdateRenterNoteDto } from './dto/update-renter-note.dto';
import { UpdateRenterAttachmentsDto } from './dto/update-renter-attachments.dto';
import { AgreementsService } from '../agreements/agreements.service';

@ApiBearerAuth()
@ApiTags('Renters')
@Controller('renters')
export class RentersController {
  constructor(
    private rentersService: RentersService,
    private agreementsService: AgreementsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a renter.' })
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
    @Body() createDto: CreateRenterDto,
  ) {
    console.log(tenant);
    return this.rentersService.create(tenant.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all renter.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  getAllRenters(@Query() pageOptionsDto: PageOptionsDto) {
    return this.rentersService.getAllRenters(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get renter by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If tenant does not exit.' })
  @UseGuards(
    MultiTenantGuard(Renter, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getRenterById(@Param('guard_Renter') renter: Renter) {
    return this.rentersService.getRenterById(renter);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete renter by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If tenant does not exit.' })
  @UseGuards(
    MultiTenantGuard(Renter, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  removeRenterByTenant(
    @Param('guard_Renter') renter: Renter,
    @Param('id') id: number,
  ) {
    return this.rentersService.removeRenterById(renter, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update renter by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If renter or tenant do not exit.' })
  @UseGuards(
    MultiTenantGuard(Renter, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updateRenter(
    @Param('guard_Renter') renter: Renter,
    @Param('id') id: number,
    @Body() updateDto: UpdateRenterDto,
  ) {
    return this.rentersService.updateRenterById(renter, id, updateDto);
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update renter agreements by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successed.' })
  @UseGuards(
    MultiTenantGuard(Renter, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updatePropertyNotes(
    @Param('guard_Renter') renter: Renter,
    @Param('id') id: number,
    @Body() updateDto: UpdateRenterNoteDto,
  ) {
    return this.rentersService.updateRenterNoteById(id, renter, updateDto);
  }

  @Patch(':id/attachments')
  @ApiOperation({ summary: 'Update renter agreements by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successed.' })
  @UseGuards(
    MultiTenantGuard(Renter, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updatePropertyAttachments(
    @Param('guard_Renter') renter: Renter,
    @Param('id') id: number,
    @Body() updateDto: UpdateRenterAttachmentsDto,
  ) {
    return this.rentersService.updateRenterAttachmentsById(
      id,
      renter,
      updateDto,
    );
  }

  @Get(':id/agreements')
  @ApiOperation({ summary: 'Get renter by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If tenant does not exit.' })
  @UseGuards(
    MultiTenantGuard(Renter, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getAgreementsByRenter(
    @Param('guard_Renter') renter: Renter,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.agreementsService.getAgreementsByRenter(renter, pageOptionsDto);
  }
}
