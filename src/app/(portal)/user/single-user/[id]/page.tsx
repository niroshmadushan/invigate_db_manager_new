import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Suspense } from "react";
import { UserProfileClient } from "./UserProfileClient";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    redirect("/user/single-user");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfileClient userId={userId} />
    </Suspense>
  );
}
