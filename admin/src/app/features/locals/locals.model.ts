export interface LocalForm {
  name:        string;
  phone:       string;
  description: string;
  address:     string;
  latitude:    string;
  longitude:   string;
  categoryId:  number | '';
}

export interface LocalItem {
  id:          number;
  name:        string;
  phone:       string;
  description: string;
  address:     string;
  categoryId:  number;
  category:    { id: number; name: string; icon: string };
  coordinates: { lat: number; lng: number } | null;
  cityId:      number;
}

export interface CategoryItem {
  id:   number;
  name: string;
  icon: string;
}