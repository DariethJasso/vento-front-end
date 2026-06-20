import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/app/db";
import { users, businesses, employees } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".nuvly.mx" : undefined,
      },
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },

  debug: process.env.NODE_ENV === "development",

  // Configuración de URL base
  ...(process.env.NEXTAUTH_URL && { 
    url: process.env.NEXTAUTH_URL 
  }),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user) {
          throw new Error("Credenciales inválidas");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        
        // Verificar si es dueño de un negocio
        const business = await db.query.businesses.findFirst({
          where: eq(businesses.ownerId, user.id),
        });
        
        if (business) {
          token.businessId = business.id;
          token.isOwner = true;
        }
        
        // Verificar si es empleado
        const employee = await db.query.employees.findFirst({
          where: eq(employees.userId, user.id),
          with: {
            branch: true,
          },
        });
        
        if (employee) {
          token.employeeId = employee.id;
          token.branchId = employee.branchId || undefined;
          token.branchName = employee.branch?.name || undefined;
          token.isEmployeeOwner = employee.isOwner ?? undefined;
          token.isManager = employee.isManager ?? undefined;
          token.isCashier = employee.isCashier ?? undefined;
          token.isKitchen = employee.isKitchen ?? undefined;
          token.isDelivery = employee.isDelivery ?? undefined;
          token.isWaiter = employee.isWaiter ?? undefined;
          token.isActive = employee.isActive ?? undefined;
          
          // Si es empleado pero no tiene businessId del owner, obtenerlo del branch
          if (!token.businessId && employee.branch) {
            token.businessId = employee.branch.businessId || undefined;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.businessId = token.businessId as string | undefined;
        
        // Datos del empleado
        session.user.employeeId = token.employeeId as string | undefined;
        session.user.branchId = token.branchId as string | undefined;
        session.user.branchName = token.branchName as string | undefined;
        
        // Roles
        session.user.isOwner = token.isOwner as boolean | undefined;
        session.user.isEmployeeOwner = token.isEmployeeOwner as boolean | undefined;
        session.user.isManager = token.isManager as boolean | undefined;
        session.user.isCashier = token.isCashier as boolean | undefined;
        session.user.isKitchen = token.isKitchen as boolean | undefined;
        session.user.isDelivery = token.isDelivery as boolean | undefined;
        session.user.isWaiter = token.isWaiter as boolean | undefined;
        session.user.isActive = token.isActive as boolean | undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
