// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(query: GetUsersQueryDto) {
    const { per_page, page, name, phone, gender, role, status } = query;

    const filters: any = {};

    // Filters for name & phone
    if (name) filters.name = { $regex: name, $options: 'i' };
    if (phone) filters.phone = { $regex: phone, $options: 'i' };

    // Convert to string for safe comparison
    const genderStr = gender !== undefined ? String(gender) : undefined;
    const statusStr = status !== undefined ? String(status) : undefined;

    // Gender filter
    if (genderStr === '1' || genderStr === '2') {
      filters.gender = Number(genderStr); // 1 or 2
    }

    // Status filter
    if (statusStr === '0' || statusStr === '1') {
      filters.status = Number(statusStr); // 0 or 1
    }

    // Role filter
    if (role) filters.role = role;

    // Pagination
    const limit = per_page ? Number(per_page) : 20;
    const currentPage = page ? Number(page) : 1;
    const skip = (currentPage - 1) * limit;

    // Fetch users
    const users = await this.userModel.find(filters).skip(skip).limit(limit);

    const total = await this.userModel.countDocuments(filters);

    return { users, total, page: currentPage, per_page: limit };
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOwnInfo(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateOwn(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
