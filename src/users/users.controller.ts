import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserWithoutRoleDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { GetUsersQueryDto } from './dto/get-users.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns a list of all users. Only SUPERADMIN can access.',
  })
  @ApiResponse({ status: 200, description: 'List of users returned.' })
  getAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('own-information')
  @ApiOperation({
    summary: 'Get own information',
    description: 'User can get their own information.',
  })
  @ApiResponse({ status: 200, description: 'Current user info returned.' })
  getOwn(@Request() req) {
    return this.usersService.findOwnInfo(req.user._id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update')
  @ApiOperation({
    summary: 'Update own profile',
    description: 'User can update their own information.',
  })
  @ApiBody({
    type: UpdateUserWithoutRoleDto,
    description: 'Fields to update own profile',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  updateOwn(@Request() req, @Body() dto: UpdateUserWithoutRoleDto) {
    return this.usersService.updateOwn(req.user._id, dto);
  }

  // --- AVATAR ENDPOINTS ---
  @UseGuards(AuthGuard('jwt'))
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      dest: './uploads/avatars',
      limits: { fileSize: 1 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadAvatar(req.user._id, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('avatar')
  @ApiOperation({ summary: 'Delete own avatar' })
  deleteAvatar(@Request() req) {
    return this.usersService.deleteAvatar(req.user._id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns a data of a user. Only SUPERADMIN can access.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User data returned.' })
  getOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user. Only SUPERADMIN can access.',
  })
  @ApiBody({ type: CreateUserDto, description: 'Data for new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Put(':id')
  @ApiOperation({
    summary: 'Update a user',
    description: 'Updates a user. Only SUPERADMIN can access.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiBody({ type: UpdateUserDto, description: 'Fields to update' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete specific user',
    description:
      'Deletes a user and returns their data in response. Only SUPERADMIN can access.',
  })
  @ApiResponse({ status: 200, description: 'User deleted.' })
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
