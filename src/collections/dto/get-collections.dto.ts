import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetCollectionsQueryDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Number of collections per page',
  })
  @IsOptional()
  @IsNumber()
  per_page?: number;

  @ApiPropertyOptional({ example: 3, description: 'Current page' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 'Sample collection name',
    description: 'Filter by name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filter by collection status',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
