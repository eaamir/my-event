import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'All users' })
  async findAll() {
    return this.authService.findAll();
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone' })
  @ApiResponse({ status: 201, description: ' کد با موفقیت ارسال شد' })
  @ApiResponse({
    status: 400,
    description: 'تعداد درخواست زیاد یا شماره نامعتبر',
  })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'تأیید OTP با tempToken (دریافت access/refresh token)',
  })
  @ApiResponse({
    status: 200,
    description: 'توکن‌ها صادر شدند',
    type: AuthResponseDto,
  })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.otp, dto.tempToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'دریافت access token جدید با refresh token' })
  @ApiResponse({ status: 200, description: 'Access token جدید صادر شد' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.phone, dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'خروج کاربر' })
  @ApiResponse({ status: 200, description: 'خروج انجام شد' })
  logout(@Body() dto: SendOtpDto) {
    return this.authService.logout(dto.phone);
  }

  @Patch('update-profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'آپدیت پروفایل کاربر' })
  @ApiResponse({
    status: 200,
    description: 'پروفایل آپدیت شد',
    type: AuthResponseDto,
  })
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    const phone = req.user.phone;
    return this.authService.updateProfileByPhone(phone, dto);
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Post('me')
  // me(@Request() req) {
  //   return req.user;
  // }
}
