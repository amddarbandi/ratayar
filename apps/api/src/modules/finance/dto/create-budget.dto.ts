import { IsString, IsNotEmpty, IsInt, Min, IsIn, Length } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  category: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsIn(['monthly', 'yearly'])
  period: string;
}
