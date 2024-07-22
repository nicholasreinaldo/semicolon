import { Separator } from "@semicolon/ui/separator";
import Spinner from "@semicolon/ui/spinner";

export default function Loading() {
  return (
    <>
      <div className="w-full min-w-[257px] md:min-w-[450px] md:max-w-[600px]">
        <div className="flex min-h-20 items-center justify-center">
          <Spinner size={30} />
        </div>
      </div>
      <Separator orientation="vertical" className="h-auto min-h-screen" />
      <div className="hidden min-h-full w-full min-w-[300px] max-w-[360px] shrink flex-col justify-start pl-[30px] lg:flex">
        <div className="flex min-h-20 items-center justify-center">
          <Spinner size={30} />
        </div>
      </div>
    </>
  );
}
