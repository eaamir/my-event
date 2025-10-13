import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetCollectionsQueryDto {
  @ApiPropertyOptional({
    example: '',
    description: 'Number of collections per page',
  })
  @IsOptional()
  @IsNumber()
  per_page?: number;

  @ApiPropertyOptional({ example: '', description: 'Current page' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter by name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter by collection status',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter by collection owner id',
  })
  @IsOptional()
  @IsString()
  owner_id?: string;
}
