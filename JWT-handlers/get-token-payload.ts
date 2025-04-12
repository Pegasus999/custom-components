import { decodeJwt, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function getTokenPayload(): Promise<JWTPayload> {
  const token = (await cookies()).get("token")?.value || "";

  try {
    const payload = decodeJwt(token);
    return payload as JWTPayload;
  } catch (error) {
    console.error("Failed to decode token:", error);
    redirect("/login");
  }
}
