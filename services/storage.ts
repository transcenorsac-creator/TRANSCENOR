import { Product, Category } from '../types';

const STORAGE_KEY = 'catalogo_products';

const INITIAL_DATA: Product[] = [
  {
    id: '1',
    name: 'Auriculares Premium',
    description: 'Sonido de alta fidelidad con cancelación de ruido activa.',
    price: 150.00,
    category: Category.TECNOLOGIA,
    image: 'https://picsum.photos/400/400?random=1',
    views: 120
  },
  {
    id: '2',
    name: 'Zapatillas Running',
    description: 'Diseño ergonómico para máximo rendimiento en pista.',
    price: 89.99,
    category: Category.DEPORTES,
    image: 'https://picsum.photos/400/400?random=2',
    views: 85
  },
  {
    id: '3',
    name: 'Reloj Inteligente',
    description: 'Monitorea tu salud y notificaciones al instante.',
    price: 210.50,
    category: Category.TECNOLOGIA,
    image: 'https://picsum.photos/400/400?random=3',
    views: 200
  }
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(stored);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const incrementView = (id: string): void => {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    product.views += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
};