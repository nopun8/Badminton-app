import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI, attendanceAPI } from '../api';
import { Session, Attendance } from '../types';

const SessionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [joinedAttendance, setJoinedAttendance] = useState<Attendance | null>(null);
  const [managementCode, setManagementCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSession();
    }
  }, [id]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await sessionAPI.getSession(id!);
      setSession(data);
      setError(null);
    } catch (err) {
      setError('Match not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const attendance = await attendanceAPI.joinSession(id!, playerName, playerEmail);
      setJoinedAttendance(attendance);
      setShowJoinForm(false);
      fetchSession();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join match');
    }
  };

  const handleCancelAttendance = async () => {
    if (joinedAttendance && window.confirm('Are you sure you want to cancel?')) {
      try {
        await attendanceAPI.removeAttendance(
          id!,
          joinedAttendance.id,
          joinedAttendance.attendanceCode
        );
        setJoinedAttendance(null);
        fetchSession();
      } catch (err) {
        setError('Failed to cancel attendance');
      }
    }
  };

  const handleManageSession = () => {
    if (managementCode.trim()) {
      navigate(`/session/${id}/manage?code=${managementCode}`);
    }
  };

  if (loading) return <div className="loading">Loading match details...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!session) return <div className="alert alert-error">Match not found</div>;

  const isFull = session.attendees && session.attendees.length >= session.maxParticipants;

  return (
    <div>
      <div className="card">
        <h2>{session.title}</h2>
        <p>{session.description}</p>
        
        <div style={{ marginTop: '1rem' }}>
          <p><strong>📅 Date:</strong> {session.date}</p>
          <p><strong>⏰ Time:</strong> {session.time}</p>
          <p><strong>👥 Players:</strong> {session.attendees?.length || 0} / {session.maxParticipants}</p>
          <p><strong>🏸 Match Type:</strong> {session.matchType}</p>
          <p><strong>📊 Skill Level:</strong> {session.skillLevel}</p>
          <p><strong>🔒 Type:</strong> {session.sessionType}</p>
        </div>

        <div className="session-meta" style={{ marginTop: '1rem' }}>
          <span className={`badge badge-${session.sessionType}`}>
            {session.sessionType}
          </span>
          <span className={`badge badge-${session.matchType}`}>
            {session.matchType}
          </span>
          <span className="badge">{session.skillLevel}</span>
        </div>
      </div>

      {joinedAttendance && (
        <div className="card">
          <div className="alert alert-success">
            <h3>You're Registered! ✅</h3>
            <p><strong>Your Attendance Code:</strong></p>
            <div className="code-box">{joinedAttendance.attendanceCode}</div>
            <p>Save this code to cancel your attendance later</p>
          </div>
          <button onClick={handleCancelAttendance} className="btn btn-danger">
            Cancel My Attendance
          </button>
        </div>
      )}

      {!joinedAttendance && !isFull && (
        <div className="card">
          <h3>Join This Match</h3>
          {!showJoinForm ? (
            <button onClick={() => setShowJoinForm(true)} className="btn btn-success">
              I'm Going! 🏸
            </button>
          ) : (
            <form onSubmit={handleJoinSession}>
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <button type="submit" className="btn btn-success">Confirm Join</button>
              <button type="button" onClick={() => setShowJoinForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      {isFull && !joinedAttendance && (
        <div className="alert alert-error">
          This match is full
        </div>
      )}

      <div className="card">
        <h3>Players Registered ({session.attendees?.length || 0})</h3>
        {session.attendees && session.attendees.length > 0 ? (
          <div className="attendee-list">
            {session.attendees.map((attendee, index) => (
              <div key={attendee.id} className="attendee-item">
                <div className="attendee-info">
                  <span>🏸</span>
                  <span>{attendee.playerName}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                  {new Date(attendee.joinedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>No players yet. Be the first to join!</p>
        )}
      </div>

      <div className="card">
        <h3>Match Organizer</h3>
        <p>Have the management code? Manage this match:</p>
        <div className="form-group">
          <input
            type="text"
            value={managementCode}
            onChange={(e) => setManagementCode(e.target.value)}
            placeholder="Enter management code"
          />
        </div>
        <button onClick={handleManageSession} className="btn btn-primary">
          Manage Match
        </button>
      </div>
    </div>
  );
};

export default SessionDetails;