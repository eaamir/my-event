import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserWithoutRoleDto extends OmitType(
  PartialType(UpdateUserDto),
  ['role', 'credit', 'blocked_credit', 'status', 'phone'] as const,
) {}
