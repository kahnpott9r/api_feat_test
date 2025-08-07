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
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from 'src/auth/guards/multi-tenant.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { PageOptionsDto } from 'src/pagination/dtos';
import { Property } from 'src/properties/entities/property.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { ROLE } from 'src/user_roles/entities/user_role.entity';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { UpdatePaymentRequestDto } from './dto/update-payment-request.dto';
import { Ledger } from './entites/ledger.entity';
import { PaymentRequest } from './entites/payment-request.entity';
import { FinanceService } from './finance.service';
import { UpdatePropertyDto } from '../properties/dto/update-property.dto';
import { Finance } from './entites/finance.entity';
import { UpdateFinanceDto } from './dto/update-finance.dto';

@ApiBearerAuth()
@ApiTags('Finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('payment-request')
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
  createPaymentRequest(
    @Param('guard_Tenant') tenant: Tenant,
    @Param('guard_Property') property: Property,
    @Body() createDto: CreatePaymentRequestDto,
  ) {
    return this.financeService.createPaymentRequest(
      tenant,
      property,
      createDto,
    );
  }

  @Post('payment-ledger')
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
  createPaymentLedger(
    @Param('guard_Tenant') tenant: Tenant,
    @Param('guard_Property') property: Property,
    @Body() createDto: CreateLedgerDto,
  ) {
    return this.financeService.createPaymentLedger(tenant, property, createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update finance by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successed.' })
  @UseGuards(
    MultiTenantGuard(Finance, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  updateProperty(
    @Param('guard_Finance') finance: Finance,
    @Body() updateDto: UpdateFinanceDto,
  ) {
    return this.financeService.updateById(finance, updateDto);
  }

  @Patch(':id/payment-request')
  @UseGuards(
    MultiTenantGuard(PaymentRequest, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
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
  updatePaymentRequest(
    @Param('id') id: number,
    @Body() updateDto: UpdatePaymentRequestDto,
  ) {
    return this.financeService.updatePaymentRequest(id, updateDto);
  }

  @Patch(':id/payment-ledger')
  @UseGuards(
    MultiTenantGuard(Ledger, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
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
  updatePaymentLedger(
    @Param('guard_Tenant') tenant: Tenant,
    @Param('guard_Property') property: Property,
    @Param('guard_PaymentRequest') ledger: Ledger,
    @Param('id') id: number,
    @Body() updateDto: UpdateLedgerDto,
  ) {
    return this.financeService.updatePaymentLedger(id, updateDto);
  }

  @Delete(':id/payment-request')
  @UseGuards(
    MultiTenantGuard(PaymentRequest, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  deletePaymentRequest(@Param('id') id: number) {
    return this.financeService.removePaymentRequestById(id);
  }

  @Delete(':id/payment-ledger')
  @UseGuards(
    MultiTenantGuard(Ledger, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  deletePaymentLedger(@Param('id') id: number) {
    return this.financeService.removeLedgerById(id);
  }

  @Get('/payment-request')
  @ApiOperation({ summary: 'Get all Payment Request.' })
  @ApiResponse({ status: 200, description: 'If the operation was successed.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  getAllPaymentRequest(@Query() pageOptionsDto: PageOptionsDto) {
    return this.financeService.getAllPaymentRequest(pageOptionsDto);
  }

  @Get('ledgers')
  @ApiOperation({ summary: 'Get all Ledgers.' })
  @ApiResponse({ status: 200, description: 'If the operation was successed.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  getAllLedgers(@Query() pageOptionsDto: PageOptionsDto) {
    return this.financeService.getAllLedgers(pageOptionsDto);
  }
}
