export enum JarvisState {
  OFFLINE = "OFFLINE",
  INITIALIZING = "INITIALIZING",
  ACTIVE = "ACTIVE",
  CAPTURING = "CAPTURING",
  ANALYZING = "ANALYZING",
  SPEAKING = "SPEAKING",
  ERROR = "ERROR",
}

export type PersonalityId = "JARVIS" | "FRIDAY" | "KAREN" | "EDITH";

export interface Personality {
  id: PersonalityId;
  name: string;
  subtitle: string;
  accentTip: string;
  defaultRate: number;
  defaultPitch: number;
  promptPrefixState: string; // Describes the customized mood
  welcomeMessage: string;
  soundPitchOffset: number;
}

export interface ScanItem {
  id: string;
  timestamp: string;
  image: string; // Base64 snapshot
  objectName: string;
  link: string;
  fullResponse: string;
  success: boolean;
  threatLevel?: "Ninguno" | "Bajo" | "Medio" | "Alto";
  threatDetail?: string;
}

export interface SpeechConfig {
  enabled: boolean;
  voiceName: string;
  rate: number;
  pitch: number;
  volume: number;
  personality: PersonalityId; // Added personality preset select support
  soundEffectsEnabled: boolean; // Toggle high-fidelity custom sound effects
}

export interface SystemDiagnostic {
  label: string;
  value: string;
  status: "nominal" | "warning" | "alert" | "info";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isImprovedIdea?: boolean;
  youtubeUrl?: string;
  isSongRequest?: boolean;
  songTitle?: string;
  isChannelRequest?: boolean;
  channelName?: string;
  generatedImageUrl?: string;
  imagePrompt?: string;
  isHomeworkSolution?: boolean;
  homeworkSubject?: string;
  isSiriAlexaAction?: boolean;
  actionBadge?: string;
  attachedImageUrl?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  title: string;
  isRegistered: boolean;
}


