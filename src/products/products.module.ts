import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './model/product.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/model/user.entity';
import { ResponseHelper } from 'src/response.helper';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: 'PRODUCT_SERVICE',
      useClass: ProductsService,
    },
    {
      provide: 'USER_SERVICE',
      useClass: UsersService,
    },
    ResponseHelper,
  ],
  imports: [TypeOrmModule.forFeature([Product, User])],
})
export class ProductsModule {}
