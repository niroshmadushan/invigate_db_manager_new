import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Suspense } from "react";
import { DivisionsClient } from "./DivisionsClient";

export default async function Page() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DivisionsClient />
    </Suspense>
  );
}
