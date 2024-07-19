import Spinner from "@semicolon/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-20 items-center justify-center">
      <Spinner size={30} />
    </div>
  );
}
