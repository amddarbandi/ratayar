import { IsOptional, IsIn, IsString } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'member', 'observer', 'child', 'elder'])
  role?: string;

  @IsOptional()
  @IsString()
  @IsIn(['spouse', 'child', 'parent', 'sibling', 'in_law', 'other'])
  relation?: string;
}
