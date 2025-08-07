import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Type } from '../entities/mortgage-line.entity';

export class CreateMortgageLineDto {
  @ApiProperty({
    description: 'The start date of the task',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the task',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  endDate: Date;

  @ApiProperty({
    description: 'The Type of the Mortgage Line',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(Type, { message: i18nValidationMessage('message.MustEnum') })
  type: Type;

  @ApiProperty({
    description: 'The Mortgage Line Part',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  part: number;

  @ApiProperty({
    description: 'The amount of the Mortgage Line',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  amount: number;

  @ApiProperty({
    description: 'The interest rate of the Mortgage Line',
  })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  interestRate: number;
}
