import { Gender } from '@schemas/genderEnum.schema';

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  image_url?: string;
  role: Role;
  gender: Gender;
  permissions: string[];
  permission_titles: Record<string, string>;
}
