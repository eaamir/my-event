import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and login/register' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Tokens returned successfully' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.otp, dto.tempToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'New access token returned' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.phone, dto.refreshToken);
  }
}
