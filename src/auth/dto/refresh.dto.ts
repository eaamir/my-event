import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  phone: string;

  @IsString()
  refreshToken: string;
}
