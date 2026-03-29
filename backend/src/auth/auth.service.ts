import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: any) {
    const { username, email, password } = registerDto;
    
    if (!username || !email || !password) {
      throw new BadRequestException('Please add all fields');
    }

    const userExists = await this.userModel.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    return {
      _id: user.id,
      username: user.username,
      email: user.email,
      token: this.generateToken(user.id),
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      return {
        _id: user.id,
        username: user.username,
        email: user.email,
        token: this.generateToken(user.id),
      };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private generateToken(id: string) {
    return this.jwtService.sign({ id });
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Please provide an email address');
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return { message: 'If that email is registered, a password reset email has been sent.' };
    }

    // Generate random 8 character string for temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Update user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Setup nodemailer Ethereal test account (mocks emails and provides a preview URL)
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"Uninsta Team 🎓" <no-reply@uninsta.edu>',
      to: user.email,
      subject: 'Uninsta Password Reset Request',
      text: `Hello ${user.username},\n\nWe received a request to reset your password. Since we employ robust encryption, we cannot retrieve your old password. Instead, we have generated a secure temporary password for you.\n\nYour temporary password is: ${tempPassword}\n\nPlease login with this temporary password and update your profile settings as soon as possible.\n\nThanks,\nThe Uninsta Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #5b21b6;">Uninsta Password Reset</h2>
          <p>Hello ${user.username},</p>
          <p>We received a request to reset your password. Since we employ robust encryption, we cannot retrieve your old password. Instead, we have generated a secure temporary password for you.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">Temporary Password:</p>
            <h3 style="margin: 5px 0 0 0; font-family: monospace; font-size: 24px; color: #0f172a;">${tempPassword}</h3>
          </div>
          <p>Please login with this temporary password and change it as soon as possible.</p>
          <p>Thanks,<br/>The Uninsta Team</p>
        </div>
      `,
    });

    console.log('Ethereal Password Reset Email Sent!');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return { message: 'If that email is registered, a password reset email has been sent.' };
  }
}
