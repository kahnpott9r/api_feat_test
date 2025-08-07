import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common/decorators';

import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';
import { TasksService } from '../tasks/tasks.service';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PropertiesService } from '../properties/properties.service';
import { RentersService } from '../renters/renters.service';
import { AgreementsService } from 'src/agreements/agreements.service';
import { PageOptionsDto } from 'src/pagination/dtos';
import { UsersService } from 'src/users/users.service';
import { FinanceService } from 'src/finance/finance.service';
import { getStartAndEndDate } from 'src/Utils/utils';
import { UserRolesService } from '../user_roles/user_roles.service';
import * as moment from 'moment';
import { PaymentService } from '../payment/payment.service';
import { CreateOPP } from '../payment/dto/create-payment.dto';
import { ExactOnlineService } from '../exact-online/exact-online.service';
import { UpdateExactDto } from '../exact-online/dto/update-exact-dto';
import { UpdateExactVatCodesDto } from '../exact-online/dto/update-exact-vat-codes-dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from '../auth/guards/multi-tenant.guard';
import { Property } from '../properties/entities/property.entity';
import { Tenant } from './entities/tenant.entity';
import { EarnEService } from '../earn-e/earn-e.service';
import { EarnEProperty } from '../earn-e/entities/earn-e-property.entity';
import { SuppliersService } from 'src/suppliers/suppliers.service';
@ApiBearerAuth()
@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly taskService: TasksService,
    private readonly propertyService: PropertiesService,
    private readonly paymentService: PaymentService,
    private readonly exactOnlineService: ExactOnlineService,
    private readonly renterService: RentersService,
    private readonly agreementService: AgreementsService,
    private readonly userService: UsersService,
    private readonly userRolesService: UserRolesService,
    private readonly financeService: FinanceService,
    private readonly suppliersService: SuppliersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant.' })
  @ApiResponse({
    status: 200,
    description: 'If a tenent is created successfully.',
  })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenant for admin.' })
  @ApiResponse({ status: 200, description: 'If operation was success.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.tenantsService.findAll(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'get tenant by Id.' })
  @ApiResponse({ status: 200, description: 'If operation was success.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'update tenant by Id.' })
  @ApiResponse({ status: 200, description: 'If operation was success.' })
  @ApiResponse({ status: 404, description: 'If the tenant does not exit.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(+id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property by Id.' })
  @ApiResponse({
    status: 200,
    description: 'If a tenent is deleted successfully.',
  })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  @ApiResponse({ status: 404, description: 'If a tenant does not exit.' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(+id);
  }

  @ApiTags('Tasks')
  @Get('/:id/tasks')
  @ApiOperation({ summary: 'Get tasks by tenent Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllTasksByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.taskService.getTasksByTenant(id, pageOptionsDto);
  }

  @ApiTags('Users')
  @Get('/:id/users')
  @ApiOperation({ summary: 'Get users by tenent Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllUsersByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.userService.getUsersByTenant(pageOptionsDto, id);
  }

  @ApiTags('User Roles')
  @Get('/:id/user-roles')
  @ApiOperation({ summary: 'Get user roles by tenent Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllUserRolesByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
    @GetUser() user: User,
  ) {
    return this.userRolesService.getUserRolesByTenant(pageOptionsDto, id, user);
  }

  @ApiTags('Properties')
  @Get('/:id/properties')
  @ApiOperation({ summary: 'Get properties by properties Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllPropertiesByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.propertyService.getPropertiesByTenant(id, pageOptionsDto);
  }

  @ApiTags('Properties')
  @Get('/:id/properties-overview')
  @ApiOperation({ summary: 'Get properties by properties Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllPropertyOverviewByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.propertyService.getPropertiesByTenantWithSum(
      id,
      pageOptionsDto,
    );
  }

  @ApiTags('Agreements')
  @Get('/:id/agreements-overview')
  @ApiOperation({ summary: 'Get agreements by properties Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllAgreementsOverviewByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.agreementService.getAgreementsByTenantWithSum(
      id,
      pageOptionsDto,
    );
  }

  @ApiTags('Suppliers')
  @Get('/:id/suppliers')
  @ApiOperation({ summary: 'Get suppliers by tenant Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllSuppliersByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.suppliersService.getSuppliersByTenant(id, pageOptionsDto);
  }

  @ApiTags('Renters')
  @Get('/:id/renters')
  @ApiOperation({ summary: 'Get renters by renters Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllRentersByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.renterService.getRentersByTenant(id, pageOptionsDto);
  }

  @ApiTags('Agreements')
  @Get('/:id/agreements')
  @ApiOperation({ summary: 'Get renters by agreements Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllAgreementsByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.agreementService.getAgreementsByTenant(id, pageOptionsDto);
  }

  @ApiTags('Finance')
  @Get('/:id/finances-overview')
  @ApiOperation({ summary: 'Get renters by agreements Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAllFinancesAndLedgersByTenant(
    @Param('id') id: number,
    @Query('duration') duration: string,
    @Query('param') param: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { startDate, endDate } = getStartAndEndDate(duration, param);
    const pageOptions = {};
    if (pageOptionsDto.page) {
      pageOptions['page'] = pageOptionsDto.page;
      pageOptions['take'] = pageOptionsDto.take;
    }
    return this.financeService.getFinanceAndLedgersOverviewByTenant(
      id,
      startDate,
      endDate,
      pageOptions,
    );
  }

  @ApiTags('Finance')
  @Get('/:id/finances-totals')
  @ApiOperation({ summary: 'Get total finances for tenant' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getTotalFinancesForTenant(
    @Param('id') id: number,
    @Query('duration') duration: string,
    @Query('param') param: string,
  ) {
    const { startDate, endDate } = getStartAndEndDate(duration, param);
    return this.financeService.calculateTotalRevenuesAndCosts(
      id,
      startDate,
      endDate,
    );
  }

  @Get('/:id/dashboard')
  @ApiOperation({ summary: 'Get dashboard data by tenant Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getDashboardDataByTenant(@Param('id') id: number) {
    const objects = (await this.propertyService.getPropertiesByTenant(id, {}))
      .meta.itemCount;
    const renters = (await this.renterService.getRentersByTenant(id, {})).meta
      .itemCount;
    const { costs, revenues } =
      await this.financeService.calculateTotalRevenuesAndCosts(
        id,
        moment().startOf('month'),
        moment().endOf('month'),
      );
    const suppliers = await this.suppliersService.getSupplierCountByTenant(id);
    const users = await this.userService.getUserCountByTenant(id);
    const completed_tasks = await this.taskService.getCompletedTasksCountByTenant(id);
    const open_tasks = await this.taskService.getOpenTasksCountByTenant(id);
    const progress_tasks =
      await this.taskService.getInProgressTasksCountByTenant(id);
    const agreements =
      await this.agreementService.getActiveAgreementCountByTenant(id);
    const agreementObjects =
      await this.agreementService.getAgreementPropertyCountByTenant(id);
    const occupacyRate = (agreementObjects / objects) * 100 || 0;
    return {
      open_tasks,
      progress_tasks,
      completed_tasks,
      objects,
      agreements,
      occupacyRate,
      users,
      renters,
      costs,
      revenues,
      suppliers,
    };
  }

  @Get('/:id/recent-tasks')
  @ApiOperation({})
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getDashboardRecentTasksByTenant(
    @Param('id') id: number,
    @Query('duration') duration: string,
  ) {
    return await this.taskService.getTasksRecentByTenant(id, duration);
  }

  @Get('/:id/upcoming-expiring-agreements')
  @ApiOperation({})
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getUpcomingExpiringAgreements(@Param('id') id: number) {
    return await this.agreementService.getUpcomingExpiringAgreements(id);
  }

  @Get('/:id/recent-finance')
  @ApiOperation({})
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getDashboardRecentFinancesByTenant(
    @Param('id') id: number,
    @Query('duration') duration: string,
  ) {
    return await this.financeService.getFinanceRecentByTenant(id, duration);
  }

  @Get('/:id/payment-request')
  @ApiOperation({})
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getPaymentRequestByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.financeService.getPaymentRequestByTenant(id, pageOptionsDto);
  }

  @Get('/:id/ledgers')
  @ApiOperation({})
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getLedgersByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.financeService.getLedgersByTenant(id, pageOptionsDto);
  }

  @Get('/:id/overview')
  @ApiOperation({})
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getOverview(
    @Param('id') id: number,
    @Query('duration') duration: string,
    @Query('param') param: string,
  ) {
    return this.financeService.getOverViewByTenant(id, duration, param);
  }

  @ApiTags('OnlinePaymentPlatform')
  @Get('/:id/opp')
  @ApiOperation({ summary: 'Get tenant OPP Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async getTenantOPP(@Param('id') id: number) {
    return await this.paymentService.getTenantOPP(id);
  }

  @ApiTags('OnlinePaymentPlatform')
  @Post('/:id/opp')
  @ApiOperation({ summary: 'Get tenant OPP Id.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async setTenantOPP(@Param('id') id: number, @Body() oppDTO: CreateOPP) {
    return await this.paymentService.create(id, oppDTO);
  }

  @ApiTags('ExactOnline')
  @Get('/:id/exact')
  @ApiOperation({ summary: 'Get tenant Exact.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async getExactOnline(@Param('id') id: number) {
    return this.exactOnlineService.getExactDetails(id);
  }

  @ApiTags('ExactOnline')
  @Get('/:id/exact/vat-codes')
  @ApiOperation({ summary: 'Get tenant Exact VatCodes.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async getExactOnlineVatCodes(@Param('id') id: number) {
    const exactData = await this.exactOnlineService.getExactData(id);
    console.log(exactData.refreshToken);
    const vatCodes = await this.exactOnlineService.setAndGetVatCodes(exactData);
    const mappedVatCodes = await this.exactOnlineService.getMappedVatCodes(
      exactData,
    );
    const taxCodes = await this.financeService.getTaxCodes();
    return {
      vatCodes,
      mappedVatCodes,
      taxCodes,
    };
  }

  @ApiTags('ExactOnline')
  @Get('/:id/exact/items')
  @ApiOperation({ summary: 'Get tenant Exact Items.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  async getExactItems(@Param('id') id: number) {
    const exactData = await this.exactOnlineService.getExactData(id);
    return await this.exactOnlineService.getOrSetItems(exactData);
  }

  @ApiTags('ExactOnline')
  @Get('/:id/exact/accounts')
  @ApiOperation({ summary: 'Get tenant exact account.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async getAccounts(@Param('id') id: number) {
    const exactData = await this.exactOnlineService.getExactData(id);
    const accounts = await this.exactOnlineService.getAccounts(exactData);
    const filteredAccountIds = accounts.map((account) => account.ID);
    const renters = await this.renterService.getRentersByExactIds(
      filteredAccountIds,
    );

    return accounts.map((account) => ({
      ...account,
      imported: renters.includes(account.ID),
    }));
  }

  @ApiTags('ExactOnline')
  @Post('/:id/exact')
  @ApiOperation({ summary: 'Update tenant Exact.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async setExactOnline(
    @Param('id') id: number,
    @Body() updateExactDto: UpdateExactDto,
  ) {
    const exactData = await this.exactOnlineService.getExactData(id);
    return await this.exactOnlineService.setDivision(exactData, updateExactDto);
  }

  @ApiTags('ExactOnline')
  @Post('/:id/exact/vat-codes')
  @ApiOperation({ summary: 'Update tenant Exact vatcodes.' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async setExactOnlineSelectedVatCodes(
    @Param('id') id: number,
    @Body() updateExactVatCodesDto: UpdateExactVatCodesDto,
  ) {
    const exactData = await this.exactOnlineService.getExactData(id);
    return await this.exactOnlineService.setSelectedVatCodes(
      exactData,
      updateExactVatCodesDto,
    );
  }

  @ApiTags('ExactOnline')
  @Delete('/:id/exact')
  @ApiOperation({ summary: 'Delete exact online' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async deleteExactOnline(@Param('id') id: number) {
    const exactData = await this.exactOnlineService.getExactData(id);
    const result = await this.exactOnlineService.remove(exactData);
    await this.renterService.removeAllExact();
    return result;
  }

  @Post('/:id/earn-e')
  @ApiOperation({ summary: 'Activate EarnE for tenant properties' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async activateEarnE(
    @Param('id') id: number,
    @Body() body: { propertyIds: number[] },
  ) {
    if (!body.propertyIds || !Array.isArray(body.propertyIds)) {
      throw new BadRequestException('Invalid propertyIds');
    }
    return this.tenantsService.activateEarnE(id, body.propertyIds);
  }

  @Get('/:id/earn-e-data')
  @ApiOperation({
    summary: 'Get aggregated EarnE data and properties for a tenant',
  })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAggregatedEarnEData(
    @Param('id') id: number,
    @Query('duration') duration: string,
    @Query('param') param: string,
  ) {
    const { startDate, endDate, interval } = getStartAndEndDate(
      duration,
      param,
    );
    return this.tenantsService.getAggregatedEarnEDataByTenantId(
      id,
      startDate,
      endDate,
      interval,
    );
  }

  @Get('/:id/earn-e-properties')
  @ApiOperation({ summary: 'Get properties without EarnE for a tenant' })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getEarnEPropertiesByTenant(
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.propertyService.getEarnEPropertiesByTenant(id, pageOptionsDto);
  }
}
