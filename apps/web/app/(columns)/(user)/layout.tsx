import { SearchBar } from "@/components/search-bar";
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
      <div className="w-full min-w-[257px] md:min-w-[450px] md:max-w-[600px]">
        {children}
      </div>
      <Separator orientation="vertical" className="h-auto min-h-screen" />
      <div className="hidden min-h-full w-full min-w-[300px] max-w-[360px] shrink flex-col justify-start pl-[30px] lg:flex">
        <div
          id="search-bar"
          className="bg-background sticky top-0 z-10 flex-shrink pb-4 pt-3"
        >
          <SearchBar />
        </div>
        <Sticky top="#search-bar">
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
