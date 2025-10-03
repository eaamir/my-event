import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    example: '+989123456789',
    description: 'Phone number in Iran format',
  })
  @IsString()
  @Length(11, 11)
  phone: string;
}
