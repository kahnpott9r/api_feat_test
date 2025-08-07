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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RoleGuard } from '../auth/guards/role.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from 'src/auth/guards/multi-tenant.guard';
import { Property } from '../properties/entities/property.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { AgreementsService } from './agreements.service';
import { Renter } from '../renters/entities/renters.entity';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { Agreement } from './entities/agreement.entity';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { PageOptionsDto } from 'src/pagination/dtos';

@ApiBearerAuth()
@ApiTags('Agreements')
@Controller('agreements')
export class AgreementsController {
  constructor(private agreementsService: AgreementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a agreement.' })
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
  @UseGuards(
    MultiTenantGuard(
      Renter,
      SECURITY.CHECK_BODY,
      SECURITY_KEY.RENTER_IDS,
      [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER],
      true,
    ),
  )
  create(
    @Param('guard_Tenant') tenant: Tenant,
    @Param('guard_Property') property: Property,
    @Param('guard_Renter_array') renters: Renter[],
    @Body() createDto: CreateAgreementDto,
  ) {
    return this.agreementsService.create(tenant, property, renters, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all agreement.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  getAllAgreements(@Query() pageOptionsDto: PageOptionsDto) {
    return this.agreementsService.getAllAgreements(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agreement by Id.' })
  @UseGuards(
    MultiTenantGuard(Agreement, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getAgreementById(
    @Param('guard_Agreement') agreement: Agreement,
    @Param('id') id: number,
  ) {
    return this.agreementsService.getAgreementById(agreement, id);
  }

  @Post('/end/:id')
  @ApiOperation({ summary: 'End agreement by Id.' })
  @UseGuards(
    MultiTenantGuard(Agreement, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  endAgreementById(
    @Param('guard_Agreement') agreement: Agreement,
    @Param('id') id: number,
  ) {
    return this.agreementsService.endAgreementById(agreement, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete agreement by Id.' })
  @UseGuards(
    MultiTenantGuard(Agreement, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  removeAgreementById(
    @Param('guard_Agreement') agreement: Agreement,
    @Param('id') id: number,
  ) {
    return this.agreementsService.removeAgreementById(agreement, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agreement by Id.' })
  @UseGuards(
    MultiTenantGuard(Agreement, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
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
  @UseGuards(
    MultiTenantGuard(
      Renter,
      SECURITY.CHECK_BODY,
      SECURITY_KEY.RENTER_IDS,
      [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER],
      true,
    ),
  )
  update(
    @Param('guard_Agreement') agreement: Agreement,
    @Param('guard_Property') property: Property,
    @Param('guard_Renter_array') renters: Renter[],
    @Param('id') id: number,
    @Body() updateDto: UpdateAgreementDto,
  ) {
    return this.agreementsService.updateAgreementById(
      agreement,
      property,
      renters,
      id,
      updateDto,
    );
  }
}
