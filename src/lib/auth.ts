import { cookies } from "next/headers";

export async function getAuthFromRequest() {
  const cookieStore = await cookies(); // bitno: await

  const userId = cookieStore.get("userId")?.value ?? null;
  const role = cookieStore.get("role")?.value ?? null;

  return { userId, role };
}

