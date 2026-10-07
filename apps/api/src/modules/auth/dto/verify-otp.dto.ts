import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^09[0-9]{9}$/)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'کد باید ۶ رقمی باشد' })
  code: string;
}
