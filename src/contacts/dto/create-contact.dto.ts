import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({
    example: '',
    description: "User's name",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '',
    description: "User's phone",
  })
  @Length(11)
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    example: '',
    description: "User's gender",
  })
  @IsEnum([1, 2])
  @IsNumber()
  @IsOptional()
  gender?: number;
}
