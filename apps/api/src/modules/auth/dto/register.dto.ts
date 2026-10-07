import { IsString, IsNotEmpty, Length, Matches, IsOptional, IsDateString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100, { message: 'نام باید بین ۲ تا ۱۰۰ کاراکتر باشد' })
  fullName: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  otpCode?: string;
}
