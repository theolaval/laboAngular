export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  category?: Category;
  imageUrl?: string;
  createdAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  products?: Product[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
}

export interface UpdateProductDto extends CreateProductDto {
  id: number;
}
