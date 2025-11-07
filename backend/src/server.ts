import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Session, Attendance, AppData } from './types';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

const initializeData = (): AppData => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData: AppData = { sessions: [], attendances: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};

const saveData = (data: AppData): void => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const generateCode = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, length + 2);
};

app.get("/",  (req: Request, res: Response) => {
    res.send("<h1>welcome to backend</h1>");
})

app.get('/api/sessions', (req: Request, res: Response) => {
  const data = initializeData();
  const publicSessions = data.sessions.filter(s => s.sessionType === 'public');
  res.json(publicSessions);
});

app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const data = initializeData();
  const { id } = req.params;
  
  let session = data.sessions.find(s => s.id === id);
  
  if (!session) {
    session = data.sessions.find(s => s.privateCode === id);
  }
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const attendances = data.attendances.filter(a => a.sessionId === session!.id);
  
  res.json({ ...session, attendees: attendances });
});

app.post('/api/sessions', (req: Request, res: Response) => {
  const data = initializeData();
  
  const newSession: Session = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
    maxParticipants: req.body.maxParticipants,
    sessionType: req.body.sessionType,
    matchType: req.body.matchType || 'singles',
    skillLevel: req.body.skillLevel || 'all',
    managementCode: generateCode(),
    privateCode: req.body.sessionType === 'private' ? generateCode(10) : undefined,
    createdAt: new Date().toISOString()
  };
  
  data.sessions.push(newSession);
  saveData(data);
  
  res.status(201).json(newSession);
});

app.put('/api/sessions/:id', (req: Request, res: Response) => {
  const data = initializeData();
  const { id } = req.params;
  const { managementCode } = req.body;
  
  const sessionIndex = data.sessions.findIndex(s => s.id === id);
  
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (data.sessions[sessionIndex].managementCode !== managementCode) {
    return res.status(403).json({ error: 'Invalid management code' });
  }
  
  const updatedSession = {
    ...data.sessions[sessionIndex],
    title: req.body.title || data.sessions[sessionIndex].title,
    description: req.body.description || data.sessions[sessionIndex].description,
    date: req.body.date || data.sessions[sessionIndex].date,
    time: req.body.time || data.sessions[sessionIndex].time,
    maxParticipants: req.body.maxParticipants || data.sessions[sessionIndex].maxParticipants,
    matchType: req.body.matchType || data.sessions[sessionIndex].matchType,
    skillLevel: req.body.skillLevel || data.sessions[sessionIndex].skillLevel
  };
  
  data.sessions[sessionIndex] = updatedSession;
  saveData(data);
  
  res.json(updatedSession);
});

app.delete('/api/sessions/:id', (req: Request, res: Response) => {
  const data = initializeData();
  const { id } = req.params;
  const { managementCode } = req.query;
  
  const sessionIndex = data.sessions.findIndex(s => s.id === id);
  
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (data.sessions[sessionIndex].managementCode !== managementCode) {
    return res.status(403).json({ error: 'Invalid management code' });
  }
  
  data.sessions.splice(sessionIndex, 1);
  data.attendances = data.attendances.filter(a => a.sessionId !== id);
  saveData(data);
  
  res.json({ message: 'Session deleted successfully' });
});

app.post('/api/sessions/:id/attend', (req: Request, res: Response) => {
  const data = initializeData();
  const { id } = req.params;
  const { playerName, email } = req.body;
  
  const session = data.sessions.find(s => s.id === id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const currentAttendees = data.attendances.filter(a => a.sessionId === id);
  if (currentAttendees.length >= session.maxParticipants) {
    return res.status(400).json({ error: 'Session is full' });
  }
  
  const newAttendance: Attendance = {
    id: uuidv4(),
    sessionId: id,
    playerName,
    email,
    attendanceCode: generateCode(),
    joinedAt: new Date().toISOString()
  };
  
  data.attendances.push(newAttendance);
  saveData(data);
  
  res.status(201).json(newAttendance);
});

app.delete('/api/sessions/:id/attend/:attendanceId', (req: Request, res: Response) => {
  const data = initializeData();
  const { id, attendanceId } = req.params;
  const { attendanceCode, managementCode } = req.query;
  
  const attendanceIndex = data.attendances.findIndex(
    a => a.id === attendanceId && a.sessionId === id
  );
  
  if (attendanceIndex === -1) {
    return res.status(404).json({ error: 'Attendance not found' });
  }
  
  const session = data.sessions.find(s => s.id === id);
  
  const validAttendanceCode = data.attendances[attendanceIndex].attendanceCode === attendanceCode;
  const validManagementCode = session?.managementCode === managementCode;
  
  if (!validAttendanceCode && !validManagementCode) {
    return res.status(403).json({ error: 'Invalid code' });
  }
  
  data.attendances.splice(attendanceIndex, 1);
  saveData(data);
  
  res.json({ message: 'Attendance removed successfully' });
});

app.get('/api/sessions/:id/attendees', (req: Request, res: Response) => {
  const data = initializeData();
  const { id } = req.params;
  
  const attendees = data.attendances.filter(a => a.sessionId === id);
  res.json(attendees);
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  initializeData();
});