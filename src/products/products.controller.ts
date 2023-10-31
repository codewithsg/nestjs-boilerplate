import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  SetMetadata,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { AllExceptionFilter } from 'src/exceptions/AllException.filter';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/guards/decorator/roles.decorator';
import { UserRole } from 'src/utils/constants';
import { CreateProductDto } from './dto/CreateProduct.dto';
import { ProductsService } from './products.service';
import { Request } from 'express';
import { CheckDataAvailabilityGuard } from 'src/guards/checkDataAvailability.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer';
import { ResponseHelper } from 'src/response.helper';
import { Product } from './model/product.entity';
import { UpdateProductDto } from './dto/UpdateProduct.dto';

@UseGuards(AuthenticationGuard)
@UseFilters(AllExceptionFilter)
@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productService: ProductsService,
    @Inject(ResponseHelper) private readonly responseHelper: ResponseHelper,
  ) {}

  /**
   * @Roles check for role of user and have to use @UseGuards to access roleGuard
   * @param createProductDto
   * @param req
   * @returns
   */
  @Roles(UserRole.Seller)
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const product = await this.productService.create(
      createProductDto,
      req.authorizedUser.id,
    );
    if (!product) {
      throw new BadRequestException('Cannot create product.');
    }
    return this.responseHelper.sendSuccessRes(
      'Product created successfully.',
      HttpStatus.OK,
      product,
    );
  }

  @Get()
  async getAllProducts() {
    const products = await this.productService.findAll();
    return this.responseHelper.sendSuccessRes(
      'Products fetched successfully.',
      HttpStatus.OK,
      products,
    );
  }

  @Patch('/:productId/change-product-picture')
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig('product')))
  async changeProductPicture(
    @UploadedFiles() files,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    if (!files) throw new BadRequestException('Cannot upload image file.');
    const image: string[] = [];

    files.forEach((files) => {
      image.push(files.path);
    });
    console.log('image:', files);
    const updatedProduct = await this.productService.update(productId, {
      image,
    });
    return this.responseHelper.sendSuccessRes(
      "Product's image updated successfully.",
      HttpStatus.OK,
      updatedProduct,
    );
  }

  @Get('/:productId')
  async getProductById(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.responseHelper.sendSuccessRes(
      'Product fetched successfully.',
      HttpStatus.OK,
      product,
    );
  }

  /**
   * here @UseGuards (CheckDataAvailabilityGuard) checks for if data is available for update or not
   * @param productId
   * @param updateDetail
   * @returns
   */
  @UseGuards(CheckDataAvailabilityGuard)
  @SetMetadata('entityClass', Product)
  @SetMetadata('idName', 'productId')
  @Roles(UserRole.Seller, UserRole.Admin)
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Patch('/:productId')
  async updateProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateDetail: UpdateProductDto,
  ) {
    const product = await this.productService.update(productId, updateDetail);
    return this.responseHelper.sendSuccessRes(
      'Product updated successfully.',
      HttpStatus.OK,
      product,
    );
  }

  @Roles(UserRole.Seller, UserRole.Admin)
  @UseGuards(CheckDataAvailabilityGuard)
  @SetMetadata('entityClass', Product)
  @SetMetadata('idName', 'productId')
  @Delete('/:productId')
  async deleteProduct(@Param('productId', ParseIntPipe) productId: number) {
    await this.productService.remove(productId);
    return this.responseHelper.sendSuccessRes(
      'Product deleted successfully.',
      HttpStatus.OK,
    );
  }
}
