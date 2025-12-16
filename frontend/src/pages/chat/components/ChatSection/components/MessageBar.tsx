import { useEffect, useRef, useState, type ChangeEvent } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { toast } from "sonner";
import { CgAttachment } from "react-icons/cg";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";

// Local Import
import { useSocket } from "@/context";
import { useChatStore, useUserStore } from "@/store";
import { Button } from "@/components/ui/button";
import { UPLOAD_FILE_ROUTE } from "@/utils/constant";

export default function MessageBar() {
  const emojiRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const socket = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore().user;
  const {
    selectedChatType,
    selectedChatData,
    setIsUploading,
    setFileUploadProgress,
  } = useChatStore();

  // when clicked outside, emoji box will be disapper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node)
      ) {
        setEmojiPickerOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  //@ts-ignore
  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    console.log("Message send");
    if (selectedChatType === "contact") {
      socket?.emit("sendMessage", {
        sender: user?._id,
        content: message,
        recipient: selectedChatData?._id,
        messageType: "text",
        fileURL: null,
      });
    }
  };

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const file  = event.currentTarget.files?.[0];
  //   setFileUploadProgress(0);
  //   // setUpload status
  // }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setFileUploadProgress(0);

      const xhr = new XMLHttpRequest();

      // 1. setup progress listener
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setFileUploadProgress(percent);
        }
      });
      // 2. setup error listener
      xhr.addEventListener("error", () => {
        setIsUploading(false);
        setFileUploadProgress(0);
        toast.error("Error during file upload");
      });

      // 3. setup LOAD listener
      xhr.addEventListener("load", () => {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (selectedChatType === "contact") {
            socket?.emit("sendMessage", {
              sender: user?._id,
              recipient: selectedChatData?._id,
              messageType: "file",
              content: null,
              fileName: data.data.fileName,
              fileType: data.data.fileType,
              fileURL: data.data.fileURL,
              size: data.data.size,
            });
          } else {
            toast.error(
              "File uploaded completed, but server returned an error"
            );
          }
        }
      });

      // 4. configure and send request
      xhr.open("POST", UPLOAD_FILE_ROUTE);
      xhr.withCredentials = true;
      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
      console.error("Error while Uploading file: \n", error);
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-4 gap-5">
      <div className="relative" ref={emojiRef}>
        <button
          onClick={() => setEmojiPickerOpen((prev) => !prev)}
          className="text-neutral-500 focus:border-none hover:text-white duration-300 transition-all text-2xl"
        >
          <BsEmojiSmile />
        </button>
        <div ref={emojiRef} className="absolute bottom-14 right-0">
          <EmojiPicker
            theme={Theme.AUTO}
            open={emojiPickerOpen}
            onEmojiClick={handleAddEmoji}
            autoFocusSearch={false}
          />
        </div>
      </div>
      <button onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          ref={fileInputRef}
          name="file"
          onChange={handleFileUpload}
          hidden
        />
        <CgAttachment />
      </button>
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5">
        <input
          type="text"
          placeholder="Type Your Message"
          className="flex-1 p-5 bg-transparent focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button
        onClick={handleSendMessage}
        size="icon"
        aria-label="Send"
        className="bg-red-600 rounded-full"
      >
        <IoSend />
      </Button>
    </div>
  );
}
