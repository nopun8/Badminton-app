export interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  maxParticipants: number;
  sessionType: 'public' | 'private';
  matchType: 'singles' | 'doubles' | 'tournament';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  managementCode: string;
  privateCode?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  playerName: string;
  email?: string;
  attendanceCode: string;
  joinedAt: string;
}

export interface AppData {
  sessions: Session[];
  attendances: Attendance[];
}