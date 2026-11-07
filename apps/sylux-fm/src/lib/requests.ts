export type RequestStatus = "pending" | "approved" | "rejected" | "now_playing" | "completed";

export type RadioRequest = {
  id: string;
  user_id: string;
  username: string; // Server-owned Discord display name; kept for schema compatibility.
  is_anonymous: boolean;
  song_title: string;
  artist: string;
  dedication_to: string | null;
  message: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export type OverlayRequest = Pick<RadioRequest,
  "id" | "username" | "is_anonymous" | "song_title" | "artist" | "dedication_to" | "message" | "updated_at">;

export function publicSenderName(request: Pick<RadioRequest, "username" | "is_anonymous">): string {
  return request.is_anonymous ? "Anonymous" : request.username;
}
