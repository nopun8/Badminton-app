import axios from 'axios';
import { Session, Attendance } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sessionAPI = {
  getAllSessions: async (): Promise<Session[]> => {
    const response = await api.get('/sessions');
    return response.data;
  },

  getSession: async (id: string): Promise<Session> => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  createSession: async (sessionData: Partial<Session>): Promise<Session> => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  updateSession: async (
    id: string,
    sessionData: Partial<Session>,
    managementCode: string
  ): Promise<Session> => {
    const response = await api.put(`/sessions/${id}`, {
      ...sessionData,
      managementCode,
    });
    return response.data;
  },

  deleteSession: async (id: string, managementCode: string): Promise<void> => {
    await api.delete(`/sessions/${id}?managementCode=${managementCode}`);
  },
};

export const attendanceAPI = {
  joinSession: async (
    sessionId: string,
    playerName: string,
    email?: string
  ): Promise<Attendance> => {
    const response = await api.post(`/sessions/${sessionId}/attend`, {
      playerName,
      email,
    });
    return response.data;
  },

  removeAttendance: async (
    sessionId: string,
    attendanceId: string,
    code: string,
    isManagementCode: boolean = false
  ): Promise<void> => {
    const param = isManagementCode ? 'managementCode' : 'attendanceCode';
    await api.delete(
      `/sessions/${sessionId}/attend/${attendanceId}?${param}=${code}`
    );
  },

  getAttendees: async (sessionId: string): Promise<Attendance[]> => {
    const response = await api.get(`/sessions/${sessionId}/attendees`);
    return response.data;
  },
};