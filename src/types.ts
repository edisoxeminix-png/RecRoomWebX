export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface AvatarConfig {
  color: string;
  hat?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email?: string;
  avatar: AvatarConfig;
}

export interface PlayerState {
  userId: string;
  username: string;
  position: Vec3;
  rotation: Vec3;
  avatar: AvatarConfig;
  handLOffset?: [number, number, number];
  handROffset?: [number, number, number];
  gripL?: number;
  gripR?: number;
  updatedAt: any; // Server timestamp
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

export interface RoomInfo {
  id: string;
  name: string;
  type: 'lobby' | 'game' | 'social';
}
