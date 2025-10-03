import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: '09121234567', description: 'شماره موبایل ایران' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'refresh_token_here', description: 'Refresh Token' })
  @IsString()
  refreshToken: string;
}
