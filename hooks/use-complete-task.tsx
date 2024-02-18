import { create } from "zustand";
import { Doc } from "@/convex/_generated/dataModel";

type CompleteTaskStore = {
  isOpen: boolean;
  task: Doc<"tasks"> | null;

  onOpen: (task: Doc<"tasks">) => void;
  onClose: () => void;
  toggle: () => void;
};

export const useCompleteTask = create<CompleteTaskStore>((set, get) => ({
  isOpen: false,
  task: null,
  onOpen: (task) => set({ isOpen: true, task }),
  onClose: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
}));
