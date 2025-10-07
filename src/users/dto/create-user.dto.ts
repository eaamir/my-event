import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsIn,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'https://image-link',
    description: 'User image link',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'User Fullname', description: 'User fullname' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'sample@test.com',
    description: 'User email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '1375-06-12',
    description: 'User birth date',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'birth_date must be a valid ISO date (YYYY-MM-DD)' },
  )
  birth_date?: string;

  @ApiProperty({
    example: '1',
    description: 'User gender',
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2], { message: 'Gender must be 0, 1 or 2' })
  gender?: number;

  @ApiProperty({
    example: 'user, organizer, owner, superadmin',
    description: 'User role',
  })
  @IsIn(['user', 'organizer', 'owner', 'superadmin'])
  role: string;

  @ApiProperty({
    example: '0',
    description: 'User credit value',
  })
  @IsOptional()
  @IsNumber()
  credit?: number;

  @ApiProperty({
    example: '0',
    description: 'User blocked credit value',
  })
  @IsOptional()
  @IsNumber()
  blocked_credit?: number;

  @ApiProperty({
    example: '0, 1',
    description: 'User status (0: inactive, 1: active)',
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1], { message: 'Status must be 0 or 1' })
  status?: number;

  @ApiProperty({
    example: '09123456789',
    description: 'User phone number',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
