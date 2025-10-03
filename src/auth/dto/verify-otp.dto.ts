import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '09121234567', description: 'شماره موبایل ایران' })
  @IsString()
  @Length(11, 11)
  phone: string;

  @ApiProperty({ example: '123456', description: 'کد OTP' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
