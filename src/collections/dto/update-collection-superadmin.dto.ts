import { PartialType } from '@nestjs/swagger';
import { CreateCollectionSuperadminDto } from './create-collection-superadmin.dto';

export class UpdateCollectionSuperadminDto extends PartialType(
  CreateCollectionSuperadminDto,
) {}
