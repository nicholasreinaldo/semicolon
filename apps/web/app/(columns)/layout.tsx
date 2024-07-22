import { BottomBar } from "@/components/bottom-bar";
import { SideBar } from "@/components/side-bar";
import { auth } from "@semicolon/auth";
import { Separator } from "@semicolon/ui/separator";
import { Toaster } from "@semicolon/ui/toaster";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const session = await auth();

  if (
    !(session?.user?.registered && session.user.name && session.user.username)
  ) {
    redirect("/flow/signup");
  }

  const { username, name, image } = session.user;

  return (
    <div className="container mx-auto flex min-h-screen w-screen min-w-[280px] flex-col px-0 md:pr-8 lg:px-8">
      <div className="flex min-h-full w-full flex-row justify-center">
        <SideBar {...{ username, name, image }} />
        <Separator orientation="vertical" className="h-auto min-h-screen" />
        {children}
      </div>
      <BottomBar {...{ username }} />
      <Toaster />
      {modal}
    </div>
  );
}
