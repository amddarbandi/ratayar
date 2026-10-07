import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['obligation', 'family', 'system'])
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsIn(['critical', 'important', 'normal'])
  priority?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
