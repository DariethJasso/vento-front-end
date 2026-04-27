"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AuthLayout from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const business = formData.get("business") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Registrar usuario
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: `${name} - ${business}`,
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
        router.push("/dashboard");
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
            <Label htmlFor="business">Negocio</Label>
            <Input 
              id="business" 
              name="business"
              placeholder="La Brisa" 
              required 
              disabled={loading}
            />
          </div>
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