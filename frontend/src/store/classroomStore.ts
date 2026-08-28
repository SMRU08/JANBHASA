import { create } from 'zustand';

export interface ConnectedStudent {
  student_id: number;
  name: string;
  language: string;
  is_active: boolean;
}

export interface ClassroomMessage {
  id: string;
  type: 'translation' | 'text' | 'question' | 'quiz';
  source_text: string;
  translated_text?: string;
  source_lang: string;
  target_lang: string;
  timestamp: number;
  audio_url?: string;
}

interface ClassroomState {
  sessionId: string | null;
  hostUrl: string | null;
  teacherName: string | null;
  className: string | null;
  subject: string | null;
  isTeacher: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  students: ConnectedStudent[];
  messages: ClassroomMessage[];
  currentTranslation: ClassroomMessage | null;
  wsInstance: WebSocket | null;

  setSession: (info: Partial<ClassroomState>) => void;
  addStudent: (student: ConnectedStudent) => void;
  removeStudent: (studentId: number) => void;
  addMessage: (msg: ClassroomMessage) => void;
  setCurrentTranslation: (msg: ClassroomMessage | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setWsInstance: (ws: WebSocket | null) => void;
  clearSession: () => void;
}

export const useClassroomStore = create<ClassroomState>((set) => ({
  sessionId: null,
  hostUrl: null,
  teacherName: null,
  className: null,
  subject: null,
  isTeacher: false,
  isConnected: false,
  isConnecting: false,
  students: [],
  messages: [],
  currentTranslation: null,
  wsInstance: null,

  setSession: (info) => set((s) => ({ ...s, ...info })),
  addStudent: (student) =>
    set((s) => ({
      students: s.students.filter((st) => st.student_id !== student.student_id).concat(student),
    })),
  removeStudent: (id) =>
    set((s) => ({ students: s.students.filter((st) => st.student_id !== id) })),
  addMessage: (msg) =>
    set((s) => ({ messages: [msg, ...s.messages].slice(0, 50) })),
  setCurrentTranslation: (msg) => set({ currentTranslation: msg }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setWsInstance: (ws) => set({ wsInstance: ws }),
  clearSession: () =>
    set({
      sessionId: null, hostUrl: null, teacherName: null, className: null,
      subject: null, isTeacher: false, isConnected: false, isConnecting: false,
      students: [], messages: [], currentTranslation: null, wsInstance: null,
    }),
}));
