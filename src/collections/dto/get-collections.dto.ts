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
    example: '1',
    description: 'Filter by collection status',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'dnawoid18238913891nkawd',
    description: 'Filter by collection owner id',
  })
  @IsOptional()
  @IsString()
  owner_id?: string;
}
