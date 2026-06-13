import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Allow both USER and ADMIN to access the User Terminal
  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
