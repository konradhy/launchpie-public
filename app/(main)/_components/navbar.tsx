//this should be ssr.
import * as React from "react";
import {

  Bot,
  ClipboardList,
  File,
  Folder,
  Home,
  Inbox,
  MessagesSquare,
  NotebookPen,
  PenBox,
  PenLine,
  Plus,
  PlusCircle,
  PlusSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  UploadCloud,
  Users2,
} from "lucide-react";

import { AccountSwitcher } from "./account-switcher";

import { Nav } from "./nav";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];

  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function Mail({
  accounts,

  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
        }}
        className="h-full max-h-[800px] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={(collapsed) => {
            setIsCollapsed(collapsed);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              collapsed
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Home",
                icon: Home,
                variant: "default",
              },
              {
                title: "Dollops",
                label: "85",

                icon: ClipboardList,
                variant: "ghost",
              },

              {
                title: "Files",
                label: "23",
                icon: Folder,
                variant: "ghost",
              },
              {
                title: "Notes",
                label: "43",
                icon: NotebookPen,
                variant: "ghost",
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
       
              {
                title: "Upload File",
                icon: UploadCloud,
                variant: "ghost",
              },
              {
                title: "Ai Chat",
                icon: Bot,
                variant: "ghost",
              },
                     {
                title: "New Dollop",
                icon: Plus,
                variant: "ghost",
              },
              {
                title: "New Note",
                icon: PenLine,
                variant: "ghost",
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
            {/*put children here */}
      
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
