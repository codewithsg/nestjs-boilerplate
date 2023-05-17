import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  name: string;

  @IsOptional()
  @Length(20, 500)
  description: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsNumber()
  @IsOptional()
  @Max(1000)
  quantity: number;

  @IsArray()
  @IsOptional()
  image: string[];
}
