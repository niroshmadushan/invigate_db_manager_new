import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "~/server/auth";
import { ApplicationsClient } from "./ApplicationsClient";

export default async function Page() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationsClient userRole={session?.user?.role || "USER"} />
    </Suspense>
  );
}
