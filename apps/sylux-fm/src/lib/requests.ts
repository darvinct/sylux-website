export type RequestStatus = "pending" | "approved" | "rejected" | "now_playing" | "completed";

export type RadioRequest = {
  id: string;
  user_id: string;
  username: string;
  song_title: string;
  artist: string;
  dedication_to: string | null;
  message: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export type OverlayRequest = Pick<RadioRequest,
  "id" | "username" | "song_title" | "artist" | "dedication_to" | "message" | "updated_at">;
