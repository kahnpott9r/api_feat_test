import { IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFinanceDto {
  @ApiProperty({
    description: 'The start date of the task',
  })
  @IsDate()
  @IsOptional()
  startDate: Date | null;
}
