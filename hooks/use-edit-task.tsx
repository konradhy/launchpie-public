import { create } from "zustand";
import { Doc } from "@/convex/_generated/dataModel";

type EditTaskStore = {
  isOpen: boolean;
  task: Doc<"tasks"> | null;

  onOpen: (task: Doc<"tasks">) => void;
  onClose: () => void;
  toggle: () => void;
};

export const useEditTask = create<EditTaskStore>((set, get) => ({
  isOpen: false,
  task: null,
  onOpen: (task) => set({ isOpen: true, task }),
  onClose: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
}));
