import {
  IsString, IsNotEmpty, IsOptional, IsIn, IsInt,
  Min, IsDateString, Length,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['income', 'expense'])
  type: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  category: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
