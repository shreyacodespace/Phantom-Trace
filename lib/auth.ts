import { cookies } from "next/headers";
import { authOn, read } from "./session";
export async function who() { return authOn() ? await read(cookies().get("pt_session")?.value) : { role: "admin", user: "open-demo" }; }
