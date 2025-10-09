import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumberString,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class GetUsersQueryDto {
  @ApiPropertyOptional({ example: 10, description: 'Number of users per page' })
  @IsOptional()
  @IsNumberString()
  per_page?: number;

  @ApiPropertyOptional({ example: 3, description: 'Current page' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ example: 'Ali', description: 'Filter by name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '09121234567',
    description: 'Filter by phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by gender (1=Male, 2=Female)',
  })
  @IsOptional()
  @IsNumber()
  gender?: number;

  @ApiPropertyOptional({ enum: UserRole, description: 'Filter by user role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filter by user status',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
