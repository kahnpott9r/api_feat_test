import {
  Controller,
  Query,
  NotFoundException,
  BadRequestException,
  Get,
  Res,
  UseGuards,
  Post,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExactOnlineService } from './exact-online.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';
import { PublicDecorator } from '../auth/decorators/public.decorator';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RoleGuard } from '../auth/guards/role.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';

@ApiBearerAuth()
@ApiTags('ExactOnline')
@Controller('exact-online')
export class ExactOnlineController {
  constructor(
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    private exactOnlineService: ExactOnlineService,
    private configService: ConfigService,
  ) {}

  @Post('sync')
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  async sync() {
    await this.exactOnlineService.syncOpenInvoices();
  }

  @PublicDecorator()
  @Get('oauth-callback')
  @ApiOperation({ summary: 'OAuth callback uri for exact' })
  async oauthCallback(
    @Query('code') code: string | null,
    @Query('state') state: string | null,
    @Res() res: Response,
  ) {
    console.log('code', code);
    console.log('state', state);
    if (!code || !state) {
      throw new BadRequestException('Invalid state/code.');
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: +state },
    });

    if (tenant === null) {
      throw new NotFoundException('Tenant not found.');
    }
    const exactData = await this.exactOnlineService.getExactData(tenant.id);
    await this.exactOnlineService.authenticate(exactData, code);
    const exactDataRefresh = await this.exactOnlineService.getExactData(
      tenant.id,
    );
    await this.exactOnlineService.setDivisions(exactDataRefresh);

    return res.redirect(this.configService.get('RETURN_URL'));
  }
}
