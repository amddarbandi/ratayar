import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
  Matches,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'کد پلن فقط حروف کوچک، عدد، - و _',
  })
  @Length(2, 30)
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  priceMonthly: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceYearly?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  maxMembers: number;

  @IsInt()
  @Min(-1)
  maxObligations: number;

  @IsInt()
  @Min(-1)
  maxAssets: number;

  @IsInt()
  @Min(-1)
  maxDocuments: number;

  @IsInt()
  @Min(1)
  maxStorageMB: number;

  @IsInt()
  @Min(1)
  maxUploadMB: number;

  @IsOptional()
  @IsObject()
  features?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
