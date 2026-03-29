"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const nodemailer = __importStar(require("nodemailer"));
let AuthService = class AuthService {
    userModel;
    jwtService;
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { username, email, password } = registerDto;
        if (!username || !email || !password) {
            throw new common_1.BadRequestException('Please add all fields');
        }
        const userExists = await this.userModel.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            throw new common_1.BadRequestException('User already exists');
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
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email });
        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            return {
                _id: user.id,
                username: user.username,
                email: user.email,
                token: this.generateToken(user.id),
            };
        }
        else {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    generateToken(id) {
        return this.jwtService.sign({ id });
    }
    async forgotPassword(email) {
        if (!email) {
            throw new common_1.BadRequestException('Please provide an email address');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
