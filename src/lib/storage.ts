"use server";

import { supabaseAdmin, BUCKET_NAME } from './supabase';

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo a subir
 * @param folder - Carpeta dentro del bucket (ej: 'businesses', 'items')
 * @param fileName - Nombre del archivo (opcional, se genera automáticamente si no se provee)
 * @returns URL pública de la imagen o null si falla
 */
export async function uploadImage(
  file: File,
  folder: 'businesses' | 'items',
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generar nombre único si no se provee
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const finalFileName = fileName || `${timestamp}-${randomString}.${fileExtension}`;
    
    // Ruta completa en el bucket
    const filePath = `${folder}/${finalFileName}`;

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Subir archivo
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param imageUrl - URL completa de la imagen a eliminar
 * @returns true si se eliminó correctamente, false si falló
 */
export async function deleteImage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extraer la ruta del archivo de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
    
    if (pathParts.length < 2) {
      return { success: false, error: 'URL inválida' };
    }

    const filePath = pathParts[1];

    // Eliminar archivo
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Actualiza una imagen (elimina la anterior y sube la nueva)
 * @param file - Nuevo archivo a subir
 * @param folder - Carpeta dentro del bucket
 * @param oldImageUrl - URL de la imagen anterior a eliminar (opcional)
 * @param fileName - Nombre del archivo (opcional)
 * @returns URL pública de la nueva imagen o null si falla
 */
export async function updateImage(
  file: File,
  folder: 'businesses' | 'items',
  oldImageUrl?: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Eliminar imagen anterior si existe
    if (oldImageUrl) {
      await deleteImage(oldImageUrl);
    }

    // Subir nueva imagen
    return await uploadImage(file, folder, fileName);
  } catch (error) {
    console.error('Error in updateImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
