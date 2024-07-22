import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@semicolon/ui/card";
import { Frown } from "lucide-react";
import Link from "next/link";

enum Error {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  Default = "Default",
}

export default function Page({
  searchParams: { error = "Default" },
}: {
  searchParams: { error: `${Error}` };
}) {
  const errors: Record<`${Error}`, { heading: string; message: JSX.Element }> =
    {
      Default: {
        heading: "Something went wrong",
        message: (
          <div>
            <p>
              We{"'"}re not sure what happened, but please try again in a few
              minutes.
            </p>
          </div>
        ),
      },
      Configuration: {
        heading: "Server error",
        message: (
          <div>
            <p>There is a problem with the server configuration.</p>
            <p>Check the server logs for more information.</p>
          </div>
        ),
      },
      AccessDenied: {
        heading: "Access Denied",
        message: (
          <div>
            <p>You do not have permission to sign in.</p>
          </div>
        ),
      },
      Verification: {
        heading: "Unable to sign in",
        message: (
          <div>
            <p>The sign in link is no longer valid.</p>
            <p>It may have been used already or it may have expired.</p>
          </div>
        ),
      },
    };

  const { heading, message } = errors[error];

  return (
    <div className="flex flex-col items-center justify-center">
      <Frown size={100} className="flex-none" />
      <div className="flex h-full flex-col items-start justify-center gap-2">
        <CardHeader className="flex flex-row items-center gap-7 self-center">
          <CardTitle className="self-center text-nowrap text-2xl sm:text-4xl">
            {heading}
          </CardTitle>
        </CardHeader>
        <CardContent className="self-center text-center">{message}</CardContent>
        <CardFooter className="self-center">
          <Link className="text-sky-400 hover:underline" href="/flow/login">
            Go back
          </Link>
        </CardFooter>
      </div>
    </div>
  );
}
