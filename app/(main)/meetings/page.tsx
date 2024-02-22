"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function MeetingsPage() {
  const createRecord = useMutation(api.records.createRecord);

  const handleClick = () => {
    const record = createRecord({
      storageId: "kg28zy3j5sp6kyt575k2vzcm056kzhph" as Id<"_storage">,
    });
  };
  return (
    <div>
      <h1>Meeting</h1>
      <button
        onClick={() =>
          createRecord({
            storageId: "kg21w30cbre3d8drj30198zp856kzabx" as Id<"_storage">,
          })
        }
      >
        Press here{" "}
      </button>
    </div>
  );
}
