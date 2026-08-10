import { redirect } from "next/navigation";

export default function Home() {
  // If the user reaches this page, it means proxy.ts already confirmed they are authenticated
  // (since "/" is not a public route and unauthenticated users are redirected to /sign-in).
  redirect("/editor");
}
