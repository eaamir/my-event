// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'default_secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    // Return userId as string to avoid ObjectId mismatch issues
    return {
      _id: user._id,
      phone: user.phone,
      role: user.role,
    };
  }
}
