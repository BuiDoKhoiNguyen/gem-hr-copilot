import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root path to chat page (main app entry)
  redirect("/chat");
}
