export interface IUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  verified: boolean;
  image: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
