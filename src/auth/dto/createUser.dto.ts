import { IsEmail, IsEnum, IsNotEmpty, Length, Matches } from 'class-validator';
import { ROLE } from 'src/utils/constants';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Should not be empty' })
  firstname: string;

  @IsNotEmpty({ message: 'Should not be empty' })
  lastname: string;

  @IsEmail({})
  email: string;

  @IsNotEmpty()
  @Length(8, 30)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsEnum(ROLE.all)
  role: string;
}
