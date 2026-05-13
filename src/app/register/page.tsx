"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import AuthLayout from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { uploadImage } from "@/lib/storage";

const Register = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const businessName = formData.get("businessName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Subir logo si existe
      let logoUrl = null;
      if (logoFile) {
        const uploadResult = await uploadImage(logoFile, "businesses");
        if (uploadResult.success) {
          logoUrl = uploadResult.url;
        }
      }

      // Registrar usuario
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          businessName,
          logoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear cuenta");
        return;
      }

      // Auto-login después de registro
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Cuenta creada pero error al iniciar sesión");
      } else {
        router.push("/panel");
        router.refresh();
      }
    } catch (error) {
      setError("Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Empieza tu prueba gratis de 14 días. Sin tarjeta."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input 
              id="name" 
              name="name"
              placeholder="Lucía" 
              required 
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Negocio</Label>
            <Input 
              id="businessName" 
              name="businessName"
              placeholder="La Brisa" 
              required 
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label htmlFor="logo">Logo del negocio (opcional)</Label>
          {!logoPreview ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                disabled={loading}
              />
              <label
                htmlFor="logo"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Haz clic para subir una imagen
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG hasta 5MB
                </p>
              </label>
            </div>
          ) : (
            <div className="relative border rounded-lg p-4 flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{logoFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(logoFile?.size || 0 / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeLogo}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="tu@taqueria.com" 
            required 
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input 
            id="password" 
            name="password"
            type="password" 
            placeholder="Mínimo 8 caracteres" 
            minLength={8}
            required 
            disabled={loading}
          />
        </div>
        <Button 
          type="submit" 
          variant="default" 
          size="lg" 
          className="w-full rounded-full"
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Al continuar aceptas nuestros Términos y Política de privacidad.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;