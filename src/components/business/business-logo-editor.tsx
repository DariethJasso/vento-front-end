"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { updateBusinessLogo } from "@/app/actions/business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessLogoEditorProps {
  businessId: string;
  currentLogo: string | null;
}

export function BusinessLogoEditor({ businessId, currentLogo }: BusinessLogoEditorProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogo);
  const [saving, setSaving] = useState(false);

  const handleLogoChange = async (url: string | null) => {
    setSaving(true);
    try {
      const result = await updateBusinessLogo({
        businessId,
        logoUrl: url,
      });

      if (result.success) {
        setLogoUrl(url);
      } else {
        alert(result.error || "Error al actualizar el logo");
      }
    } catch (error) {
      console.error("Error updating logo:", error);
      alert("Error al actualizar el logo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo del Negocio</CardTitle>
        <CardDescription>
          Sube o cambia el logo de tu negocio. Se mostrará en reportes y documentos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ImageUpload
          currentImageUrl={logoUrl}
          folder="businesses"
          onImageChange={handleLogoChange}
          disabled={saving}
          aspectRatio="square"
        />
      </CardContent>
    </Card>
  );
}
