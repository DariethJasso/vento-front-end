import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getItems } from "@/app/actions/items";
import { getCategories } from "@/app/actions/categories";
import { getBranches } from "@/app/actions/branches";
import ItemsContainer from "./_components/items-container";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isOwner = session.user.isOwner || session.user.isEmployeeOwner;
  const isManager = session.user.isManager;

  const [allItems, categories, allBranches] = await Promise.all([
    getItems({ businessId: session.user.businessId! }),
    getCategories({ businessId: session.user.businessId! }),
    getBranches({ businessId: session.user.businessId! }),
  ]);

  // Si es gerente, filtrar solo items activos en su sucursal
  let items = allItems;
  let branches = allBranches;
  
  if (isManager && session.user.branchId) {
    items = allItems.filter(item => 
      item.branchItems?.some(bi => 
        bi.branchId === session.user.branchId && bi.isActiveInBranch
      )
    );
    
    // Solo mostrar su sucursal
    branches = allBranches.filter((b:any) => b.id === session.user.branchId);
  }

  return (
    <div className="p-6">
      <ItemsContainer 
        session={session} 
        items={items} 
        categories={categories}
        branches={branches}
      />
    </div>
  );
}
