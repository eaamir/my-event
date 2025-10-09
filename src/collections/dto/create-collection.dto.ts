import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'My Collection', description: 'Collection name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'logo.png', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'cover.jpg', required: false })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ example: 'This is my collection', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
