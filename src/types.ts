export interface MusicStateData {
  [key: string]: unknown;
  label: string;
  intensity: number; // 0-100
  looping: boolean;
  stems: string[];
}

export interface TransitionData {
  [key: string]: unknown;
  label: string;
  duration: number; // ms
  syncPoint: "immediate" | "next-bar" | "next-beat" | "custom";
  fadeType: "crossfade" | "sting" | "cut" | "bridge";
  directorNote?: string;
  status?: string;
  jiraTicket?: string;
}
