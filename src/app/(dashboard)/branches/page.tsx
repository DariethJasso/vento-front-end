import BranchesContainer from "./_components/branches-container";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBranches } from "@/app/actions/branches";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const branches = await getBranches({ 
    businessId: session.user.businessId! 
  });

  return (
    <div className="p-6">
      <BranchesContainer session={session} branches={branches} />
    </div>
  );
}
