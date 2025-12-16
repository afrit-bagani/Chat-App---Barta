import type { ReactNode } from "react";
import { TbFileTypeDocx } from "react-icons/tb";
import { BsFiletypeTxt } from "react-icons/bs";
import { SiGoogledocs } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";

export default function FileDisplay({
  fileName,
  fileType,
  size,
  onclick,
}: {
  fileName: string;
  fileType: string;
  size: string;
  onclick: () => Promise<void>;
}) {
  const fileSize = () => {
    const byte = Number(size);
    if (byte < 1024) {
      return `${byte} byte`;
    } else {
      const KB = byte / 1024;
      if (KB < 1024) {
        return `${KB.toFixed(2)} KB`;
      } else {
        const MB = KB / 1024;
        return `${MB.toFixed(2)} MB`;
      }
    }
  };
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      <div className="flex gap-2 md:gap-4">
        <span>{getFileIcon(fileType)}</span>
        <div>
          <div className="text-sm md:text-md font-semibold">{fileName}</div>
          <div className="text-xs font-thin pt-2">{fileSize()}</div>
        </div>
      </div>
      <div>
        <Button
          onClick={onclick}
          variant="secondary"
          className="w-full bg-blue-600 text-white hover:text-black"
        >
          <MdOutlineFileDownload /> Download
        </Button>
      </div>
    </div>
  );
}

const getFileIcon = (fileType: string): ReactNode => {
  const icons: { [key: string]: ReactNode } = {
    "application/pdf": <FaRegFilePdf size={30} className="text-red-500" />,
    "application/msword": <FaRegFileWord />,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
      <TbFileTypeDocx />
    ),
    "text/plain": <BsFiletypeTxt />,
    unknown: <SiGoogledocs />,
  };

  return icons[fileType] || icons["unknown"];
};
