import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RoleGuard } from '../auth/guards/role.guard';
import { CreateTaxCodeDto } from './dto/create-tax-code.dto';
import { UpdateTaxCode } from './dto/update-tax-code.dto';
import { TaxCodesService } from './tax_codes.service';
import { ROLE } from '../user_roles/entities/user_role.entity';

@ApiBearerAuth()
@ApiTags('TaxCodes')
@Controller('tax-codes')
export class TaxCodesController {
  constructor(private readonly taxcodeService: TaxCodesService) {}

  @Post()
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  create(@Body() createUserDto: CreateTaxCodeDto) {
    return this.taxcodeService.create(createUserDto);
  }

  @Get()
  @UseGuards(RoleGuard([ROLE.ADMIN, ROLE.MANAGER, ROLE.USER]))
  findAll() {
    return this.taxcodeService.findAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard([ROLE.ADMIN, ROLE.MANAGER, ROLE.USER]))
  findOne(@Param('id') id: string) {
    return this.taxcodeService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  update(@Param('id') id: string, @Body() updateUserDto: UpdateTaxCode) {
    return this.taxcodeService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  remove(@Param('id') id: string) {
    return this.taxcodeService.remove(+id);
  }
}
