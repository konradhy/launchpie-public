import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Launchpad",
  description: `Launchpad isn't just a tool; it's a promise for a fairer startup future. Inspired by top industry minds, our platform transforms equity distribution into a journey of harmony and shared success. Say goodbye to disputes and hello to a fair future.`,
   icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.png",
        href: "/logo.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.png",
        href: "/logo-dark.png",
      },
    ],
  },
  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
               <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="launchpad-theme"
            >
                 <Toaster position="bottom-center" />
                 {children}

            </ThemeProvider>
       </ConvexClientProvider>
      </body>
    </html>
  );
}