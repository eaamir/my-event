import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collection, CollectionDocument } from './schemas/collection.schema';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { GetCollectionsQueryDto } from './dto/get-collections.dto';
import { CreateCollectionSuperadminDto } from './dto/create-collection-superadmin.dto';
import { UpdateCollectionSuperadminDto } from './dto/update-collection-superadmin.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionModel: Model<CollectionDocument>,
  ) {}

  // ------------------ SUPERADMIN ------------------

  async findAll(query: GetCollectionsQueryDto) {
    const filter: any = {};

    if (query.name) filter.name = { $regex: query.name, $options: 'i' };

    if (query.owner_id && Types.ObjectId.isValid(query.owner_id)) {
      filter.owner = new Types.ObjectId(query.owner_id);
    }

    // ✅ Only convert and add status if it's a valid number
    const status = Number(query.status);
    if (!isNaN(status)) filter.status = status;

    const collections = await this.collectionModel
      .find(filter)
      .populate('owner');
    const total = await this.collectionModel.countDocuments(filter);

    return { data: collections, pagination: { total } };
  }

  async findOneBySuperadmin(id: string) {
    const collection = await this.collectionModel
      .findById(id)
      .populate('owner');
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async createBySuperadmin(dto: CreateCollectionSuperadminDto) {
    const newCollection = new this.collectionModel(dto);
    return newCollection.save();
  }

  async updateBySuperadmin(id: string, dto: UpdateCollectionSuperadminDto) {
    const collection = await this.collectionModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  // ------------------ OWNER ------------------

  async findAllOwn(
    ownerId: string | Types.ObjectId,
    query: GetCollectionsQueryDto,
  ) {
    const filter: any = {};

    filter.owner =
      typeof ownerId === 'string' ? new Types.ObjectId(ownerId) : ownerId;

    if (query.name) filter.name = { $regex: query.name, $options: 'i' };

    if (query.status !== undefined && query.status !== '') {
      const status = Number(query.status);
      if (!isNaN(status)) filter.status = status;
    }

    const collections = await this.collectionModel
      .find(filter)
      .select('-owner');

    return collections;
  }

  async findOneOwn(ownerId: string, id: string) {
    const collection = await this.collectionModel
      .findOne({ _id: id, owner: new Types.ObjectId(ownerId) })
      .select('-owner');

    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async createOwn(ownerId: string, dto: CreateCollectionDto) {
    if (!ownerId) throw new Error('Owner ID is required');

    const { name, organizers } = dto;

    // check for duplicate name
    const existingCollection = await this.collectionModel.findOne({
      name,
      owner: new Types.ObjectId(ownerId),
    });

    if (existingCollection) {
      throw new BadRequestException('مجموعه‌ای با این نام قبلا ثبت کردید');
    }

    // map organizers to ObjectId if provided
    const organizersIds = organizers?.map((id) => new Types.ObjectId(id)) || [];

    const newCollection = await this.collectionModel.create({
      ...dto,
      owner: new Types.ObjectId(ownerId),
      organizers: organizersIds,
    });

    return newCollection;
  }

  async updateOwn(ownerId: string, id: string, dto: UpdateCollectionDto) {
    const { name, organizers } = dto;

    // check duplicate
    const duplicate = await this.collectionModel.findOne({
      name,
      owner: new Types.ObjectId(ownerId),
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new BadRequestException('مجموعه‌ای با این نام قبلا ثبت کردید');
    }

    // build update object
    const updateData: any = { ...dto };

    if (organizers) {
      updateData.organizers = organizers.map((id) => new Types.ObjectId(id));
    }

    // update collection
    const collection = await this.collectionModel.findOneAndUpdate(
      { _id: id, owner: new Types.ObjectId(ownerId) },
      updateData,
      { new: true }, // ✅ return updated version
    );

    if (!collection) {
      throw new ForbiddenException('Collection not found or not accessible');
    }

    return collection;
  }

  // owner get active collections
  async findOwnActiveCollections(ownerId: string) {
    return this.collectionModel
      .find({
        owner: new Types.ObjectId(ownerId),
        status: 1, // only active collections
      })
      .lean();
  }

  // organizer get active collections
  async findAssignedCollections(userId: string) {
    return this.collectionModel
      .find({
        organizers: new Types.ObjectId(userId),
        status: 1, // only active collections
      })
      .lean();
  }
}
