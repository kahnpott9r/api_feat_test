import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RoleGuard } from '../auth/guards/role.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from 'src/auth/guards/multi-tenant.guard';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LogisticalItemsService } from './logistical_items.service';
import { CreateLogisticalItemDto } from './dto/create-logistical-item.dto';
import { Agreement } from 'src/agreements/entities/agreement.entity';
import { LogisticalItem } from './entities/logistical_item.entity';
import { UpdateLogisticalItemDto } from './dto/update-logistical-item.dto';

@ApiBearerAuth()
@ApiTags('LogisticalItems')
@Controller('logistical-items')
export class LogisticalItemsController {
  constructor(private logisticalService: LogisticalItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a logistical item.' })
  @UseGuards(
    MultiTenantGuard(
      Agreement,
      SECURITY.CHECK_BODY,
      SECURITY_KEY.AGREEMENT_ID,
      [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER],
    ),
  )
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_BODY, SECURITY_KEY.TENANT_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  create(
    @Param('guard_Agreement') agreement: Agreement,
    @Param('guard_Tenant') tenant: Tenant,
    @Body() createDto: CreateLogisticalItemDto,
  ) {
    return this.logisticalService.create(agreement, tenant, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all logistical item.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  getAllTask() {
    return this.logisticalService.getAllLogisticalItems();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get logistical item by Id.' })
  @UseGuards(
    MultiTenantGuard(LogisticalItem, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getTaskById(
    @Param('guard_LogisticalItem') item: LogisticalItem,
    @Param('id') id: number,
  ) {
    return this.logisticalService.getLogisticalItemById(item, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete logistical item by Id.' })
  @UseGuards(
    MultiTenantGuard(LogisticalItem, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  removeTaskById(
    @Param('guard_LogisticalItem') item: LogisticalItem,
    @Param('id') id: number,
  ) {
    return this.logisticalService.removeAgreementById(item, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update logistical item by Id.' })
  @UseGuards(
    MultiTenantGuard(LogisticalItem, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  update(
    @Param('guard_LogisticalItem') item: LogisticalItem,
    @Param('id') id: number,
    @Body() updateDto: UpdateLogisticalItemDto,
  ) {
    return this.logisticalService.updateAgreementById(item, id, updateDto);
  }
}
