import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MortgageLineService } from './mortgage-line.service';
import { UpdateMortgageLineDto } from './dto/update-mortgage-line.dto';
import { PageOptionsDto } from '../pagination/dtos';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from '../auth/guards/multi-tenant.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';
import { Property } from '../properties/entities/property.entity';

@ApiBearerAuth()
@ApiTags('MortgageLines')
@Controller('mortgage-lines')
export class MortgageLinesController {
  constructor(private readonly mortgageLinesService: MortgageLineService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create a mortgage line.' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'If the operation was success.',
  // })
  // @ApiResponse({ status: 403, description: 'If access not allowed.' })
  // @ApiResponse({
  //   status: 404,
  //   description: 'If mortgage line does not exist.',
  // })
  // // @UseGuards(
  // //   MultiTenantGuard(Property, SECURITY.CHECK_BODY, SECURITY_KEY.PROPERTY_ID, [
  // //     ROLE.ADMIN,
  // //     ROLE.MANAGER,
  // //     ROLE.USER,
  // //   ]),
  // // )
  // async create(
  //   @Param('guard_Property') property: Property,
  //   @Body() createMortgageLineDto: CreateMortgageLineDto,
  // ) {
  //   return this.mortgageLinesService.create(property, createMortgageLineDto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all mortgage lines.' })
  @ApiResponse({
    status: 200,
    description: 'If the operation was success.',
  })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  // @UseGuards(RoleGuard([ROLE.ADMIN, ROLE.USER]))
  async getAllMortgageLines(@Query() pageOptionsDto: PageOptionsDto) {
    return this.mortgageLinesService.getAllMortgageLines(pageOptionsDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mortgage line by id.' })
  @ApiResponse({
    status: 200,
    description: 'If the operation was success.',
  })
  @ApiResponse({ status: 403, description: 'If access not allowed.' })
  @ApiResponse({
    status: 404,
    description: 'If mortgage line does not exist.',
  })
  @UseGuards(
    MultiTenantGuard(Property, SECURITY.CHECK_BODY, SECURITY_KEY.PROPERTY_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  async updateMortgageLine(
    @Param('id') id: number,
    @Body() updateMortgageLineDto: UpdateMortgageLineDto,
  ) {
    return this.mortgageLinesService.updateMortgageLine(
      id,
      updateMortgageLineDto,
    );
  }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete mortgage line by id.' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'If the operation was success.',
  // })
  // @ApiResponse({ status: 403, description: 'If access not allowed.' })
  // @ApiResponse({
  //   status: 404,
  //   description: 'If mortgage line does not exist.',
  // })
  // @UseGuards(
  //   MultiTenantGuard(Property, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
  //     ROLE.ADMIN,
  //     ROLE.MANAGER,
  //     ROLE.USER,
  //   ]),
  // )
  // async delete(@Param('id') id: number) {
  //   return this.mortgageLinesService.delete(id);
  // }
}
