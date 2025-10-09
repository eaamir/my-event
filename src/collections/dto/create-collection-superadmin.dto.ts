import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCollectionSuperadminDto {
  @ApiProperty({ example: 'My Collection' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'cover.jpg' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiPropertyOptional({ example: 'This is a collection description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '64f7e3b8a1234567890abcd',
    description: 'Owner user ID',
  })
  @IsOptional()
  @IsString()
  owner?: string; // optional, assign to another user
}
