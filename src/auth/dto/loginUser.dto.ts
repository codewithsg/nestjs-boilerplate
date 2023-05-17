import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'Please enter your email address.' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Please enter password.' })
  @IsString()
  @Length(8, 30)
  password: string;
}
