import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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
}
