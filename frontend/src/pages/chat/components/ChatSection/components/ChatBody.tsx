import { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "sonner";
import { MdOutlineFileDownload } from "react-icons/md";
import { RiCloseFill } from "react-icons/ri";

// Local import
import type { IMesaage } from "@/types";
import { useChatStore, useUserStore } from "@/store";
import { GET_ALL_MESSAGE_ROUTE } from "@/utils/constant";
import { Button } from "@/components/ui/button";
import FileDisplay from "./FileDisplay";

export default function ChatBody() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [imageToPreview, setImageToPreview] = useState<string | null>(null);

  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    isUploading,
    isDownloading,
    setIsDownloading,
    fileUploadProgress,
    setFileDownloadProgress,
    fileDownloadProgress,
  } = useChatStore();
  // const user = useUserStore().user;

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await fetch(
          `${GET_ALL_MESSAGE_ROUTE}?userID=${selectedChatData?._id}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!res.ok) {
          console.error("Error while fetching messages");
          return toast.error("Error while fetching messages");
        }
        const data = await res.json();
        setSelectedChatMessages(data.data.messages);
      } catch (error) {
        console.error("Error while fetching message: \n", error);
      }
    };

    if (selectedChatData?._id && selectedChatType === "contact") {
      getMessages();
    }
  }, [selectedChatType, selectedChatData, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkImage = (filePath: string) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const filename = url.substring(url.lastIndexOf("/") + 1);
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image.");
    }
  };

  const downloadFile = async (url: string) => {
    try {
      setIsDownloading(true);
      setFileDownloadProgress(0);

      const res = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress(progressEvent) {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setFileDownloadProgress(percent);
          }
        },
      });
      const urlBlob = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = urlBlob;
      const fileName = url.substring(url.lastIndexOf("/") + 1);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      setIsDownloading(false);
    } catch (error) {
      toast.error("Error while downloading file");
      console.error("Error while downloading file: \n", error);
      setIsDownloading(false);
    }
  };

  const renderMessages = () => {
    let lastDate: string | null = null;
    return selectedChatMessages.map((message: IMesaage, index) => {
      const messageDate = moment(message.createdAt).format("DD-MM-YY");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          <div className="flex justify-center">
            {showDate && (
              <span className="text-gray-400 bg-black rounded-sm px-2 my-2">
                {moment(message.createdAt).format("LL")}
              </span>
            )}
          </div>
          {selectedChatType === "contact" && renderDM(message)}
        </div>
      );
    });
  };

  const renderDM = (message: IMesaage) => (
    <div
      className={`${
        message.sender === selectedChatData?._id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData?._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#841ff]/50"
              : "bg-[#2a2b33]/5 text-white/90 border-[#fffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender !== selectedChatData?._id
              ? "bg-[#8417ff]/10"
              : "bg-[#2a2b33]/5"
          } border inline-block p-2 rounded my-1 max-w-[70%] break-words`}
        >
          {checkImage(message.fileURL) ? (
            <div className="flex flex-col gap-2">
              <img
                src={`${message.fileURL}`}
                alt="chat-image"
                width={300}
                className="cursor-pointer"
                onClick={() => setImageToPreview(message.fileURL)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setImageToPreview(message.fileURL)}
                  className="w-1/2"
                >
                  Open
                </Button>
                <Button
                  onClick={() => downloadImage(message.fileURL)}
                  variant="secondary"
                  className="w-1/2 bg-blue-600 text-white hover:text-black"
                >
                  <MdOutlineFileDownload /> Download
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <FileDisplay
                fileName={message.fileName}
                fileType={message.fileType}
                size={message.size}
                onclick={() => downloadFile(message.fileURL)}
              />
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-600">
        {moment(message.createdAt).format("LT")}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto  p-4 px-8 w-full">
      {/* render the image to chat body */}
      {imageToPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative">
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => downloadImage(imageToPreview)}
                className="p-2 text-2xl text-white bg-black/50 rounded-full hover:bg-black/70"
              >
                <MdOutlineFileDownload />
              </button>
              <button
                onClick={() => setImageToPreview(null)}
                className="p-2 text-2xl text-white bg-black/50 rounded-full hover:bg-black/70"
              >
                <RiCloseFill />
              </button>
            </div>
            <img
              src={imageToPreview}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              alt="image"
            />
          </div>
        </div>
      )}
      {renderMessages()}
      {isUploading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex flex-col justify-center items-center gap-5  backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">
            Uploading File {fileUploadProgress}%
          </h5>
        </div>
      )}
      {isDownloading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex flex-col justify-center items-center gap-5  backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">
            Downloading File {fileDownloadProgress}%
          </h5>
        </div>
      )}
      <div ref={scrollRef}></div>
    </div>
  );
}
