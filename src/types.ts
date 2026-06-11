/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MitraTier = 'distributor' | 'agen' | 'reseller' | 'retail';

export interface ColumnDefinition {
  name: string;
  type: string;
  constraints?: string;
  description: string;
}

export interface TableDefinition {
  tableName: string;
  description: string;
  columns: ColumnDefinition[];
  sqlScript: string;
}

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number; // Cost of Goods Sold / Production price
  retailPrice: number; // Suggested Customer Price
  distributorPrice: number; // Distributor Price
  agenPrice: number; // Agent Price
  resellerPrice: number; // Reseller Price
  stockCenter: number;
  image: string;
  pointsAwarded: number; // Points earned by Mitra per repeat order purchase
  description: string;
}

export interface MitraAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: MitraTier;
  province: string;
  city: string;
  pointsAccumulated: number;
  totalOrdersCount: number;
  totalOrderSpent: number;
  shopName: string;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  stockCenter: number;
  lastStockOpname: string;
  flowHistory: Array<{
    date: string;
    type: 'IN' | 'OUT_RO' | 'ADJUSTMENT';
    quantity: number;
    description: string;
    targetMitra?: string;
  }>;
}

export interface OrderItem {
  productId: string;
  lineTotal: number;
  quantity: number;
  unitPriceAtPurchase: number;
}

export interface OrderData {
  id: string;
  mitraId: string;
  mitraName: string;
  mitraTier: MitraTier;
  date: string;
  status: 'PENDING' | 'PROSES' | 'DIKIRIM' | 'SELESAI';
  items: OrderItem[];
  totalPrice: number;
  pointsEarned: number;
  trackingNumber?: string;
}

export interface RewardItem {
  id: string;
  name: string;
  pointsRequired: number;
  image: string;
  description: string;
  claimedCount: number;
}

export interface MarketingKit {
  id: string;
  title: string;
  category: 'PRODUCT_FOTO' | 'VIDEO_TESTIMONI' | 'COPYWRITING' | 'POSTER';
  fileUrl: string;
  fileSize: string;
  captionText?: string;
  downloadsCount: number;
}
