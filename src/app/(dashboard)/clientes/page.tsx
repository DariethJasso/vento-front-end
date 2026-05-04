import { redirect } from "next/navigation";
import { getCustomers } from "@/app/actions/customers";
import CustomersContainer from "./_components/customers-container";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.businessId) {
    redirect("/onboarding");
  }

  const customers = await getCustomers({
    businessId: session.user.businessId,
  });

  return (
    <CustomersContainer
      session={session}
      customers={customers}
    />
  );
}
