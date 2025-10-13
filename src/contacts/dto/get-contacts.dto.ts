import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetContactsDto {
  @ApiPropertyOptional({
    example: '',
    description: "Filter by user's name",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '',
    description: "Filter by user's phone",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '',
    description: "Filter by user's gender",
  })
  @IsOptional()
  @IsEnum([1, 2])
  @IsNumber()
  gender?: number;

  @ApiPropertyOptional({
    example: '',
    description: 'Count of users in each page',
  })
  @IsOptional()
  @IsNumber()
  per_page?: number;

  @ApiPropertyOptional({
    example: '',
    description: 'Number of current page',
  })
  @IsOptional()
  @IsNumber()
  page?: number;
}
