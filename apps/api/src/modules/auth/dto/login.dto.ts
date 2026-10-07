import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل نامعتبر است' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  twoFaCode?: string;
}
