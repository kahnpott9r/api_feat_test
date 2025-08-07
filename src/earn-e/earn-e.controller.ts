import { Controller } from '@nestjs/common';
import { EarnEService } from './earn-e.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('EarnE')
@Controller('earn-e')
export class EarnEController {
  constructor(private earnEService: EarnEService) {}
}
