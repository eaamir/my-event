import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'access_token_here' })
  accessToken: string;

  @ApiProperty({ example: 'refresh_token_here' })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: '68e3ed9143b5c70a1b4a8736',
      phone: '09208680168',
      name: 'مهبد مرتضوی',
      birth_date: '1379-05-15',
      gender: '1',
      role: 'superadmin',
    },
  })
  user: {
    id: string;
    phone: string;
    name?: string;
    birth_date?: string;
    gender?: number;
    role: string;
    avatar?: string;
    email?: string;
  };
}
