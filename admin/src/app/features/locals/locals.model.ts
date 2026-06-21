export interface LocalForm {
    name:        string;
    phone:       string;
    description: string;
    latitude:    string;
    longitude:   string;
    category:    string;
}

export interface LocalItem extends LocalForm {
    id:          number;
}