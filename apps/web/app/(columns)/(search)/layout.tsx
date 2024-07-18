// file name and directory: root/apps/web/app/(columns)/(search)/layout.tsx
import { Sticky } from "@/components/sticky";
import { Suggestions } from "@/components/suggestions";
import { Trends } from "@/components/trends";
import { Separator } from "@semicolon/ui/separator";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="w-full min-w-[257px] md:max-w-[650px]">{children}</div>
      <Separator orientation="vertical" className="h-auto min-h-screen" />
      <div className="hidden min-h-full w-1/4 min-w-[300px] flex-none shrink-0 flex-col justify-start pl-[30px] pt-5 md:flex">
        <Sticky>
          <div className="flex flex-col gap-5">
            <Suggestions />
            <Trends />
            <div />
          </div>
        </Sticky>
      </div>
    </>
  );
}
