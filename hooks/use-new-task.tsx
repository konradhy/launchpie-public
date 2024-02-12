import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

type NewTaskStore = {
  isOpen: boolean;
  companyId: Id<"companies"> | null;

  onOpen: (companyId: Id<"companies">) => void;
  onClose: () => void;
  toggle: () => void;
};

export const useNewTask = create<NewTaskStore>((set, get) => ({
  isOpen: false,
  companyId: null,
  onOpen: (companyId) => set({ isOpen: true, companyId }),
  onClose: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
}));
