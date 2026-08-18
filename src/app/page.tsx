import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

import { homePath } from "@/lib/roles";

export default async function HomePage() {
  const user = await getSessionUser();
  redirect(user ? homePath(user.role) : "/login");
}
