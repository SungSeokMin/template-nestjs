import { ApiProperty } from '@nestjs/swagger';

export class PageResultDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  private constructor(items: T[], hasNext: boolean) {
    this.items = items;
    this.hasNext = hasNext;
  }

  static of<T>(items: T[], page: number, pageSize: number): PageResultDto<T> {
    const hasNext = items.length > pageSize;
    const result = hasNext ? items.slice(0, pageSize) : items;
    return new PageResultDto(result, hasNext);
  }
}
