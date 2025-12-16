import { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";

// UI
import { Button } from "@/components/ui/button";
import { colors, getColor } from "@/utils/getColor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

// Local Import
import { useUserStore } from "@/store";
import {
  DELETE_PROFILE_PICTURE,
  LOGOUT_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constant";
import { toast } from "sonner";

export const ProfileAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  try {
    const res = await fetch(UPDATE_PROFILE_ROUTE, {
      method: "PATCH",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      toast.error(errorData?.message || "Failed to update profile.");
      return null;
    }
    const data = await res.json();
    const user = data.data.user;
    toast.success("Profile Updated");
    return user;
  } catch (error) {
    toast.error("An error occurred while updating the profile.");
    console.error("Error during profile update request: \n", error);
    return null;
  }
};

export default function Profile() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const fetchedUser = fetcher.data;
  const { user: userInfo, setUser } = useUserStore();

  // wraping it into useEffect cz rendering (profile.tsx) & state upatate (App.tsx) can not happen together
  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser, setUser]);

  const navigate = useNavigate();

  const [name, setName] = useState(userInfo?.name);
  const [email] = useState(userInfo?.email);
  const [avatar, setAvatar] = useState(userInfo?.avatar);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(userInfo?.color || 0);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevUrlRef = useRef<string | null>(null);
  const [isDeleting, setIsdeleting] = useState(false);

  // If user change in store then. sync with local inputs
  useEffect(() => {
    setName(userInfo?.name);
    setAvatar(userInfo?.avatar);
    setSelectedColor(userInfo?.color ?? 0);
  }, [userInfo]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, []);

  const handleBackButton = () => {
    navigate(-1);
  };

  function onImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setImagePreview(url);
  }

  const handleDeleteImage = async () => {
    setUser((prev) => (prev ? { ...prev, avatar: null } : prev));
    try {
      setIsdeleting(true);
      const res = await fetch(DELETE_PROFILE_PICTURE, {
        method: "DELETE",
        body: JSON.stringify({ publicId: userInfo?.publicId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      setIsdeleting(false);
      const data = await res.json();
      setUser(data.data.user);
      toast.success(data.message);
    } catch (error) {
      console.error("Error while deleting user's profile image: \n", error);
    } finally {
      setIsdeleting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(LOGOUT_ROUTE, { credentials: "include" });
    setUser(null);
    navigate("/signin");
  };

  const inputCSS =
    "mt-1 w-full px-4 py-2 text-white focus:text-black border border-gray-400 rounded-lg shadow-sm outline-none focus:bg-blue-50 focus:border-blue-500";
  const src = imagePreview || avatar;
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#1b1c24]">
      <div className="w-full md:w-4/12">
        <button
          onClick={handleBackButton}
          className="flex flex-row justify-start text-3xl md:text-4xl text-white cursor-pointer"
        >
          <FaArrowLeft />
        </button>
        <fetcher.Form
          method="PATCH"
          encType="multipart/form-data"
          className="flex flex-col justify-center items-center space-y-4"
        >
          <div
            className="h-32 w-32 md:h-48 md:w-48 relative flex justify-center items-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {src ? (
                <AvatarImage
                  src={src}
                  alt="profile-image"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className={`uppercase text-5xl md:text-9xl font-semibold flex justify-center items-center rounded-full w-full h-full outline-6 ${getColor(
                    selectedColor
                  )}`}
                >
                  {name?.[0]}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div className="absolute inset-0 flex justify-center items-center bg-black/50 rounded-full cursor-pointer">
                {avatar ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <MdDelete className="text-white text-3xl md:text-4xl" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure want to remove profile picture ?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteImage}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting ..." : "Continue"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <MdEdit
                    className="text-white text-3xl md:text-4xl"
                    onClick={() => fileInputRef.current?.click()}
                  />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              name="profile-image"
              onChange={onImagePick}
              accept="image/*"
              hidden
            />
          </div>
          {!src && (
            <div className="flex flex-row justify-evenly items-center gap-2">
              {colors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`${color} h-5 w-5 md:h-8 md:w-8 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 ${
                    selectedColor === index
                      ? "outline-offset-2 outline-2  outline-white/80"
                      : ""
                  }`}
                />
              ))}
              <input type="hidden" name="color" value={selectedColor} />
            </div>
          )}

          <div className="w-full text-white">
            <label
              htmlFor="name"
              id="name"
              className="text-sm md:text-lg font-medium"
            >
              Name:{" "}
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={name}
              placeholder={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCSS}
            />
          </div>
          <div className="w-full text-white">
            <label htmlFor="name" className="text-sm md:text-lg font-medium">
              Email:{" "}
            </label>
            <input
              id="email"
              name="email"
              value={email}
              disabled
              placeholder={email}
              className={`${inputCSS} bg-gray-500 text-gray-300 cursor-not-allowed`}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center gap-2">
                <Spinner />
                <p>Updating</p>
              </div>
            ) : (
              "Save Change"
            )}
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}
