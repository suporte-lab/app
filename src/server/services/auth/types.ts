export type SessionDTO = {
  id: string;
  userId: string;
  secretHash: Buffer;
  createdAt: Date;
};

export type UserDTO = {
  id: string;
  email: string;
  nickname: string;
  role: string;
  createdAt: Date;
};
