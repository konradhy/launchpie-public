"use client";
/*
1. Add toast messages
2. Improve design typography consistency and spacing
3. Meeting agenda should be blank when you arrive, with a button. Upon clicking the button we track the state change and then generate the meeting agenda live using streaming
*/

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getCurrentFormattedDate } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
const RecordVoicePage = () => {
  const [title, setTitle] = useState("Record your meeting");

  const [checkedStates, setCheckedStates] = useState<{
    [key: number]: boolean;
  }>({});

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const generateUploadUrl = useMutation(api.records.generateUploadUrl);
  const createRecord = useMutation(api.records.createRecord);
  const generateMeetingAgenda = useMutation(
    api.meetingAgenda.generateMeetingAgenda,
  );
  const meetingAgenda = useQuery(api.meetingAgenda.getMeetingAgenda);

  const router = useRouter();

  async function startRecording() {
    setIsRunning(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let audioChunks: any = [];

    recorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "audio/mp3" },
        body: audioBlob,
      });
      const { storageId } = await result.json();

      let recordId = await createRecord({
        storageId,
      });

      router.push(`/stakes`);
    };
    setMediaRecorder(recorder as any);
    recorder.start();
  }

  function stopRecording() {
    // @ts-ignore
    mediaRecorder.stop();
    setIsRunning(false);
  }

  const formattedDate = getCurrentFormattedDate();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 59) {
            setMinutes((prevMinutes) => prevMinutes + 1);
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleRecordClick = () => {
    if (title === "Record your meeting") {
      setTitle("Recording...");
      startRecording();
    } else if (title === "Recording...") {
      setTitle("Processing...");
      stopRecording();
    }
  };

  const handleMeetingClick = async () => {
    await generateMeetingAgenda({
      instructions: "Follow best practices",
    });
  };

  const toggleCheck = (index: number): void => {
    setCheckedStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className="sm:flex-col md:flex md:flex-row items-center justify-center  gap-8 p-6 dark:bg-gray-900 h-full  ">
      <Card className="item-center w-full lg:w-1/2 dark:bg-gray-800 shadow-inner p-6 rounded-lg md:min-h-[50rem] bg-primary/5 mb-4">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold dark:text-white">{title}</h1>
          <p className="text-sm dark:text-gray-300">{formattedDate}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center md:mt-[10rem]">
          <div className="mt-8 ">
            <div className="text-[60px] dark:text-white font-semibold">
              {minutes < 10 ? `0${minutes}` : minutes}:
              {seconds < 10 ? `0${seconds}` : seconds}
            </div>
          </div>

{!isRunning ? (
          <Button
            size={"lg"}
            variant={"expandIcon"}
            Icon={() => <Mic size={40} />}
            iconPlacement={"right"}
            className="p-10 rounded-2xl mt-8"
            onClick={handleRecordClick}
          >
            <span className="text-[40px]">Start Recording</span>
          </Button>
        ) : (
          <Button
            size={"lg"}
            variant={"expandIcon"}
            Icon={() => <MicOff size={40} />}
            iconPlacement={"right"}
            className="p-10 rounded-2xl mt-8"
            onClick={handleRecordClick}
          >
            <span className="text-[40px]">Stop Recording</span>
          </Button>
        )
}
        </CardContent>
      </Card>

      <Card className="w-full lg:w-1/2 dark:bg-gray-800 shadow-inner p-6 rounded-lg md:min-h-[50rem] bg-primary/5">
        <CardHeader className="text-center ">
          <h2 className="text-2xl font-semibold dark:text-white ">
            {meetingAgenda?.meetingTitle || "Meeting Agenda"} for{" "}
            {meetingAgenda?.companyName || "Company"}
          </h2>
        </CardHeader>
        <CardDescription className="text-center mb-4">
          Estimated Meeting Time: {meetingAgenda?.meetingDuration}
        </CardDescription>

        <CardContent className="flex flex-col items-center justify-center">
          <ScrollArea className="w-full h-[30rem] overflow-y-auto">
            {meetingAgenda?.topics?.map((topic, index) => (
              <div key={index} className="mt-6 first:mt-0">
                {" "}
                {/* Reduced the top margin for each topic */}
                <div className="flex items-start">
                  <Checkbox
                    onClick={() => toggleCheck(index)}
                    className="mr-2 mt-[5px]"
                  />
                  <div className="flex flex-col justify-between">
                    {" "}
                    <h3
                      className={`text-xl font-semibold dark:text-white mb-1 ${checkedStates[index] ? "line-through" : ""}`}
                    >
                      {topic.title}
                    </h3>
                    <span
                      className={`mt-[-8px] text-xs font-light text-gray-600 dark:text-gray-400 ${checkedStates[index] ? "line-through" : ""}`}
                    >
                      ETA: {topic.allottedTime}
                    </span>
                  </div>
                </div>
                <p
                  className={`ml-6 mt-2 dark:text-gray-300 ${checkedStates[index] ? "line-through" : ""}`}
                >
                  {topic.description}
                </p>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter className="text-center mt-4">
          <div className="flex justify-center mb-4">
            <Button onClick={handleMeetingClick} className="text-lg px-4 py-2">
              New Meeting Agenda Board
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RecordVoicePage;
