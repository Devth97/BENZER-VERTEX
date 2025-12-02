
import { supabase } from '../supabaseClient';
import { CatalogItem, Customer, GalleryItem, GenerationResult } from '../types';

// --- STORAGE HELPER ---

// Converts Base64 to Blob and uploads to Supabase Storage
export const uploadImageToSupabase = async (base64Data: string, path: string): Promise<string> => {
  try {
    // 1. Convert Base64 to Blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();

    // 2. Upload
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    // 3. Get Public URL
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// --- CATALOG ---

export const fetchCatalog = async (): Promise<CatalogItem[]> => {
  const { data, error } = await supabase.from('catalog').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    imageUrl: item.image_url,
    tags: item.tags || []
  }));
};

export const addToCatalogDB = async (item: Omit<CatalogItem, 'id'>, base64Image: string): Promise<CatalogItem> => {
  // 1. Upload Image
  const publicUrl = await uploadImageToSupabase(base64Image, 'catalog');

  // 2. Insert Record
  const { data, error } = await supabase.from('catalog').insert({
    title: item.title,
    category: item.category,
    image_url: publicUrl,
    tags: item.tags
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    imageUrl: data.image_url,
    tags: data.tags
  };
};

export const deleteFromCatalogDB = async (id: string) => {
  const { error } = await supabase.from('catalog').delete().eq('id', id);
  if (error) throw error;
};

// --- CUSTOMERS ---

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) throw error;

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    email: item.email || '',
    photoUrl: item.photo_url
  }));
};

export const addCustomerDB = async (name: string, base64Image: string): Promise<Customer> => {
  const publicUrl = await uploadImageToSupabase(base64Image, 'customers');

  const { data, error } = await supabase.from('customers').insert({
    name,
    email: 'customer@example.com',
    photo_url: publicUrl
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    photoUrl: data.photo_url
  };
};

// --- GALLERY ---

export const fetchGallery = async (): Promise<GalleryItem[]> => {
  const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
  if (error) throw error;

  return data.map((item: any) => ({
    id: item.id,
    imageUrl: item.image_url,
    confidence: item.confidence,
    createdAt: new Date(item.created_at).getTime(),
    customer: item.customer_data,
    garment: item.garment_data,
    instructions: ''
  }));
};

export const addToGalleryDB = async (result: GenerationResult): Promise<GalleryItem> => {
  // Check if image is Base64 (freshly generated) or already a URL (if coming from simple save)
  let finalUrl = result.imageUrl;
  if (result.imageUrl.startsWith('data:')) {
    finalUrl = await uploadImageToSupabase(result.imageUrl, 'generated');
  }

  const { data, error } = await supabase.from('gallery').insert({
    image_url: finalUrl,
    confidence: result.confidence,
    customer_data: result.customer,
    garment_data: result.garment
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    imageUrl: data.image_url,
    confidence: data.confidence,
    createdAt: new Date(data.created_at).getTime(),
    customer: data.customer_data,
    garment: data.garment_data,
    instructions: result.instructions
  };
};
