export type RequestStatus = "pending" | "approved" | "rejected" | "now_playing" | "completed";

export type RadioRequest = {
  id: string;
  user_id: string;
  username: string; // Legacy server-owned field, never used to render public sender names.
  display_name: string; // Verified Discord OAuth display name, controlled by the database trigger.
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
  "id" | "display_name" | "is_anonymous" | "song_title" | "artist" | "dedication_to" | "message" | "updated_at">;

export function publicSenderName(request: Pick<RadioRequest, "display_name" | "is_anonymous">): string {
  return request.is_anonymous ? "Anonymous" : request.display_name || "SYLUX Listener";
}
