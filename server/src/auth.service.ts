import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './database/schemas';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(username: string, email: string, passwordPlain: string) {
    const existing = await this.userModel.findOne({ username });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const createdUser = new this.userModel({
      username,
      email,
      passwordHash,
    });
    
    await createdUser.save();
    return { message: 'User registered successfully' };
  }

  async login(username: string, passwordPlain: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, username: user.username, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: (this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
        avatar: user.avatar || user.username.substring(0, 2).toUpperCase()
      }
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      
      const newPayload = { sub: payload.sub, username: payload.username, role: payload.role };
      
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: (this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d') as any,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
