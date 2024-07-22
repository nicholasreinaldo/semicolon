import { PostAuthForm, PreAuthForm } from "@/components/auth-form";
import { auth } from "@semicolon/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function Page() {
  const session = await auth();

  if (session?.user?.registered) {
    redirect("/home");
  }

  return !session ? (
    <PreAuthForm variant="signup" />
  ) : (
    <PostAuthForm defaultName={session.user?.name} />
  );
}
