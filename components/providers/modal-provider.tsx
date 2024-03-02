"use client";

import { useEffect, useState } from "react";

import { FileUploadModal } from "../modals/file-upload-modal";
import { NewTaskModal } from "../modals/new-task-modal";
import { SettingsModal } from "../modals/settings-modal";
import { EditTaskModal } from "../modals/edit-task-modal";
import { CompleteTaskModal } from "../modals/complete-task-modal";
import { CoverImageModal } from "../modals/cover-image-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return (
    <>
  
      <CoverImageModal />
      <SettingsModal />
      <FileUploadModal />
      <NewTaskModal />
      <EditTaskModal />
      <CompleteTaskModal />
    </>
  );
};
