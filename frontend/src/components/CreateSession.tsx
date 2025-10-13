import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '../api';

const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    maxParticipants: 4,
    sessionType: 'public' as 'public' | 'private',
    matchType: 'singles' as 'singles' | 'doubles' | 'tournament',
    skillLevel: 'all' as 'beginner' | 'intermediate' | 'advanced' | 'all'
  });
  const [createdSession, setCreatedSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await sessionAPI.createSession(formData);
      setCreatedSession(session);
      setError(null);
    } catch (err) {
      setError('Failed to create match');
    }
  };

  if (createdSession) {
    return (
      <div className="card">
        <h2>Match Created Successfully! 🎉</h2>
        <div className="alert alert-success">
          <p><strong>Match Title:</strong> {createdSession.title}</p>
          <p><strong>Date:</strong> {createdSession.date} at {createdSession.time}</p>
        </div>

        <div className="alert alert-info">
          <h3>Important - Save These Codes!</h3>
          <p><strong>Management Code:</strong></p>
          <div className="code-box">{createdSession.managementCode}</div>
          <p>Use this to edit or delete the match</p>
          
          {createdSession.privateCode && (
            <>
              <p><strong>Private Access Code:</strong></p>
              <div className="code-box">{createdSession.privateCode}</div>
              <p>Share this code with players to join</p>
            </>
          )}
        </div>

        <button onClick={() => navigate(`/session/${createdSession.id}`)} className="btn btn-primary">
          View Match
        </button>
        <button onClick={() => setCreatedSession(null)} className="btn btn-secondary">
          Create Another
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Create New Badminton Match</h2>
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Match Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Weekend Doubles Match"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details about the match..."
          />
        </div>

        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Time *</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Maximum Players *</label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="2"
            max="20"
            required
          />
        </div>

        <div className="form-group">
          <label>Match Type *</label>
          <select name="matchType" value={formData.matchType} onChange={handleChange}>
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
            <option value="tournament">Tournament</option>
          </select>
        </div>

        <div className="form-group">
          <label>Skill Level *</label>
          <select name="skillLevel" value={formData.skillLevel} onChange={handleChange}>
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label>Visibility *</label>
          <select name="sessionType" value={formData.sessionType} onChange={handleChange}>
            <option value="public">Public (Visible to everyone)</option>
            <option value="private">Private (Only with code)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">Create Match</button>
      </form>
    </div>
  );
};

export default CreateSession;