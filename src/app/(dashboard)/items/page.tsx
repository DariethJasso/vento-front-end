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

  const [items, categories, branches] = await Promise.all([
    getItems({ businessId: session.user.businessId! }),
    getCategories({ businessId: session.user.businessId! }),
    getBranches({ businessId: session.user.businessId! }),
  ]);

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
