import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { DummyPageContent } from "~/components/DummyPageContent";

export default async function Page() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");

  return <DummyPageContent title="User Director" />
}
