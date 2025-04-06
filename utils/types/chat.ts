import { Timestamp } from "firebase/firestore";

export interface IChatList {
  uid: string;
  //get all participants and keep them somewhere
  //then get their profile with just their uid
  participants: Record<string, boolean>;
  isGroup: boolean;
  hasMessage?: boolean;
  name: string;
  createdBy?: string;
  createdAt: Timestamp;
  lastMessage: IChatMessage;
}

export interface IChatMessage {
  _id: string;
  createdAt: Timestamp;
  senderId: string;
  text: string;
  image?: string;
  video?: string;
  audio?: string;
  index?: number; // This is generated on the client side, to scroll to messages
  system?: boolean;
  type: "text" | "image" | "video" | "audio";
  sent?: boolean;
}
