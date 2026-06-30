export interface SuperadminForm {
  name: string;
  email: string;
  password: string;
  cityId: string;
}

export interface AdministratorItem {
  id: number;
  name: string;
  email: string;
  cityId: number;
  role: string;
}