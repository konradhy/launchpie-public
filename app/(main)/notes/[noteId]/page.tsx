"use client";

import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useParams } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "../_components/toolbar";
import { Cover } from "../_components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import "../_components/notes.css";
import { Button } from "@/components/ui/button";

// import usePresence, { isOnline } from "@/hooks/usePresence";

// import { Facepile } from "../../../_components/presence/Facepile";
// import useTypingIndicator from "@/hooks/useTypingIndicator";

// import GenericSharedCursors from "@/app/(main)/_components/presence/GenericCursors";

interface NoteIdPageProps {
  params: {
    noteId: Id<"notes">;
  };
}

const Emojis =
  "😀 😃 😄 😁 😆 😅 😂 🤣 🥲 🥹 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 😎 🥸 🤩 🥳 😏 😳 🤔 🫢 🤭 🤫 😶 🫠 😮 🤤 😵‍💫 🥴 🤑 🤠".split(
    " ",
  );
const NoteIdPage = ({ params }: NoteIdPageProps) => {
  const user = useUser();
  const [defaultId] = useState(() => Math.floor(Math.random() * 10000));
  const ref = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null); // Update this line

  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
    // updatePresence({ typing });
  };

  const handleKeyDown = () => {
    handleTyping(true); // User is typing
    setTimeout(() => handleTyping(false), 5000);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current); // Clear existing timeout
    }
    typingTimeout.current = setTimeout(() => handleTyping(false), 5000);
  };

  useEffect(() => {
    window.document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.removeEventListener("keydown", handleKeyDown);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current); // Cleanup timeout
      }
    };
  }, []);

  const Editor = useMemo(
    () => dynamic(() => import("../_components/editor"), { ssr: false }),
    [],
  );

  const userId = user.user?.id || defaultId;
  const userName = user.user?.firstName || "Anonymous";

  //   const [data, others, updatePresence] = usePresence(
  //     params.noteId,
  //     "User" + userId,
  //     {
  //       text: "",
  //       emoji: Emojis[defaultId % Emojis.length],
  //       x: 0,
  //       y: 0,
  //       typing: false as boolean,
  //       name: userName,
  //       profileUrl: user.user?.imageUrl || "",
  //     },
  //   );

  //   const presentOthers = (others ?? []).filter(isOnline);

  const note = useQuery(api.notes.getById, {
    noteId: params.noteId,
  });

  const [noteContent, setNoteContent] = useState(note?.content);

  const update = useMutation(api.notes.update);
  // const updateNoteText = useMutation(api.notes.updateNoteText);
  // useTypingIndicator(data.text, updatePresence); //Refactor
  // Update presence data including typing status

  const onChange = (content: string) => {
    update({
      id: params.noteId,
      content,
    });
  };

  useEffect(() => {
    if (note?.content) {
      setNoteContent(note.content);
    }
  }, [note?.content]);

  if (note === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (note === null) {
    return <div>Not found</div>;
  }

  return (
    <div className="pb-40 bg-white dark:bg-[#1F1F1F]  h-screen">
      <Cover url={note.coverImage} />

      <div
        ref={ref}
        onPointerMove={(e) => {
          const { x, y } = ref.current!.getBoundingClientRect();
          //  void updatePresence({ x: e.clientX - x, y: e.clientY - y });
        }}
        className="md:max-w-3xl lg:max-w-4xl mx-auto"
      >
        {/* <GenericSharedCursors
          othersPresence={presentOthers}
          updatePresence={updatePresence}
        >
          <Facepile othersPresence={presentOthers} /> */}
        {/*  */}

        <Toolbar initialData={note} />
        <Editor
          onChange={onChange}
          initialContent={note?.content}
          liveContent={noteContent}
          //   myPresenceData={data}
          // othersPresence={presentOthers}
        />
        {/* </GenericSharedCursors> */}
      </div>
    </div>
  );
};

export default NoteIdPage;
