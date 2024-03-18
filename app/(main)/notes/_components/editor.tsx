"use client";
//fyi this is using old blocknote packages. Refactor for new

import { useCompletion } from "ai/react";
import { BrainCircuit, Wand, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  BlockNoteView,
  useBlockNote,
  getDefaultReactSlashMenuItems,
  ReactSlashMenuItem,
} from "@blocknote/react";
import "@blocknote/core/style.css";
import "../_components/notes.css"; //debug
import { useParams } from "next/navigation";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
//import { PresenceData } from "@/hooks/usePresence";

type Data = {
  text: string;
  x: number;
  y: number;
  typing: boolean;
  name: string;
};

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  liveContent?: string;
  myPresenceData?: Data;
  //othersPresence?: PresenceData<Data>[];
}

const Editor = ({
  onChange,
  initialContent,
  editable,
  liveContent,
  myPresenceData,
  //othersPresence,
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const [notification, setNotification] = useState(false);

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const generateImageUrl = useMutation(api.notes.generateImageUrl);

  //i should add some type of authentication headings
  const handleUpload = async (file: File) => {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file!.type },
      body: file,
    });
    const { storageId } = await result.json();
    const imageUrl = await generateImageUrl({ id: storageId });
    return imageUrl as any;
  };

  //AI Hooks
  const { complete: completeBusiness, completion: completionBusiness } =
    useCompletion({
      api: "/api/generate/businessStrategy",
    });

  const { complete: completeActionPlan, completion: completionActionPlan } =
    useCompletion({
      api: "/api/generate/actionplan",
    });

  const { complete: completeSeo, completion: completionSeo } = useCompletion({
    api: "/api/generate/seoMaker",
  });

  /*
    it has to be an http route
    and that route will call an internal action
    */

  //AI Blocks

  const businessBlock = async () => {
    let block = editor.getTextCursorPosition().block;
    if (!block || !block.content || block.content.length === 0) {
      return;
    }

    block.content.forEach((contentItem) => {
      if ("text" in contentItem) {
        let aiPrompt = contentItem.text;
        completeBusiness(aiPrompt);
      }
    });
  };

  const insertBusinessBlock: ReactSlashMenuItem = {
    name: "Business Strategist",
    execute: businessBlock,
    aliases: ["tt", "ai"],
    group: "Ai Tools",
    icon: <Briefcase size={18} />,
    hint: "Provide some information about your business and get a business strategy.",
  };

  //actionplan block

  const actionPlanBlock = async () => {
    let block = editor.getTextCursorPosition().block;
    if (!block || !block.content || block.content.length === 0) {
      return;
    }

    block.content.forEach((contentItem) => {
      if ("text" in contentItem) {
        let aiPrompt = contentItem.text;
        completeActionPlan(aiPrompt);
      }
    });
  };

  const insertActionPlanBlock: ReactSlashMenuItem = {
    name: "Action Plan ",
    execute: actionPlanBlock,
    aliases: ["aa", "an"],
    group: "Ai Tools",
    icon: <Wand size={18} />,
    hint: "Creates an action plan for a company objective.",
  };

  //StoryMaker  block
  const seoBlock = async () => {
    let block = editor.getTextCursorPosition().block;
    if (!block || !block.content || block.content.length === 0) {
      return;
    }

    block.content.forEach((contentItem) => {
      if ("text" in contentItem) {
        let aiPrompt = contentItem.text;
        completeSeo(aiPrompt);
      }
    });
  };

  const insertSeoBlock: ReactSlashMenuItem = {
    name: "SEO Bot",
    execute: seoBlock,
    aliases: ["ts", "sp"],
    group: "Ai Tools",
    icon: <BrainCircuit size={18} />,
    hint: "Describe your company and get a list of keywords that will help you rank higher in search engines.",
  };

  const customSlashMenuItemList = [
    ...getDefaultReactSlashMenuItems(),
    insertBusinessBlock,
    insertActionPlanBlock,
    insertSeoBlock,
  ];

  const editor: BlockNoteEditor = useBlockNote({
    editable,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: handleUpload,
    slashMenuItems: customSlashMenuItemList,
  });

  const previousLanguageCompletion = useRef("");
  const tokenLanguage = useMemo(() => {
    if (!completionBusiness) return;
    const diff = completionBusiness.slice(
      previousLanguageCompletion.current.length,
    );
    return diff;
  }, [completionBusiness]);

  useEffect(() => {
    if (!tokenLanguage) return;

    let block = editor.getTextCursorPosition().block;
    if (!block) return;

    editor.updateBlock(block, {
      content: completionBusiness,
    });
  }, [completionBusiness, tokenLanguage, editor]);

  //AI Config for ActionPlan

  const previousActionPlanCompletion = useRef("");
  const tokenActionPlan = useMemo(() => {
    if (!completionActionPlan) return;
    const diff = completionActionPlan.slice(
      previousActionPlanCompletion.current.length,
    );
    return diff;
  }, [completionActionPlan]);

  useEffect(() => {
    if (!tokenActionPlan) return;

    let block = editor.getTextCursorPosition().block;
    if (!block) return;

    editor.updateBlock(block, {
      content: completionActionPlan,
    });
  }, [completionActionPlan, tokenActionPlan, editor]);

  //Ai config for story maker
  const previousStoryCompletion = useRef("");
  const tokenStory = useMemo(() => {
    if (!completionSeo) return;
    const diff = completionSeo.slice(previousStoryCompletion.current.length);
    return diff;
  }, [completionSeo]);

  useEffect(() => {
    if (!tokenStory) return;

    let block = editor.getTextCursorPosition().block;
    if (!block) return;

    editor.updateBlock(block, {
      content: completionSeo,
    });
  }, [completionSeo, tokenStory, editor]);

  //Live content

  //when live content changes, update the editor
  const removeAllBlocks = () => {
    const allBlocks = editor.topLevelBlocks;
    const blockIdentifiers = allBlocks.map((block) => block.id);
    editor.removeBlocks(blockIdentifiers);
  };

  const replaceAllBlocks = () => {
    if (!liveContent) return;

    const blocksToInsert = JSON.parse(liveContent) as PartialBlock[];

    removeAllBlocks();

    editor.insertBlocks(blocksToInsert, editor.topLevelBlocks[0]);
    setNotification(false);
  };

  // useEffect(() => {
  //   // Check if any user in othersPresence is currently typing
  //   const isAnyoneTyping = othersPresence?.some(
  //     (presence) => presence.data.typing,
  //   );
  //   //if someone is typing and live content exists then compare the blocks
  //   if (isAnyoneTyping && liveContent) {
  //     console.log("someone is typing");
  //     const blocksToCompare = JSON.parse(liveContent) as PartialBlock[];
  //     const editorBlocks = editor.topLevelBlocks;
  //     if (blocksToCompare === editorBlocks) {
  //       console.log("blocks are the same");
  //       return;

  //       //if there is a difference, then we know that live content has changed and we can call replaceAllBlocks
  //     } else {
  //       setNotification(true);
  //       console.log("blocks are different");
  //     }
  //   }
  // }, [othersPresence]);

  return (
    <div>
      <div className="flex flex-col">
        {notification && (
          <button
            onClick={replaceAllBlocks}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm p-3 rounded-md flex items-center justify-center transition duration-300 ease-in-out"
          >
            <p className="font-medium">
              Click to synchronize with the latest changes made by
              collaborators.
            </p>
          </button>
        )}
      </div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

export default Editor;
