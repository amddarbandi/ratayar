import { IsString, IsNotEmpty, Matches, IsOptional, IsIn } from 'class-validator';

export class InviteMemberDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل نامعتبر است' })
  phone: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'member', 'observer', 'child', 'elder'])
  role?: string;

  @IsOptional()
  @IsString()
  @IsIn(['spouse', 'child', 'parent', 'sibling', 'in_law', 'other'])
  relation?: string;
}
