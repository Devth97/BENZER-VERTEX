
export interface CatalogItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  tags: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  photoUrl: string; // Base64 or URL
  measurements?: {
    height?: string;
    waist?: string;
  };
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface PreviewJob {
  id: string;
  customerId: string;
  catalogItemId: string;
  status: JobStatus;
  resultUrl?: string;
  confidenceScore?: number;
  prompt: string;
  modelUsed: string;
  createdAt: number;
  variant: 'base' | 'color_shade' | 'fit_variant' | 'embroidery';
}

export interface GenerationResult {
  imageUrl: string;
  confidence: number;
  customer: Customer;
  garment: CatalogItem;
  instructions: string;
}

export interface GalleryItem extends GenerationResult {
  id: string;
  createdAt: number;
  customer: Customer;
  garment: CatalogItem;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

export interface JobConfig {
  customer: Customer;
  garments: CatalogItem[];
  instructions: string;
  usePro: boolean;
}

export interface ProcessingState {
  status: JobStatus;
  currentStep: number;
  totalSteps: number;
  currentGarment: string;
}

export interface UserProfile {
  id: string;
  role: 'admin' | 'shop';
  shop_name?: string;
}
