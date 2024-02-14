import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const usePersonsDetails = (ids: Id<"persons">[]) => {
  return useQuery(
    api.persons.getPersonsByIds,
    ids ? { personIds: ids.map((id) => id) } : "skip",
  );
};
