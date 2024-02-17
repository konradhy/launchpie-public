import Link from "next/link";

export default function Component() {
  return (
    <div className="h-screen flex flex-col items-center justify-center min-h-[70vh] py-12 w-full text-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Uh oh! You are lost in space.
        </h1>
        <p className="max-w-[600px] mx-auto text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          It looks like you found a black hole. Do not worry, you can always
          warp back to the homepage.
        </p>
      </div>
      <div className="flex gap-4 min-[300px]:gap-8">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm gap-2 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:border-gray-800  dark:bg-gray-950 dark:hover:bg-gray-950 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300 text-primary"
          href="#"
        >
          <HomeIcon className="w-4 h-4" />
          Go to the home
        </Link>
      </div>
    </div>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
