import { create } from "zustand";
import type { IMesaage, IUser } from "./types";

type SetUserAction = IUser | null | ((prev: IUser) => IUser);

type UserStore = {
  user: IUser | null;
  setUser: (userOrUpdater: SetUserAction) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (userOrUpdater) =>
    set((state) => {
      // compute the "next" user whether a value or updater was passed
      const next: IUser | null =
        typeof userOrUpdater === "function"
          ? (userOrUpdater as (prev: IUser | null) => IUser | null)(state.user)
          : userOrUpdater;

      // shallow/effective change check (your JSON.stringify approach kept intact)
      const prevStr = state.user ? JSON.stringify(state.user) : null;
      const nextStr = next ? JSON.stringify(next) : null;
      if (prevStr === nextStr) return state;

      return { user: next };
    }),
}));

type ChatStore = {
  selectedChatType: "contact" | "channel" | null;
  selectedChatData: IUser | null;
  selectedChatMessages: [];
  directMessagesContact: [];
  isUploading: null | boolean;
  isDownloading: null | boolean;
  fileUploadProgress: null | number;
  fileDownloadProgress: null | number;
  setIsUploading: (state: null | boolean) => void;
  setIsDownloading: (state: null | boolean) => void;
  setFileUploadProgress: (state: null | number) => void;
  setFileDownloadProgress: (state: null | number) => void;
  setSelectedChatType: (type: "contact" | "channel") => void;
  setSelectedChatData: (data: IUser | null) => void;
  setSelectedChatMessages: (messages: []) => void;
  setDirectMessagesContact: (directMessagesContact: []) => void;
  addMessage: (message: IMesaage) => void;
  closeChat: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  selectedChatType: null,
  selectedChatData: null,
  selectedChatMessages: [],
  directMessagesContact: [],
  isUploading: null,
  isDownloading: null,
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  fileUploadProgress: null,
  fileDownloadProgress: null,
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) =>
    set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContact: (directMessagesContact) =>
    set({ directMessagesContact }),

  addMessage: (message: IMesaage) => {
    // set({
    //   selectedChatMessages: [...get().selectedChatMessages, message],
    // });
    const selectedChatType = get().selectedChatType;
    const selectedChatMessage = get().selectedChatMessages;

    set({
      selectedChatMessages: [
        // @ts-ignore
        ...selectedChatMessage,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : // @ts-ignore
                message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : // @ts-ignore
                message.sender._id,
        },
      ],
    });
  },

  closeChat: () =>
    set({
      selectedChatType: null,
      selectedChatData: null,
      selectedChatMessages: [],
    }),
}));
