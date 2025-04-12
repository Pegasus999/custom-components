import { JWTPayload, SignJWT, jwtVerify } from "jose";

export async function sign(
  payload: JWTPayload,
  secret: string
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(secret));
}

export async function verify(
  token: string,
  secret: string
): Promise<JWTPayload & JWTCustomPayload> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as JWTPayload & JWTCustomPayload;
}
