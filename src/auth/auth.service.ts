import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { UpdateUserDto } from './dto/user.dto';

function normalizeIranPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // حذف prefix های مختلف
  let p = digits;
  if (p.startsWith('0098')) p = p.slice(4);
  if (p.startsWith('98')) p = p.slice(2);
  if (p.startsWith('0')) p = p.slice(1);
  // حالا باید با 9 شروع کنه و طول 10 باشه (9XXXXXXXXX)
  if (!/^9\d{9}$/.test(p)) throw new Error('Invalid Iranian mobile number');
  return '+98' + p;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  }

  async sendOtp(rawPhone: string) {
    const phone = normalizeIranPhone(rawPhone);

    // Rate-limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await this.otpModel.countDocuments({
      phone,
      createdAt: { $gt: oneHourAgo },
    });
    // if (recentCount > 5)
    //   throw new BadRequestException('Too many requests, try later');

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.otpModel.create({ phone, otpHash, expiresAt, attempts: 0 });

    // تولید temp token
    const tempToken = this.jwtService.sign(
      { phone },
      { secret: process.env.TEMP_SECRET, expiresIn: '5m' },
    );

    console.log(`OTP for ${phone}: ${otp}`);
    return {
      success: true,
      message: 'OTP sent (in dev printed to console)',
      tempToken,
      otp,
    };
  }

  // async verifyOtp(rawPhone: string, otp: string) {
  //   const phone = normalizeIranPhone(rawPhone);
  //   const record = await this.otpModel
  //     .findOne({ phone })
  //     .sort({ createdAt: -1 });

  //   if (!record) throw new UnauthorizedException('OTP not found');
  //   if (record.expiresAt < new Date()) {
  //     await this.otpModel.deleteOne({ _id: record._id });
  //     throw new UnauthorizedException('OTP expired');
  //   }
  //   if (record.attempts >= 5) {
  //     throw new UnauthorizedException('Too many wrong attempts');
  //   }

  //   const match = await bcrypt.compare(otp, record.otpHash);
  //   if (!match) {
  //     record.attempts += 1;
  //     await record.save();
  //     throw new UnauthorizedException('Invalid OTP');
  //   }

  //   // OTP ok -> otp delete
  //   await this.otpModel.deleteOne({ _id: record._id });

  //   // find or create user
  //   let user = await this.userModel.findOne({ phone });
  //   if (!user) {
  //     user = await this.userModel.create({
  //       phone,
  //       isVerified: true,
  //     });
  //   } else if (!user.isVerified) {
  //     user.isVerified = true;
  //     await user.save();
  //   }

  //   //  tokens
  //   const payload = { sub: user.id, phone: user.phone };

  //   const accessToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_ACCESS_SECRET,
  //     expiresIn: process.env.ACCESS_EXPIRES_IN || '15m',
  //   });
  //   const refreshToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_REFRESH_SECRET,
  //     expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  //   });

  //   // refresh token
  //   user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  //   await user.save();

  //   return {
  //     accessToken,
  //     refreshToken,
  //     user: { phone: user.phone, id: user._id },
  //   };
  // }

  async verifyOtp(otp: string, tempToken: string) {
    // phone از tempToken
    let phone: string;
    try {
      const payload = this.jwtService.verify(tempToken, {
        secret: process.env.TEMP_SECRET,
      });
      phone = payload.phone;
    } catch (e) {
      throw new UnauthorizedException('Temp token invalid or expired');
    }

    const record = await this.otpModel
      .findOne({ phone })
      .sort({ createdAt: -1 });

    if (!record) throw new UnauthorizedException('OTP not found');
    if (record.expiresAt < new Date()) {
      await this.otpModel.deleteOne({ _id: record._id });
      throw new UnauthorizedException('OTP expired');
    }
    if (record.attempts >= 5) {
      throw new UnauthorizedException('Too many wrong attempts');
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      record.attempts += 1;
      await record.save();
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.otpModel.deleteOne({ _id: record._id });

    // find or create user
    let user = await this.userModel.findOne({ phone });
    if (!user) {
      user = await this.userModel.create({ phone, isVerified: true });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // tokens
    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRES_IN || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
    });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: { phone: user.phone, id: user._id },
    };
  }

  async refreshToken(rawPhone: string, refreshToken: string) {
    const phone = normalizeIranPhone(rawPhone);
    const user = await this.userModel.findOne({ phone });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException();

    const payload = { sub: user.id, phone: user.phone };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRES_IN || '15m',
    });

    return { accessToken };
  }

  async logout(rawPhone: string) {
    const phone = normalizeIranPhone(rawPhone);
    const user = await this.userModel.findOne({ phone });
    if (!user) return { ok: true };
    user.refreshTokenHash = null;
    await user.save();
    return { ok: true };
  }

  async updateProfileByPhone(phone: string, dto: UpdateUserDto) {
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new UnauthorizedException('User not found');

    if (dto.name) user.name = dto.name;
    if (dto.age) user.age = dto.age;

    await user.save();
    return { message: 'Profile updated', user };
  }

  async getProfileByPhone(phone: string) {
    const user = await this.userModel
      .findOne({ phone })
      .select('-refreshTokenHash');
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async findAll() {
    return this.userModel.find().exec();
  }
}
