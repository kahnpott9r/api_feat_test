import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateExactDto {
  @ApiProperty({
    description: 'division',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  division: number;

  @ApiProperty({
    description: 'Whether to disable automatically sending/printing the invoice after creation in Exact Online.',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  dontSendInvoiceAfterCreation?: boolean; // New field
}
