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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('users')
  async findAll() {
    return this.authService.findAll();
  }

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.phone, dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: SendOtpDto) {
    return this.authService.logout(dto.phone);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update-profile')
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
