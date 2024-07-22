import { CardContent, CardHeader, CardTitle } from "@semicolon/ui/card";
import { Mail } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Mail size={100} className="flex-none" />
      <div className="flex h-full flex-col items-start justify-center gap-2">
        <CardHeader className="flex flex-row items-center gap-7 self-center">
          <CardTitle className="self-center text-nowrap text-2xl sm:text-4xl">
            Check your email
          </CardTitle>
        </CardHeader>
        <CardContent className="self-center text-center">
          <p>A sign in link has been sent to your email address.</p>
        </CardContent>
      </div>
    </div>
  );
}
