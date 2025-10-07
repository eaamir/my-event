import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...' })
  @IsNotEmpty()
  @IsString()
  tempToken: string;

  @ApiProperty({ example: '1234', description: 'OTP code' })
  @IsString()
  @Length(4, 4)
  otp: string;
}
