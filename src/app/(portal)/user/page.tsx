import { redirect } from "next/navigation";

export default function UserPortalRoot() {
  redirect("/user/dashboard");
}
