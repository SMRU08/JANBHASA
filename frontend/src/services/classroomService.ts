import { apiRequest, getWsUrl } from './apiClient';
import { useClassroomStore } from '../store/classroomStore';
import { useAuthStore } from '../store/authStore';

export async function createClassroomSession(teacherId: number, classId?: number, subject?: string) {
  return apiRequest('/api/classroom/create', {
    method: 'POST',
    body: { class_id: classId, subject },
    headers: { 'X-Teacher-Id': String(teacherId) },
  });
}

export async function getSessionInfo(sessionId: string) {
  return apiRequest(`/api/classroom/session/${sessionId}`);
}

export async function endSession(sessionId: string) {
  return apiRequest(`/api/classroom/session/${sessionId}/end`, { method: 'POST' });
}

export function connectToClassroom(
  sessionId: string, hostIp: string, port: number,
  identity: { role: string; student_id?: number; name: string; language: string }
): WebSocket {
  const url = `ws://${hostIp}:${port}/api/classroom/ws/${sessionId}`;
  const ws = new WebSocket(url);
  const store = useClassroomStore.getState();

  ws.onopen = () => {
    store.setConnected(true);
    store.setConnecting(false);
    ws.send(JSON.stringify(identity));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === 'student_joined') {
        store.addStudent({ student_id: msg.student.id, name: msg.student.name, language: msg.student.language, is_active: true });
      } else if (msg.event === 'student_left') {
        store.removeStudent(msg.student.id);
      } else if (msg.message_type === 'translation' || msg.message_type === 'text') {
        // Resolve translated text for THIS student's selected language
        const myLang = useAuthStore.getState().user?.selected_language || identity.language || 'hi';
        let translated = msg.translated_text;

        if (msg.translations && typeof msg.translations === 'object') {
          translated = msg.translations[myLang] || msg.translations[myLang.toLowerCase()] || msg.source_text;
        } else if (msg.source_lang === myLang) {
          translated = msg.source_text;
        }

        const classroomMsg = {
          id: Date.now().toString(),
          type: msg.message_type as any,
          source_text: msg.source_text || '',
          translated_text: translated || msg.source_text,
          source_lang: msg.source_lang || 'hi',
          target_lang: myLang,
          timestamp: Date.now(),
          audio_url: msg.audio_url,
        };
        store.addMessage(classroomMsg);
        store.setCurrentTranslation(classroomMsg);
      } else if (msg.event === 'session_ended') {
        store.clearSession();
      }
    } catch { /* ignore malformed messages */ }
  };

  ws.onerror = () => store.setConnected(false);
  ws.onclose = () => { store.setConnected(false); store.setConnecting(false); };

  store.setWsInstance(ws);
  return ws;
}

export function broadcastToStudents(ws: WebSocket | null, message: object) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export function disconnectFromClassroom() {
  const { wsInstance, clearSession } = useClassroomStore.getState();
  if (wsInstance) {
    wsInstance.close();
  }
  clearSession();
}
