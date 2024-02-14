"use client";

import { useEffect, useState } from "react";
// import { SettingsModal } from "../modals/settings-modal";
// import { CoverImageModal } from "../modals/cover-image-modal";
// import { CharacterImageModal } from "../modals/character-image-modal";
import { FileUploadModal } from "../modals/file-upload-modal";
import { NewTaskModal } from "../modals/new-task-modal";
import { SettingsModal } from "../modals/settings-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return (
    <>
      {/* 
      <CoverImageModal />
      <CharacterImageModal />
       */}
      <SettingsModal />
      <FileUploadModal />
      <NewTaskModal />
    </>
  );
};
