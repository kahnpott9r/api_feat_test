import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParameters } from './interfaces';

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({
    pageOptionsDto,
    itemCount,
    allowUnpaginated = false,
  }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take =
      pageOptionsDto.paginate === 'false' && allowUnpaginated
        ? -1
        : pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount =
      pageOptionsDto.paginate === 'false' && allowUnpaginated
        ? 1
        : Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
