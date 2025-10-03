import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'access_token_here' })
  accessToken: string;

  @ApiProperty({ example: 'refresh_token_here' })
  refreshToken: string;

  @ApiProperty({
    example: { id: '650f2d2c...', phone: '09121234567', name: 'Mahbod', age: 25 },
  })
  user: { id: string; phone: string; name?: string; age?: number };
}
