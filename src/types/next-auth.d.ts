import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      businessId?: string;
      
      // Datos del empleado
      employeeId?: string;
      branchId?: string;
      branchName?: string;
      
      // Roles
      isOwner?: boolean;
      isEmployeeOwner?: boolean;
      isManager?: boolean;
      isCashier?: boolean;
      isKitchen?: boolean;
      isDelivery?: boolean;
      isWaiter?: boolean;
      isActive?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    businessId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    businessId?: string;
    
    // Datos del empleado
    employeeId?: string;
    branchId?: string;
    branchName?: string;
    
    // Roles
    isOwner?: boolean;
    isEmployeeOwner?: boolean;
    isManager?: boolean;
    isCashier?: boolean;
    isKitchen?: boolean;
    isDelivery?: boolean;
    isWaiter?: boolean;
    isActive?: boolean;
    
  }
}
