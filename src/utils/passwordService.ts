import { NotAcceptableException } from '@nestjs/common';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export function hashPassword(rawPassword: string) {
  if (!passwordRegex.test(rawPassword)) {
    throw new NotAcceptableException('Password too weak');
  }

  const SALT = genSaltSync();
  return hashSync(rawPassword, SALT);
}

export function comparePassword(rawPassword: string, hashedPassword: string) {
  return compareSync(rawPassword, hashedPassword);
}
