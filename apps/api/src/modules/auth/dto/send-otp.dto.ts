import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل نامعتبر است' })
  phone: string;
}
