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
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyTypeDto } from './dto/update-property-type.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import {
  PropertiesService,
  PropertyData,
  TotalPropertyData,
} from './properties.service';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from '../auth/guards/multi-tenant.guard';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Property } from './entities/property.entity';
import { CreatePropertyTypeDto } from './dto/create-property-type.dto';
import { PageOptionsDto } from 'src/pagination/dtos';
import { getStartAndEndDate } from 'src/Utils/utils';
import { UpdatePropertyNoteDto } from './dto/update-property-note.dto';
import { UpdatePropertyAttachmentsDto } from './dto/update-property-attachments.dto';
import { AgreementsService } from 'src/agreements/agreements.service';
import { TasksService } from 'src/tasks/tasks.service';
import { FinanceService } from 'src/finance/finance.service';
import { CreatePropertyValueDto } from './dto/create-property-value.dto';
import { CreateMortgageLineDto } from '../mortgage_lines/dto/create-mortgage-line.dto';
import { CreateEnergyInsulationDto } from './dto/create-energy-insulation.dto';
import { UpdateEnergyInsulationDto } from './dto/update-energy-insulation.dto';
import { UpdatePropertyEnergyInformationDto } from './dto/update-property-energy-information.dto';

@ApiBearerAuth()
@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService,
    private agreementService: AgreementsService,
    private taskService: TasksService,
    private financeService: FinanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a property.' })
  @ApiResponse({
    status: 200,
    description: 'If a property was created successfully.',
  })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({
    status: 404,
    description: 'If the tenant or type does not exit.',
  })
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_BODY, SECURITY_KEY.TENANT_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  create(
    @Param('guard_Tenant') tenant: Tenant,
    @Body() createDto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(tenant, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all property.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  getAllProperties(@Query() pageOptionsDto: PageOptionsDto) {
    return this.propertiesService.getAllProperties(pageOptionsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property by Id.' })
  @ApiResponse({
    status: 200,
    description: 'If a property is deleted successfully.',
  })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  removePropertyByTenant(@Param('id') id: number) {
    return this.propertiesService.removePropertyById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updateProperty(
    @Param('guard_Property') property: Property,
    @Body() updateDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.updatePropertyById(property, updateDto);
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update property agreements by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updatePropertyNotes(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
    @Body() updateDto: UpdatePropertyNoteDto,
  ) {
    return this.propertiesService.updatePropertyNoteById(
      id,
      property,
      updateDto,
    );
  }

  @Patch(':id/attachments')
  @ApiOperation({ summary: 'Update property agreements by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updatePropertyAttachments(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
    @Body() updateDto: UpdatePropertyAttachmentsDto,
  ) {
    return this.propertiesService.updatePropertyAttachmentsById(
      id,
      property,
      updateDto,
    );
  }

  @Post('type')
  @ApiOperation({ summary: 'Create a property type.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  createPropertyType(@Body() createDto: CreatePropertyTypeDto) {
    return this.propertiesService.createPropertyType(createDto);
  }

  @Get('type')
  @ApiOperation({ summary: 'Get all property types.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN, ROLE.MANAGER, ROLE.USER]))
  getAllPropertyTypes() {
    return this.propertiesService.getAllPropertyTypes();
  }

  @Get('type/:id')
  @ApiOperation({ summary: 'Get property type by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  getPropertyTypeById(@Param('id') id: number) {
    return this.propertiesService.getPropertyTypeById(id);
  }

  @Delete('type/:id')
  @ApiOperation({ summary: 'Delete property type by Id.' })
  @ApiResponse({
    status: 200,
    description: 'If a property is deleted successfully.',
  })
  @ApiResponse({
    status: 406,
    description:
      'If a property can not be deleted because it is still referenced from other tables.',
  })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  removePropertyTypeByTenant(@Param('id') id: number) {
    return this.propertiesService.removePropertyTypeById(id);
  }

  @Patch('type/:id')
  @ApiOperation({ summary: 'Update property type by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  updatePropertyType(
    @Param('id') id: number,
    @Body() updateDto: UpdatePropertyTypeDto,
  ) {
    return this.propertiesService.updatePropertyTypeById(id, updateDto);
  }

  @Post('energy-insulation')
  @ApiOperation({ summary: 'Create a energy insulation type.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  createEnergyInsulation(@Body() createDto: CreateEnergyInsulationDto) {
    return this.propertiesService.createEnergyInsulation(createDto);
  }

  @Get('energy-insulation')
  @ApiOperation({ summary: 'Get all energy insulation types.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN, ROLE.MANAGER, ROLE.USER]))
  getAllEnergyInsulation() {
    return this.propertiesService.getAllEnergyInsulation();
  }

  @Get('energy-insulation/:id')
  @ApiOperation({ summary: 'Get energy insulation type by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN, ROLE.MANAGER, ROLE.USER]))
  getEnergyInsulationById(@Param('id') id: number) {
    return this.propertiesService.getEnergyInsulationById(id);
  }

  @Delete('energy-insulation/:id')
  @ApiOperation({ summary: 'Delete energy insulation type by Id.' })
  @ApiResponse({
    status: 200,
    description: 'If a energy insulation is deleted successfully.',
  })
  @ApiResponse({
    status: 406,
    description:
      'If a energy insulation can not be deleted because it is still referenced from other tables.',
  })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  removeEnergyInsulationByTenant(@Param('id') id: number) {
    return this.propertiesService.removeEnergyInsulationById(id);
  }

  @Patch('energy-insulation/:id')
  @ApiOperation({ summary: 'Update energy insulation type by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  updateEnergyInsulation(
    @Param('id') id: number,
    @Body() updateDto: UpdateEnergyInsulationDto,
  ) {
    return this.propertiesService.updateEnergyInsulationById(id, updateDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getPropertyById(@Param('guard_Property') property: Property) {
    return this.propertiesService.getPropertyById(property);
  }

  @Get(':id/agreements')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getAgreementsByProperty(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.agreementService.getAgreementsByProperty(
      property,
      pageOptionsDto,
    );
  }

  @Get('/:id/interests-overview')
  @ApiOperation({ summary: 'Get mortgage interests' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getMortgageInterestsByTenant(
    @Param('guard_Property') property: Property,
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
    return this.financeService.getMortgageInterestsOverviewByTenant(
      property.tenant.id,
      startDate,
      endDate,
      pageOptions,
      property.id,
    );
  }

  @Get(':id/finances-overview')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getAgreementsByPropertyOverview(
    @Param('guard_Property') property: Property,
    @Query('duration') duration: string,
    @Query('param') param: string,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { startDate, endDate } = getStartAndEndDate(duration, param);
    const pageOptions = {};
    if (pageOptionsDto.page) {
      pageOptions['page'] = pageOptionsDto.page;
      pageOptions['take'] = pageOptionsDto.take;
    }

    const result =
      await this.financeService.getFinanceAndLedgersOverviewByTenant(
        property.tenant.id,
        startDate,
        endDate,
        pageOptions,
        property.id,
      );

    const totals = await this.financeService.calculateTotalRevenuesAndCosts(
      property.tenant.id,
      startDate,
      endDate,
      property.id,
    );
    return {
      ...result,
      ...totals,
    };
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getTasksByProperty(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.taskService.getTasksByProperty(property.id, pageOptionsDto);
  }

  @Get(':id/payment-request')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getPaymentRequestByProperty(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.financeService.getPaymentRequestByProperty(
      property.id,
      pageOptionsDto,
    );
  }

  @Get(':id/finance')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getFinanceRequestByProperty(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.financeService.getFinanceByProperty(
      property.id,
      pageOptionsDto,
    );
  }

  @Get(':id/finance')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getFinanceRequestByPropertyId(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
  ) {
    return this.financeService.getFinanceByPropertyId(property.id);
  }

  @Get(':id/payment-ledger')
  @ApiOperation({ summary: 'Get property by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getPaymentLedgerByProperty(
    @Param('guard_Property') property: Property,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.financeService.getLedgersByProperty(
      property.id,
      pageOptionsDto,
    );
  }

  @Get('/:id/overview')
  @ApiOperation({
    summary: 'Get property overview by Id.',
  })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  getOverview(
    @Query('duration') duration: string,
    @Query('param') param: string,
    @Param('id') id: number,
  ) {
    return this.financeService.getOverViewByTenant(id, duration, param);
  }

  @Patch(':id/property-value')
  @ApiOperation({ summary: 'Update property value by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updatePropertyValueByPropertyId(
    @Param('id') id: number,
    @Body() updateDto: CreatePropertyValueDto,
  ) {
    return this.propertiesService.editPropertyValue(id, updateDto);
  }

  @Patch(':id/energy-information')
  @ApiOperation({ summary: 'Update energy information by Property Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updateEnergyInformationByPropertyId(
    @Param('id') id: number,
    @Body() updateDto: UpdatePropertyEnergyInformationDto,
  ) {
    return this.propertiesService.editPropertyEnergyInformation(id, updateDto);
  }

  @Get(':id/earn-e')
  @ApiOperation({ summary: 'Get Earn-E by Property Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.USER,
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async getEarnEByPropertyId(
    @Param('id') id: number,
    @Param('guard_Property') property: Property,
    @Query('duration') duration: string,
    @Query('param') param: string,
  ): Promise<{ property: PropertyData; total?: TotalPropertyData }> {
    const { startDate, endDate, interval } = getStartAndEndDate(
      duration,
      param,
    );
    return this.propertiesService.getEarnEPropertyByPropertyId(
      property,
      startDate,
      endDate,
      interval,
    );
  }

  @Get(':id/mortgage-lines')
  @ApiOperation({ summary: 'Get mortgage lines by Property Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getMortgageLinesByPropertyId(
    @Param('id') id: number,
    @Param('guard_Property') property: Property,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.propertiesService.getMortgageLinesByPropertyId(
      property,
      pageOptionsDto,
    );
  }

  @Post(':id/mortgage-lines')
  @ApiOperation({ summary: 'Create mortgage line by Property Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async createMortgageLineByPropertyId(
    @Param('id') id: number,
    @Body() createDto: CreateMortgageLineDto,
  ) {
    return this.propertiesService.createMortgageLineByPropertyId(id, createDto);
  }

  @Delete(':id/mortgage-lines/:mortgageLineId')
  @ApiOperation({ summary: 'Delete mortgage line by Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was success.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async deleteMortgageLineByPropertyId(
    @Param('guard_Property') property: Property,
    @Param('mortgageLineId') mortgageLineId: number,
  ) {
    return this.propertiesService.deleteMortgageLineByPropertyId(
      property,
      mortgageLineId,
    );
  }

  @Get(':id/yields-gross')
  @ApiOperation({ summary: 'Get Gross yields by Property Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getGrossYields(
    @Param('guard_Property') property: Property,
    @Query('duration') duration: string,
    @Query('param') param: string,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { startDate, endDate } = getStartAndEndDate(duration, param);
    const pageOptions = {};
    if (pageOptionsDto.page) {
      pageOptions['page'] = pageOptionsDto.page;
      pageOptions['take'] = pageOptionsDto.take;
    }

    const totals = await this.financeService.calculateTotalRevenuesAndCosts(
      property.tenant.id,
      startDate,
      endDate,
      id,
    );

    const ledgers = await this.financeService.getLedgerByPropertyId(
      property.id,
    );

    const finance = await this.financeService.getFinanceByPropertyId(id);

    return {
      ...totals,
      propertyValue: property.purchaseValue,
      finances: finance,
      ledgers: ledgers,
    };
  }

  @Get(':id/yields')
  @ApiOperation({ summary: 'Get yields by Property Id.' })
  @ApiResponse({ status: 200, description: 'If the operation was successful.' })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({ status: 404, description: 'If the property does not exit.' })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async getYields(
    @Param('guard_Property') property: Property,
    @Query('duration') duration: string,
    @Query('param') param: string,
    @Param('id') id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { startDate, endDate } = getStartAndEndDate(duration, param);
    const pageOptions = {};
    if (pageOptionsDto.page) {
      pageOptions['page'] = pageOptionsDto.page;
      pageOptions['take'] = pageOptionsDto.take;
    }

    const totals = await this.financeService.calculateTotalRevenuesAndCosts(
      property.tenant.id,
      startDate,
      endDate,
      id,
    );

    return {
      ...totals,
    };
  }
}
