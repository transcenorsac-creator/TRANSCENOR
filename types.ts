export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string; // Base64 or URL
  views: number;
}

export enum Category {
  TECNOLOGIA = 'Tecnología',
  MODA = 'Moda',
  HOGAR = 'Hogar',
  DEPORTES = 'Deportes',
  OTROS = 'Otros',
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewMode = 'STORE' | 'ADMIN' | 'CART';