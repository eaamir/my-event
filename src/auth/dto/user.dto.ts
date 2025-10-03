import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Mahbod', description: 'نام جدید کاربر' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 25, description: 'سن' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  age?: number;
}
