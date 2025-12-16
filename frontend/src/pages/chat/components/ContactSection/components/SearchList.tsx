import type { IUser } from "@/types";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/utils/getColor";

export default function SearchList({
  contact,
  onClick,
}: {
  contact: IUser;
  onClick: (contact: IUser) => void;
}) {
  const { name, email, avatar, color } = contact;

  return (
    <div className="flex gap-7" onClick={() => onClick(contact)}>
      <Avatar className="h-10 rounded-full overflow-hidden">
        {avatar ? (
          <AvatarImage
            src={avatar}
            alt="profile-image"
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className={`uppercase text-xl md:text-2xl font-semibold flex justify-center items-center rounded-full w-full h-full ${getColor(
              color
            )}`}
          >
            {name?.[0]}
          </div>
        )}
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="text-md font-semibold">{name}</span>
        <span className="text-sm">{email}</span>
      </div>
    </div>
  );
}
