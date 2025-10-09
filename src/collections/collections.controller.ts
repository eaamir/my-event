import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/schemas/user.schema';
import { CollectionsService } from './collections.service';
import { GetCollectionsQueryDto } from './dto/get-collections.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CreateCollectionSuperadminDto } from './dto/create-collection-superadmin.dto';
import { UpdateCollectionSuperadminDto } from './dto/update-collection-superadmin.dto';

@ApiTags('Collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // ------------------ SUPERADMIN ------------------

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get('superadmin')
  @ApiOperation({
    summary: 'Get all collections (superadmin)',
    description:
      'Returns a paginated list of all collections in the system. Only accessible by SUPERADMIN. Supports filtering by name and status.',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Number of collections per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Current page',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by collection name',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by collection status (0=INACTIVE, 1=ACTIVE)',
  })
  getAll(@Query() query: GetCollectionsQueryDto) {
    return this.collectionsService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get('superadmin/:id')
  @ApiOperation({
    summary: 'View collection by ID (superadmin)',
    description:
      'Retrieve details of any collection by its ID. Accessible only by SUPERADMIN.',
  })
  getByIdSuperadmin(@Param('id') id: string) {
    return this.collectionsService.findOneBySuperadmin(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Post('superadmin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({ destination: './uploads/collections' }),
        limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Create a new collection. SUPERADMIN can assign an owner by providing ownerId. Both logo and cover files are optional and max 1MB each.',
    type: CreateCollectionSuperadminDto,
  })
  createSuperadmin(
    @Body() dto: CreateCollectionSuperadminDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    if (files?.logo?.[0]) dto.logo = files.logo[0].path;
    if (files?.cover?.[0]) dto.cover = files.cover[0].path;
    return this.collectionsService.createBySuperadmin(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Put('superadmin/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({ destination: './uploads/collections' }),
        limits: { fileSize: 1 * 1024 * 1024 },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Update collection details. Files can be updated (logo or cover). SUPERADMIN can change ownerId to reassign collection.',
    type: UpdateCollectionSuperadminDto,
  })
  updateByIdSuperadmin(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionSuperadminDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    if (files?.logo?.[0]) dto.logo = files.logo[0].path;
    if (files?.cover?.[0]) dto.cover = files.cover[0].path;
    return this.collectionsService.updateBySuperadmin(id, dto);
  }

  // ------------------ OWNER ------------------

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Get()
  @ApiOperation({
    summary: 'Get all own collections (owner)',
    description:
      'Retrieve all collections created by the authenticated owner. Supports filtering by name and status.',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Number of collections per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Current page',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by collection name',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by collection status (0=INACTIVE, 1=ACTIVE)',
  })
  getAllOwn(@Req() req, @Query() query: GetCollectionsQueryDto) {
    return this.collectionsService.findAllOwn(req.user._id, query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Get(':id')
  @ApiOperation({
    summary: 'View a specific collection (owner)',
    description:
      'Owner can view details of a specific collection they own by providing collection ID.',
  })
  getOwnCollection(@Req() req, @Param('id') id: string) {
    return this.collectionsService.findOneOwn(req.user._id, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({ destination: './uploads/collections' }),
        limits: { fileSize: 1 * 1024 * 1024 },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Create a new collection. Owner can provide optional logo and cover files (max 1MB each).',
    type: CreateCollectionDto,
  })
  createOwn(
    @Req() req,
    @Body() dto: CreateCollectionDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    if (files?.logo?.[0]) dto.logo = files.logo[0].path;
    if (files?.cover?.[0]) dto.cover = files.cover[0].path;
    return this.collectionsService.createOwn(req.user._id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({ destination: './uploads/collections' }),
        limits: { fileSize: 1 * 1024 * 1024 },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Update own collection details. Logo or cover files can be replaced (max 1MB each).',
    type: UpdateCollectionDto,
  })
  updateOwn(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    if (files?.logo?.[0]) dto.logo = files.logo[0].path;
    if (files?.cover?.[0]) dto.cover = files.cover[0].path;
    return this.collectionsService.updateOwn(req.user._id, id, dto);
  }
}
