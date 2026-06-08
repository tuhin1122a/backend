import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private otpCache = new Map<string, { code: string; expires: number }>();
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'tuhinrahmna48@gmail.com',
      pass: process.env.SMTP_PASS || 'lmbk pvbt rucn ghnw',
    },
  });

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(email: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    this.otpCache.set(email, { code, expires });

    const mailOptions = {
      from: `"CoinVest Support" <${process.env.SMTP_USER || 'tuhinrahmna48@gmail.com'}>`,
      to: email,
      subject: 'CoinVest Account Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0d4c0; border-radius: 12px; background-color: #fffdf9;">
          <h2 style="color: #c85010; text-align: center;">CoinVest Vault Verification</h2>
          <p>Hello,</p>
          <p>Thank you for choosing CoinVest. Use the following One-Time Password (OTP) to complete your account registration:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; padding: 15px; background-color: #fdecd4; border-radius: 8px; color: #c85010; letter-spacing: 4px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 12px;">This OTP is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999; text-align: center;">© 2026 CoinVest. All rights simulated.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'OTP verification code sent to your email.' };
    } catch (e: any) {
      console.error('Mail send error:', e);
      throw new BadRequestException(`Failed to send verification email: ${e.message}`);
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vipTier: user.vipTier,
      },
    };
  }

  async adminLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid admin credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async register(name: string, email: string, password: string, otpCode: string) {
    // Verify OTP
    const cached = this.otpCache.get(email);
    if (!cached) {
      throw new BadRequestException('Please request an OTP code first.');
    }
    if (cached.code !== otpCode) {
      throw new BadRequestException('Invalid OTP code.');
    }
    if (Date.now() > cached.expires) {
      this.otpCache.delete(email);
      throw new BadRequestException('OTP code has expired.');
    }

    // OTP is valid! Delete it from cache
    this.otpCache.delete(email);

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = `${name.toUpperCase().replace(/\s/g, '').slice(0, 6)}${Date.now().toString().slice(-4)}`;

    const sysConfig = await this.prisma.systemConfig.findFirst();
    const welcomeBonus = sysConfig ? sysConfig.welcomeBonus : 1000;

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referralCode,
        coins: welcomeBonus,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
