import BranchesContainer from "./_components/branches-container";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBranches } from "@/app/actions/branches";
import { getBusiness } from "@/app/actions/business";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const branches = await getBranches({ 
    businessId: session.user.businessId! 
  });

  // Obtener información del negocio para el logo
  const businessResult = await getBusiness({ businessId: session.user.businessId! });
  const businessLogo = businessResult.success ? businessResult.business?.logoUrl : null;

  return (
    <div className="p-6">
      <BranchesContainer 
        session={session} 
        branches={branches} 
        businessLogo={businessLogo}
      />
    </div>
  );
}
