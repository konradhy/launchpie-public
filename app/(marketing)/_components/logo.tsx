import Image from "next/image";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { appName } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],

  weight: ["400", "600"],
});

export const Logo = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2">
      <Image
        src="/logo.png"
        alt={`The logo for ${appName}- Streamline startup equity distribution with Launchpad: the smart solution for fair and automated co-founder equity sharing.`}
        height="40"
        width="40"
        className="dark:hidden"
      />
      <Image
        src="/logo-dark.png"
        alt={`The logo for ${appName}- "Launchpad logo - Automating equitable equity distribution for startups.`}
        height="40"
        width="40"
        className="hidden dark:block "
      />
      <p className={cn("font-semibold", font.className)}>{`${appName}`}</p>
    </div>
  );
};
