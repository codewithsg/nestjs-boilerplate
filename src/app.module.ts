import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/model/user.entity';
import { Token } from './auth/token/model/token.entity';
import { Product } from './products/model/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Token, Product],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(),
    ProductsModule,
    MulterModule.register({
      dest: './public',
    }),
  ],
})
export class AppModule {}

/* instead of using entities in TypeOrmModule we can use  autoLoadModels:true*/
