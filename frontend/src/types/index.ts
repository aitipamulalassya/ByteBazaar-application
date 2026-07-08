export interface User {
  id: string;
  username: string;
  email: string;
}

export type ProductFileType =
  | "pdf"
  | "image"
  | "video"
  | "text"
  | "other";

export interface Product {
  id: number;

  name: string;
  description: string;

  thumbnail_url: string;

  file_url: string;
  file_type: string;

  file_size?: number;

  created_by?: number;
username: string;
  created_at?: string;
  updated_at?: string;
}