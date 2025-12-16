export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  publicId: string;
  color: number;
  profileSetup: boolean;
  refreshToken: string;
}

export interface IMesaage {
  sender: string;
  recipient: string;
  messageType: "text" | "file";
  content: string;
  fileName: string;
  fileType: string;
  fileURL: string;
  size: string;
  createdAt: Date;
  updatedAt: Date;
}
