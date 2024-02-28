//extract navlinks and related business logic into their own container
"use client";
import {
  ChevronsLeft,
  MenuIcon,
  Home,
  ClipboardList,
  Folder,
  NotebookPen,
  UploadCloud,
  Bot,
  Plus,
  PenLine,
  GripVertical,
  HandCoins,
  LucideIcon,
  Settings,
  Mic,
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useMutation, useQuery } from "convex/react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useNewTask } from "@/hooks/use-new-task";
import { useSearch } from "@/hooks/use-search";
import useStoreUserEffect from "@/hooks/use-store-user";
import { AccountSwitcher } from "./account-switcher";
import { Separator } from "@/components/ui/separator";
import { Nav } from "./nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSettings } from "@/hooks/use-settings";
import { ConvexAiChat } from "@/app/aiChat";
import { Button } from "@/components/ui/button";
import { NotesNav } from "./notes/notes-nav";
interface NavLink {
  title: string;
  label?: string;
  icon: LucideIcon;
  variant: "default" | "ghost";
  onClick?: () => void;
  link?: string;
  hotkey?: string;
}

export const Navigation = () => {
  //hooks
  const pathname = usePathname(); //to collapse sidebar when we navigate to a new document
  const params = useParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const company = useQuery(api.companies.getByUserId);
  const fileUpload = useFileUpload();
  const newTask = useNewTask();
  const search = useSearch();
  const router = useRouter();
  const settings = useSettings();
  useStoreUserEffect();

  //refs
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [isIconised, setIsIconised] = useState(false);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]); //ignore warning. The refs we are working with aren't reactive in the way that the useEffect hook is expecting.

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  //functions
  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 100) newWidth = 100;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`,
      );
    }

    if (newWidth < 160) {
      setIsIconised(true);
    } else {
      setIsIconised(false);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)",
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  let topLinks: NavLink[] = [
    {
      title: "Home",
      icon: Home,
      variant: "default",
      link: "/dashboard",
    },
    {
      title: "New Meeting",
      icon: Mic,
      variant: "ghost",
      link: "/meeting",
    },

    {
      title: "Dollops",
      label: "85",
      icon: HandCoins,
      variant: "ghost",
    },
    {
      title: "Files",
      label: "23",
      icon: Folder,
      variant: "ghost",
      onClick: search.onOpen,
    },
    {
      title: "Notes",
      label: "43",
      icon: NotebookPen,
      variant: "ghost",
      link: "/notes",
    },
  ];

  if (company && company._id) {
    topLinks.splice(1, 0, {
      title: "Stakes",
      label: "85",
      icon: ClipboardList,
      variant: "ghost",
      link: "/stakes",
    });
  }

  let middleLinks: NavLink[] = [
    {
      title: "Upload File",
      icon: UploadCloud,

      variant: "ghost",
      onClick: fileUpload.onOpen,
    },
    {
      title: "Ai Chat",
      icon: Bot,
      variant: "ghost",
    },

    {
      title: "New Note",
      icon: PenLine,
      variant: "ghost",
    },
  ];

  if (company && company._id) {
    middleLinks.splice(1, 0, {
      title: "New Stake",
      icon: Plus,
      hotkey: "S",
      variant: "ghost",

      onClick: () => newTask.onOpen(company._id),
    });
  }

  let bottomLinks: NavLink[] = [
    {
      title: "Settings",
      icon: Settings,
      variant: "ghost",
      onClick: settings.onOpen,
    },
  ];

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full  overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0",
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100",
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>

        <nav className="mt-4 ">
          <TooltipProvider>
            <div
              className={cn(
                "flex h-[52px] items-center justify-center ",
                isIconised ? "h-[52px]" : "px-2",
              )}
            >
              <AccountSwitcher
                isIconised={isIconised}
                accounts={[
                  {
                    label: "Parent Company",
                    email: "Primary",
                    icon: <Home />,
                  },
                  {
                    label: "Coming Soon",
                    email: "Subsidiary Companies coming soon",
                    icon: <Home />,
                  },
                ]}
              />
            </div>

            <Nav isCollapsed={isIconised} links={topLinks} />
            <Separator />
            <Nav isCollapsed={isIconised} links={middleLinks} />
            <Separator />
            <Nav isCollapsed={isIconised} links={bottomLinks} />

            <ConvexAiChat
              convexUrl={"https://judicious-corgi-741.convex.cloud"}
              name="QuityAI "
              infoMessage="I will look at your uploaded files, notes, and stakes to provide the best answer for your questions."
              welcomeMessage="Hey there, what can I help you with?"
              renderTrigger={(onClick) => (
                <div
                  className="flex items-center justify-center h-12 w-full hover:text-primary/60 text-primary   dark:text-secondary dark:hover:text-secondary/60 rounded-md cursor-pointer  transition-all"
                  onClick={onClick}
                >
                  {isIconised ? (
                    <Bot className="h-6 w-6" />
                  ) : (
                    <>
                      <Bot className="h-6 w-6 mr-2 " />
                      <span className="">Ask QuityAi</span>
                      <Bot className="h-6 w-6 ml-2" />
                    </>
                  )}
                </div>
              )}
            />
          </TooltipProvider>
        </nav>

        <div
          className="flex flex-row-reverse"
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
        >
          <div className="opacity-30 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 right-0 top-0">
            <div className=" group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-[1px] bg-primary/40 right-0 top-0 " />
          </div>
          <GripVertical className="h-6 w-6 group-hover/sidebar transition cursor-ew-resize  -translate-y-[20rem] h-xs:-translate-y-[13rem] h-sm:-translate-y-[7rem] h-md:-translate-y-[8rem] " />
        </div>
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
        )}
      >
        {!!params.noteId ? (
          <NotesNav isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
};
