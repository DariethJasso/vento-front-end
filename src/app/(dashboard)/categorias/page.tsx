import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategories } from "@/app/actions/categories";
import CategoriesContainer from "./_components/categories-container";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const categories = await getCategories({ 
    businessId: session.user.businessId! 
  });

  return (
    <div className="p-6">
      <CategoriesContainer session={session} categories={categories} />
    </div>
  );
}
