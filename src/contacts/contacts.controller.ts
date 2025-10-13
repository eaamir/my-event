import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { GetContactsDto } from './dto/get-contacts.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Get contacts list',
    description:
      'Returns a list of all of their contacts. Only OWNER can access.',
  })
  @ApiResponse({ status: 200, description: 'List of contacts returned.' })
  @Get()
  findAll(@Query() query: GetContactsDto, @Request() req) {
    return this.contactsService.findAll(query, req.user._id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: "Get a contact's data",
    description: 'Returns data of specific contact. Only OWNER can access.',
  })
  @ApiResponse({ status: 200, description: "Contact's info returned." })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.contactsService.findOne(id, req.user._id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Create contact',
    description: 'Add contact to your list. Only OWNER can access.',
  })
  @ApiResponse({ status: 200, description: 'Contact created.' })
  @Post()
  create(@Body() createContactDto: CreateContactDto, @Request() req) {
    return this.contactsService.create(createContactDto, req.user._id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Update contact',
    description: 'Update specific contact. Only OWNER can access.',
  })
  @ApiResponse({ status: 200, description: 'Contact updated.' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Request() req,
  ) {
    return this.contactsService.update(id, updateContactDto, req.user._id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Delete contact',
    description: 'Delete specific contact. Only OWNER can access.',
  })
  @ApiResponse({ status: 200, description: 'Contact deleted.' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.contactsService.remove(id, req.user._id);
  }
}
