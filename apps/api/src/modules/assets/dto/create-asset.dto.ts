import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsIn,
  Min, Max, Length,
} from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['vehicle', 'property', 'appliance', 'electronics', 'financial', 'other'])
  type: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1300)
  @Max(1500)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  purchasePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentValue?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
