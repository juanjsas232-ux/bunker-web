export interface Product {
  id: string;
  name: string;
  category: string | null;
  purchase_price: number;
  sale_price: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  product_id: string;
  products?: { name: string; sale_price: number };
  quantity: number;
  total: number;
  sold_at?: string;
}

export interface Expense {
  id: string;
  category: string | null;
  amount: number;
  description: string | null;
  incurred_at?: string;
}
