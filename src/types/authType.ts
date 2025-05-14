export interface Role {
  id: string;
  name: string;
}

export interface User {
  name: string;
  image_url?: string;
  role: Role;
}
