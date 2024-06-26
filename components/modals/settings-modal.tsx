"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { appName } from "@/lib/utils";
import { Bot } from "lucide-react";
import { useAction,  } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export const SettingsModal = () => {
  const settings = useSettings();
  const embedAll = useAction(api.ingest.embed.embedAllTemp);

  const handleEmbed =async  () => {
    try {
      await embedAll();
       toast.success("QuityAi updated");
    } catch (error) {
      toast.error("Failed to update QuityAi");
    }
 
   

  }

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">My settings</h2>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>Appearance</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Customize how your {appName} looks on your device
            </span>
          </div>
          <ThemeToggle />

          
        </div>
          <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>QuityAi</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Update Quity with the latest company info
            </span>
          </div>
          <Bot
          onClick = {handleEmbed}
          className="cursor-pointer"
          
          />

          
        </div>
        
        

      </DialogContent>
    </Dialog>
  );
};
