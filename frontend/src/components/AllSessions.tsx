import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '../api';
import { Session } from '../types';

const AllSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [privateCode, setPrivateCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionAPI.getAllSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivateAccess = () => {
    if (privateCode.trim()) {
      navigate(`/session/${privateCode}`);
    }
  };

  if (loading) return <div className="loading">Loading matches...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="card">
        <h2>Access Private Match</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter private match code"
            value={privateCode}
            onChange={(e) => setPrivateCode(e.target.value)}
          />
        </div>
        <button onClick={handlePrivateAccess} className="btn btn-primary">
          Access Match
        </button>
      </div>

      <h2 style={{ color: 'white', marginBottom: '1rem' }}>Public Matches</h2>
      
      {sessions.length === 0 ? (
        <div className="card">
          <p>No matches available. Create one!</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="session-card"
              onClick={() => navigate(`/session/${session.id}`)}
            >
              <h3>{session.title}</h3>
              <p>{session.description}</p>
              <p><strong>Date:</strong> {session.date}</p>
              <p><strong>Time:</strong> {session.time}</p>
              <div className="session-meta">
                <span className={`badge badge-${session.sessionType}`}>
                  {session.sessionType}
                </span>
                <span className={`badge badge-${session.matchType}`}>
                  {session.matchType}
                </span>
                <span className="badge">{session.skillLevel}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSessions;