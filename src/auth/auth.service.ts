import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/users/schemas/user.schema';
import { Otp, OtpDocument } from './schemas/otp.schema';

function normalizeIranPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  let p = digits;

  if (p.startsWith('0098')) p = '0' + p.slice(4);
  else if (p.startsWith('98')) p = '0' + p.slice(2);
  else if (!p.startsWith('0')) p = '0' + p;

  if (!/^09\d{9}$/.test(p)) throw new Error('Invalid Iranian mobile number');
  return p;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    private readonly jwtService: JwtService,
  ) {}

  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  }

  async sendOtp(rawPhone: string) {
    const phone = normalizeIranPhone(rawPhone);

    // Prevent spamming
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await this.otpModel.countDocuments({
      phone,
      createdAt: { $gt: oneHourAgo },
    });
    if (recentOtps >= 5) throw new BadRequestException('Too many OTP requests');

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    await this.otpModel.create({ phone, otpHash, expiresAt, attempts: 0 });

    const tempToken = this.jwtService.sign(
      { phone },
      { secret: process.env.TEMP_SECRET, expiresIn: '5m' },
    );

    console.log(`OTP for ${phone}: ${otp}`);

    return { message: 'OTP sent', tempToken, otp }; // remove otp in production
  }

  async verifyOtp(otp: string, tempToken: string) {
    let phone: string;

    try {
      const payload: any = this.jwtService.verify(tempToken, {
        secret: process.env.TEMP_SECRET,
      });
      phone = payload.phone;
    } catch {
      throw new UnauthorizedException('Temp token invalid or expired');
    }

    const normalizedPhone = normalizeIranPhone(phone);

    const record = await this.otpModel
      .findOne({ phone: normalizedPhone })
      .sort({ createdAt: -1 });
    if (!record) throw new UnauthorizedException('OTP not found');
    if (record.expiresAt < new Date()) {
      await this.otpModel.deleteOne({ _id: record._id });
      throw new UnauthorizedException('OTP expired');
    }

    if (record.attempts >= 5)
      throw new UnauthorizedException('Too many wrong attempts');

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      record.attempts += 1;
      await record.save();
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.otpModel.deleteOne({ _id: record._id });

    // ✅ Find or create user
    let user = await this.userModel.findOne({ phone: normalizedPhone });

    if (!user) {
      user = await this.userModel.create({
        phone: normalizedPhone,
        isVerified: true,
        role: 'user',
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // ✅ Cast _id to string to remove 'unknown' error
    const userId = (user._id as Types.ObjectId).toString();

    // JWT payload
    const jwtPayload = { sub: userId, phone: user.phone, role: user.role };

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
    });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: userId,
        phone: user.phone,
        role: user.role,
        name: user.name,
        birth_date: user.birth_date,
        gender: user.gender,
        avatar: user.avatar,
        email: user.email,
      },
    };
  }

  async refreshToken(rawPhone: string, refreshToken: string) {
    const phone = normalizeIranPhone(rawPhone);
    const user = await this.userModel.findOne({ phone });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    // ✅ Cast _id to Types.ObjectId, then to string
    const userId = (user._id as Types.ObjectId).toString();

    const payload = {
      sub: userId,
      phone: user.phone,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRES_IN || '15m',
    });

    return { accessToken: newAccessToken };
  }
}
