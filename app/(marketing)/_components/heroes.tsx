import Image from "next/image";
import { appName } from "@/lib/utils";

export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl">
      <div className="flex items-center" />
      <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
        <Image
          src="/home-hero.svg"
          fill
          alt={appName + " platform interface showcasing automated startup equity distribution solution for fair co-founder collaboration."}
          className="object-contain"
        />
      </div>
    </div>
  );
};
