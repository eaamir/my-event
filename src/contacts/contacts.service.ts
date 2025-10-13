import { GetContactsDto } from './dto/get-contacts.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(query: GetContactsDto, ownerId: string) {
    const { name, phone, gender, per_page, page } = query;

    const filters: any = { owner: new Types.ObjectId(ownerId) };

    if (name) filters.name = { $regex: name, $options: 'i' };
    if (phone) filters.phone = { $regex: phone, $options: 'i' };

    if (gender) {
      const genderStr = String(gender);
      if (genderStr === '1' || genderStr === '2') {
        filters.gender = Number(genderStr);
      }
    }

    const limit = per_page ? Number(per_page) : 15;
    const currentPage = page ? Number(page) : 1;
    const skip = (currentPage - 1) * limit;

    const contacts = await this.contactModel
      .find(filters)
      .skip(skip)
      .limit(limit);
    const total = await this.contactModel.countDocuments(filters);

    return { contacts, total, page: currentPage, per_page: limit };
  }

  async findOne(id: string, ownerId: string) {
    const contact = this.contactModel.findOne({
      _id: id,
      owner: new Types.ObjectId(ownerId),
    });

    if (!contact) throw new NotFoundException('Contact not found');

    return contact;
  }

  async create(createContactDto: CreateContactDto, ownerId: string) {
    if (!ownerId) throw new Error('Owner id is required');

    const { name, phone } = createContactDto;

    const existingContactPhone = await this.contactModel.findOne({
      owner: new Types.ObjectId(ownerId),
      phone,
    });
    const existingContactName = await this.contactModel.findOne({
      owner: new Types.ObjectId(ownerId),
      name,
    });

    if (existingContactPhone) {
      throw new BadRequestException('شماره تماس وارد شده قبلاً ثبت شده است');
    }

    if (existingContactName) {
      throw new BadRequestException('نام کاربر وارد شده قبلاً ثبت شده است');
    }

    const existingUser = await this.userModel.findOne({ phone });

    const ownerObjectId = new Types.ObjectId(ownerId);

    if (
      existingUser &&
      (existingUser._id as Types.ObjectId).equals(ownerObjectId)
    ) {
      throw new BadRequestException(
        'شماره تماس وارد شده، شماره تماس خود شماست',
      );
    }

    if (!existingUser) {
      await this.userModel.create({
        phone: phone,
        status: 1,
        role: 'user',
      });
    }

    const createdContact = await this.contactModel.create({
      ...createContactDto,
      owner: new Types.ObjectId(ownerId),
    });

    return createdContact;
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    ownerId: string,
  ) {
    if (!ownerId) throw new Error('Owner id is required');

    const { name, phone } = updateContactDto;

    const existingContactPhone = await this.contactModel.findOne({
      owner: new Types.ObjectId(ownerId),
      phone,
    });
    const existingContactName = await this.contactModel.findOne({
      owner: new Types.ObjectId(ownerId),
      name,
    });

    if (
      existingContactPhone &&
      (existingContactPhone._id as Types.ObjectId).toString() !== id
    ) {
      throw new BadRequestException('شماره تماس وارد شده قبلاً ثبت شده است');
    }

    if (
      existingContactName &&
      (existingContactName._id as Types.ObjectId).toString() !== id
    ) {
      throw new BadRequestException('نام کاربر وارد شده قبلاً ثبت شده است');
    }

    const existingUser = await this.userModel.findOne({ phone });

    const ownerObjectId = new Types.ObjectId(ownerId);

    if (
      existingUser &&
      (existingUser._id as Types.ObjectId).equals(ownerObjectId)
    ) {
      throw new BadRequestException(
        'شماره تماس وارد شده، شماره تماس خود شماست',
      );
    }

    if (!existingUser) {
      await this.userModel.create({
        phone: phone,
        status: 1,
        role: 'user',
      });
    }

    const updatedContact = await this.contactModel.findByIdAndUpdate(
      {
        _id: id,
        owner: new Types.ObjectId(ownerId),
      },
      updateContactDto,
      { new: true },
    );

    if (!updatedContact) throw new NotFoundException('Contact not found');

    return updatedContact;
  }

  async remove(id: string, ownerId: string) {
    if (!ownerId) throw new Error('Owner id is required');

    const deletedContact = await this.contactModel.findOneAndDelete({
      _id: id,
      owner: new Types.ObjectId(ownerId),
    });

    if (!deletedContact) throw new NotFoundException('Contact not found');

    return deletedContact;
  }
}
