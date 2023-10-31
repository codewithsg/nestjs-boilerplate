export interface IProduct {
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: Array<string>;
  user_id: number;
}
