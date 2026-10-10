import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @Length(2, 40)
  @Matches(/^[\u0600-\u06FF\s\u200c]+$/, {
    message: 'نام باید فقط شامل حروف فارسی باشد',
  })
  firstName!: string;

  @IsString()
  @Length(2, 40)
  @Matches(/^[\u0600-\u06FF\s\u200c]+$/, {
    message: 'نام خانوادگی باید فقط شامل حروف فارسی باشد',
  })
  lastName!: string;

  @IsString()
  @Length(2, 40)
  @Matches(/^[\u0600-\u06FF\s\u200c]+$/, {
    message: 'نام پدر باید فقط شامل حروف فارسی باشد',
  })
  fatherName!: string;

  @IsString()
  @Length(10, 10)
  nationalId!: string;

  @IsString()
  @Length(1, 10)
  idNumber!: string;

  @IsString()
  @Length(10, 10)
  birthDate!: string; // Jalali "1370/05/20"

  @IsString()
  @Length(10, 500)
  address!: string;

  @IsString()
  @Length(10, 10)
  postalCode!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
