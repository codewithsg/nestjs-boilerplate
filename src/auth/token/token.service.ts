import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './model/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
  ) {}

  async create(userId: number) {
    const token = {
      value: String(Date.now()),
      userId: userId,
    };
    return await this.tokenRepository.save(token);
  }

  getByToken(token: string) {
    return this.tokenRepository.findOneBy({ value: token });
  }

  async remove(id: number) {
    return await this.tokenRepository.delete(id);
  }
}
