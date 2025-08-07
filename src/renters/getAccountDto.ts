import { IsOptional, IsString, MinLength } from 'class-validator';

export class GetAccountDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Minimaal 3 characters voor zoeken' })
  readonly search?: string;
}
