export interface NewsForm {
  title: string;
  description: string;
  type: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
  isActive: boolean;
}

export interface NewsItem extends NewsForm {
  id: number;
}
