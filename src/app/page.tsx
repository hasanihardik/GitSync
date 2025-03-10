import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await auth();
  if (!user) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <h1>Log in to see this page</h1>
      </div>
    );
  }

  redirect("/dashboard");
}