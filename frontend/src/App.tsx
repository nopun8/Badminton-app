import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AllSessions from './components/AllSessions';
import CreateSession from './components/CreateSession';
import SessionDetails from './components/SessionDetails';
import ManageSession from './components/ManageSession';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>🏸 Badminton Match Planner</h1>
            <nav className="nav-menu">
              <Link to="/" className="nav-link">All Matches</Link>
              <Link to="/create" className="nav-link create-btn">Create Match</Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<AllSessions />} />
              <Route path="/create" element={<CreateSession />} />
              <Route path="/session/:id" element={<SessionDetails />} />
              <Route path="/session/:id/manage" element={<ManageSession />} />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <p>Badminton Match Planner © 2025</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;