import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { sessionAPI, attendanceAPI } from '../api';
import { Session } from '../types';

const ManageSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const managementCode = searchParams.get('code') || '';
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    maxParticipants: 4,
    matchType: 'singles' as 'singles' | 'doubles' | 'tournament',
    skillLevel: 'all' as 'beginner' | 'intermediate' | 'advanced' | 'all'
  });

  useEffect(() => {
    if (id) {
      fetchSession();
    }
  }, [id]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await sessionAPI.getSession(id!);
      
      if (data.managementCode !== managementCode) {
        setError('Invalid management code');
        setLoading(false);
        return;
      }
      
      setSession(data);
      setFormData({
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        maxParticipants: data.maxParticipants,
        matchType: data.matchType,
        skillLevel: data.skillLevel
      });
      setError(null);
    } catch (err) {
      setError('Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' ? parseInt(value) : value
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sessionAPI.updateSession(id!, formData, managementCode);
      setEditMode(false);
      fetchSession();
    } catch (err) {
      setError('Failed to update match');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this match? This cannot be undone.')) {
      try {
        await sessionAPI.deleteSession(id!, managementCode);
        navigate('/');
      } catch (err) {
        setError('Failed to delete match');
      }
    }
  };

  const handleRemoveAttendee = async (attendanceId: string) => {
    if (window.confirm('Remove this player from the match?')) {
      try {
        await attendanceAPI.removeAttendance(id!, attendanceId, managementCode, true);
        fetchSession();
      } catch (err) {
        setError('Failed to remove player');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!session) return <div className="alert alert-error">Match not found</div>;

  return (
    <div>
      <div className="card">
        <h2>Manage Match: {session.title}</h2>
        
        {!editMode ? (
          <>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Title:</strong> {session.title}</p>
              <p><strong>Description:</strong> {session.description}</p>
              <p><strong>Date:</strong> {session.date}</p>
              <p><strong>Time:</strong> {session.time}</p>
              <p><strong>Max Players:</strong> {session.maxParticipants}</p>
              <p><strong>Match Type:</strong> {session.matchType}</p>
              <p><strong>Skill Level:</strong> {session.skillLevel}</p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => setEditMode(true)} className="btn btn-primary">
                Edit Match
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete Match
              </button>
              <button onClick={() => navigate(`/session/${id}`)} className="btn btn-secondary">
                View Match Page
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Match Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Maximum Players</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="2"
                required
              />
            </div>

            <div className="form-group">
              <label>Match Type</label>
              <select name="matchType" value={formData.matchType} onChange={handleChange}>
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>

            <div className="form-group">
              <label>Skill Level</label>
              <select name="skillLevel" value={formData.skillLevel} onChange={handleChange}>
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success">Save Changes</button>
            <button type="button" onClick={() => setEditMode(false)} className="btn btn-secondary">
              Cancel
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <h3>Registered Players ({session.attendees?.length || 0})</h3>
        {session.attendees && session.attendees.length > 0 ? (
          <div className="attendee-list">
            {session.attendees.map((attendee) => (
              <div key={attendee.id} className="attendee-item">
                <div className="attendee-info">
                  <span>🏸</span>
                  <div>
                    <strong>{attendee.playerName}</strong>
                    {attendee.email && <div style={{ fontSize: '0.85rem', color: '#666' }}>{attendee.email}</div>}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAttendee(attendee.id)}
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No players registered yet</p>
        )}
      </div>
    </div>
  );
};

export default ManageSession;