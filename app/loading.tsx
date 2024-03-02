import { Spinner } from "@/components/spinner";

export default function Loading() {
  return (
    <div className="h-full flex items-center justify-center">
      <Spinner />
    </div>
  );
}
