export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  image_url?: string;
  role: Role;
}
