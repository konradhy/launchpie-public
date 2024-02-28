"use client";

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

const RecordVoicePage = () => {
  const [title, setTitle] = useState("Record your meeting");

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

      router.push(`/meeting/${recordId}`);
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
    //toast
    await generateMeetingAgenda({
      instructions: "Follow best practices",
    });
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
        </CardContent>
      </Card>

      <Card className="w-full lg:w-1/2 dark:bg-gray-800 shadow-inner p-6 rounded-lg md:min-h-[50rem] bg-primary/5">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-semibold dark:text-white">
            Meeting Agenda
          </h2>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center">
          <Button onClick={handleMeetingClick}>Generate Meeting agenda</Button>
          <div className="p-4 "> {meetingAgenda}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordVoicePage;
