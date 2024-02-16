"use client";
import {
  ConvexProvider,
  ConvexReactClient,
  useMutation,
  useQuery,
} from "convex/react";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { api } from "../../convex/_generated/api.js";
import { CloseIcon } from "./CloseIcon";
import { InfoCircled } from "./InfoCircled";
import { SendIcon } from "./SendIcon";
import { SizeIcon } from "./SizeIcon";
import { TrashIcon } from "./TrashIcon";

export function ConvexAiChat({
  convexUrl,
  infoMessage,
  name,
  welcomeMessage,
  renderTrigger,
}: {
  convexUrl: string;
  name: string;
  infoMessage: ReactNode;
  welcomeMessage: string;
  renderTrigger: (onClick: () => void) => ReactNode;
}) {
  const [hasOpened, setHasOpened] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  return (
    <>
      {renderTrigger(() => {
        setHasOpened(true);
        setDialogOpen(!dialogOpen);
      })}
      {hasOpened
        ? createPortal(
            <ConvexAiChatDialog
              convexUrl={convexUrl}
              infoMessage={infoMessage}
              isOpen={dialogOpen}
              name={name}
              welcomeMessage={welcomeMessage}
              onClose={handleCloseDialog}
            />,
            document.body,
          )
        : null}
    </>
  );
}

export function ConvexAiChatDialog({
  convexUrl,
  infoMessage,
  isOpen,
  name,
  welcomeMessage,
  onClose,
}: {
  convexUrl: string;
  infoMessage: ReactNode;
  isOpen: boolean;
  name: string;
  welcomeMessage: string;
  onClose: () => void;
}) {
  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (
    <ConvexProvider client={client}>
      <Dialog
        infoMessage={infoMessage}
        isOpen={isOpen}
        name={name}
        welcomeMessage={welcomeMessage}
        onClose={onClose}
      />
    </ConvexProvider>
  );
}

export function Dialog({
  infoMessage,
  isOpen,
  name,
  welcomeMessage,
  onClose,
}: {
  infoMessage: ReactNode;
  isOpen: boolean;
  name: string;
  welcomeMessage: string;
  onClose: () => void;
}) {
  const sessionId = useSessionId();
  const remoteMessages = useQuery(api.messages.list, { sessionId });
  const messages = useMemo(
    () =>
      [{ isViewer: false, text: welcomeMessage, _id: "0" }].concat(
        (remoteMessages ?? []) as {
          isViewer: boolean;
          text: string;
          _id: string;
        }[],
      ),
    [remoteMessages, welcomeMessage],
  );
  const sendMessage = useMutation(api.messages.send);

  const clearMessages = useMutation(api.messages.clear);

  const [expanded, setExpanded] = useState(false);
  const [isScrolled, setScrolled] = useState(false);

  const [input, setInput] = useState("");

  const handleExpand = () => {
    setExpanded(!expanded);
    setScrolled(false);
  };

  const handleSend = async (event: FormEvent) => {
    console.log("handleSend");
    event.preventDefault();

    console.log("sending message");
    await sendMessage({ message: input, sessionId });
    setInput("");
    setScrolled(false);
    console.log("speech sent");
  };

  const handleClearMessages = async () => {
    await clearMessages({ sessionId });
    setScrolled(false);
  };

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScrolled) {
      return;
    }

    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }, [messages, isScrolled]);

  return (
    <div
      className={
        (isOpen ? "fixed" : "hidden") +
        " rounded-xl flex flex-col bg-white dark:bg-black text-black dark:text-white z-auto " +
        "m-4 right-0 bottom-0 max-w-[calc(100%-2rem)] overflow-hidden transition-all " +
        "shadow-[0px_5px_40px_rgba(0,0,0,0.16),0_20px_25px_-5px_rgb(0,0,0,0.1)] " +
        "dark:shadow-[0px_5px_40px_rgba(0,0,0,0.36),0_20px_25px_-5px_rgb(0,0,0,0.3)] " +
        (expanded
          ? "left-0 top-0 z-[1000000]"
          : "w-full sm:max-w-[25rem] sm:min-w-[25rem] h-[30rem]")
      }
    >
      <div className="flex justify-end">
        <button
          className="group border-none bg-transparent p-0 pt-2 px-2 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-300"
          onClick={() => void handleClearMessages()}
        >
          <InfoCircled className="h-5 w-5" />
          <span
            className={
              "invisible absolute z-50 cursor-auto group-hover:visible text-base text-black dark:text-white " +
              "rounded-md shadow-[0px_5px_12px_rgba(0,0,0,0.32)] p-2 bg-white dark:bg-neutral-700 top-12 right-8 left-8 text-center"
            }
          >
            {infoMessage}
          </span>
        </button>
        <button
          className="border-none bg-transparent p-0 pt-2 px-2 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-300"
          onClick={() => void handleClearMessages()}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
        <button
          className="border-none bg-transparent p-0 pt-2 px-2 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-300"
          onClick={handleExpand}
        >
          <SizeIcon className="h-5 w-5" />
        </button>
        <button
          className="border-none bg-transparent p-0 pt-2 px-2 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-300"
          onClick={onClose}
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <div
        className="flex-grow overflow-scroll gap-2 flex flex-col mx-2 pb-2 rounded-lg"
        ref={listRef}
        onWheel={() => {
          setScrolled(true);
        }}
      >
        {remoteMessages === undefined ? (
          <>
            <div className="animate-pulse rounded-md bg-black/10 h-5" />
            <div className="animate-pulse rounded-md bg-black/10 h-9" />
          </>
        ) : (
          messages.map((message) => (
            <div key={message._id}>
              <div
                className={
                  "text-neutral-400 text-sm " +
                  (message.isViewer && !expanded ? "text-right" : "")
                }
              >
                {message.isViewer ? <>You</> : <>{name}</>}
              </div>
              {message.text === "" ? (
                <div className="animate-pulse rounded-md bg-black/10 h-9" />
              ) : (
                <div
                  className={
                    "w-full rounded-xl px-3 py-2 whitespace-pre-wrap " +
                    (message.isViewer
                      ? "bg-neutral-200 dark:bg-neutral-800 "
                      : "bg-neutral-100 dark:bg-neutral-900 ") +
                    (message.isViewer && !expanded
                      ? "rounded-tr-none"
                      : "rounded-tl-none")
                  }
                >
                  {message.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <form
        className="border-t-neutral-200 dark:border-t-neutral-800 border-solid border-0 border-t-[1px] flex"
        onSubmit={(event) => void handleSend(event)}
      >
        <input
          className="w-full bg-white dark:bg-black border-none text-[1rem] pl-4 py-3 outline-none"
          autoFocus
          name="message"
          placeholder="Send a message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          disabled={input === ""}
          className="bg-transparent border-0 px-4 py-3 enabled:cursor-pointer enabled:hover:text-sky-500"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

const STORE = (typeof window === "undefined" ? null : window)?.sessionStorage;
const STORE_KEY = "ConvexSessionId";

function useSessionId() {
  const [sessionId] = useState(
    () => STORE?.getItem(STORE_KEY) ?? crypto.randomUUID(),
  );

  // Get or set the ID from our desired storage location, whenever it changes.
  useEffect(() => {
    STORE?.setItem(STORE_KEY, sessionId);
  }, [sessionId]);

  return sessionId;
}
