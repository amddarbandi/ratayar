import {
  IsString, IsNotEmpty, IsOptional, IsDateString,
  IsInt, IsArray, IsIn, Min, Max, Length,
} from 'class-validator';

export class CreateObligationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  @IsIn(['financial', 'health', 'life', 'family', 'business'])
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['critical', 'important', 'normal', 'optional'])
  priority?: string;

  @IsOptional()
  @IsString()
  @IsIn(['once', 'daily', 'weekly', 'monthly', 'yearly'])
  repeatType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  repeatInterval?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  alertDays?: number[];

  @IsOptional()
  @IsString()
  assetId?: string;
}
