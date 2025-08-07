import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
