"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage, deleteImage, updateImage } from "@/lib/storage";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  folder: "businesses" | "items";
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
  aspectRatio?: "square" | "wide";
}

export function ImageUpload({
  currentImageUrl,
  folder,
  onImageChange,
  disabled = false,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Mostrar preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Subir imagen inmediatamente
    setUploading(true);
    try {
      const result = await updateImage(
        selectedFile,
        folder,
        currentImageUrl || undefined
      );

      if (result.success && result.url) {
        onImageChange(result.url);
      } else {
        alert(result.error || "Error al subir imagen");
        setPreview(currentImageUrl || null);
        setFile(null);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir imagen");
      setPreview(currentImageUrl || null);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) {
      setPreview(null);
      setFile(null);
      onImageChange(null);
      return;
    }

    setUploading(true);
    try {
      const result = await deleteImage(currentImageUrl);
      if (result.success) {
        setPreview(null);
        setFile(null);
        onImageChange(null);
      } else {
        alert(result.error || "Error al eliminar imagen");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Error al eliminar imagen");
    } finally {
      setUploading(false);
    }
  };

  const aspectClasses = aspectRatio === "square" ? "aspect-square" : "aspect-video";
  const heightClass = aspectRatio === "square" ? "h-32" : "h-24";

  return (
    <div className="space-y-2">
      {!preview ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || uploading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">Subiendo...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Haz clic para subir una imagen
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG hasta 5MB
                </p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="relative border rounded-lg p-4 flex items-center gap-4">
          <div className={`relative ${heightClass} w-32 rounded-lg overflow-hidden bg-muted`}>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {file?.name || "Imagen actual"}
            </p>
            {file && (
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              id="image-upload-replace"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("image-upload-replace")?.click()}
              disabled={disabled || uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cambiar"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
