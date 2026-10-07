import { IsString, IsNotEmpty, Length, IsOptional, IsIn } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(['free', 'personal', 'family', 'business'])
  plan?: string;
}
