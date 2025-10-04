import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...' })
  @IsNotEmpty()
  @IsString()
  tempToken: string;

  @ApiProperty({ example: '123456', description: 'کد OTP' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
