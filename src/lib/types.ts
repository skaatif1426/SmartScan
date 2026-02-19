export interface Product {
  code: string;
  product: {
    product_name: string;
    brands: string;
    image_front_url: string;
    nutriments: {
      "energy-kcal_100g"?: number;
      fat_100g?: number;
      "saturated-fat_100g"?: number;
      carbohydrates_100g?: number;
      sugars_100g?: number;
      proteins_100g?: number;
      salt_100g?: number;
    };
    ingredients_text_with_allergens: string;
    nutriscore_grade?: string;
    nova_group?: number;
    allergens_tags: string[];
    categories: string;
  };
  status: number;
}

export interface ScanHistoryItem {
  barcode: string;
  productName: string;
  brand: string;
  imageUrl?: string;
  scanDate: string;
}

export type Language = 'English' | 'Hindi' | 'Marathi' | 'Hinglish';

export interface UserSettings {
  language: Language;
  isVeg: boolean;
  isNonVeg: boolean;
  allergies: string[];
  advancedUiMode: boolean; // For the "J9s"-like feature
}
