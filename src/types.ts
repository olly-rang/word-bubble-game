export interface Bubble {
  id: string;
  x: number;
  y: number;
  radius: number;
  word: string;
  color: string;
  isGolden: boolean;
  velocity: { x: number; y: number };
}

export type Theme = 'sunny' | 'rainy' | 'night';

export const WORD_LIST = [
  { kr: '오이', en: 'Cucumber' },
  { kr: '가지', en: 'Eggplant' },
  { kr: '두부', en: 'Tofu' },
  { kr: '마트', en: 'Mart' },
  { kr: '파', en: 'Green Onion' },
  { kr: '고추', en: 'Chili' }
];

export const COLORS = [
  'rgba(168, 230, 207, 0.6)', // Mint
  'rgba(255, 211, 182, 0.6)', // Peach
  'rgba(255, 170, 165, 0.6)', // Salmon
  'rgba(255, 255, 190, 0.6)', // Lemon
  'rgba(209, 188, 227, 0.6)'  // Lavender
];

export interface Skin {
  id: string;
  name: string;
  type: 'classic' | 'premium';
  price?: number;
}

export const SKINS: Skin[] = [
  { id: 'default', name: 'Original Zen', type: 'classic' },
  { id: 'cat-paw', name: 'Cat Paw', type: 'premium', price: 100 },
  { id: 'macaron', name: 'Sweet Macaron', type: 'premium', price: 150 }
];
