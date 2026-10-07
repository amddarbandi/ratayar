import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  Length,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل نامعتبر است' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // SEC-003: کد ورود دو مرحله‌ای (اختیاری در مرحله اول)
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'کد ورود دو مرحله‌ای باید ۶ رقمی باشد' })
  twoFaCode?: string;
}
