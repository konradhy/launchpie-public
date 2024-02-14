"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useTasks = () => {
  const tasks = useQuery(api.companies.getByUserId);
  return "tasks";
};
