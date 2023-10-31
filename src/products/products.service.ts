import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './model/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/CreateProduct.dto';
import { IProduct } from 'src/types/product.type';
import { UpdateProductDto } from './dto/UpdateProduct.dto';

type TUpdateProduct = UpdateProductDto | Partial<IProduct>;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number) {
    return await this.productRepository.save({
      ...createProductDto,
      userId: userId,
    });
  }

  findAll() {
    return this.productRepository.find();
  }

  findById(id: number) {
    return this.productRepository.findOneBy({ id });
  }

  async update(id: number, updateDetail: TUpdateProduct) {
    let product = await this.productRepository.findOneBy({ id });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    // delete product.userId;
    product = { ...product, ...updateDetail };
    return await this.productRepository.save(product);
  }

  async remove(id: number) {
    return await this.productRepository.softDelete({ id });
  }
}
