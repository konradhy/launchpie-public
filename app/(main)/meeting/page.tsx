"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getCurrentFormattedDate } from "@/lib/utils";

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

/*

1. The recording page. Which has a big microphone on the left and the Meeting agenda on the right
    grab all tasks with the meeting flag on, then load them, then switch the flag to off
2. The recordingId page which consists of 
    - The title
    - date and time
    - Shadcn tab to switch between the transcript and the summary 
    - Task items in a scrolable list. Wit the option to edit or delete them
3. The backend that will take the action items and use openai gpt3.5 to create json and enter the action item into tasks with the appropriate key/values


I need you to look at taccy and how i performed
*/
