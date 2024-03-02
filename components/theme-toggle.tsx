import React, { useEffect, useState } from "react";
import { Stars, Sun } from "lucide-react";
import { useTheme } from "next-themes"; 
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  if (!isClient) return null;

  return (
    <>
      {theme === "light" ? (
        <Sun
          className="h-[1.4rem] w-[1.4rem] transition-all m-1"
          onClick={() => setTheme("dark")}
          role="button"
        />
      ) : (
        <Stars
          className="h-[1.4rem] w-[1.4rem] transition-all m-1"
          onClick={() => setTheme("light")}
          role="button"
        />
      )}
      <span className="sr-only">Toggle theme</span>
    </>
  );
}
