export const ROLE = {
  admin: 'ADMIN',
  seller: 'SELLER',
  buyer: 'BUYER',
  all: ['ADMIN', 'SELLER', 'BUYER'],
};

export const TABLE_NAME = {
  user: 'users',
  product: 'products',
  payment: 'payments',
  token: 'tokens',
};

export enum UserRole {
  Admin = 'ADMIN',
  Seller = 'SELLER',
  Buyer = 'BUYER',
}
