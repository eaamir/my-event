import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'My Collection', description: 'Collection name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: '', required: false })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiPropertyOptional({ example: 'This is my collection', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of organizer user IDs',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  organizers?: string[];
}
