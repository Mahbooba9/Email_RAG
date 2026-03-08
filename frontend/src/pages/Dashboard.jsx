import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import QueryBox from '../components/QueryBox';
import AnswerBox from '../components/AnswerBox';
import { LogOut, RefreshCw, Mail, Database } from 'lucide-react';

export default function Dashboard() {
  const [answer, setAnswer] = useState('');
  const [contextCount, setContextCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchEmails = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    onSuccess: async (tokenResponse) => {
      setIsFetching(true);
      try {
        const tokens = { access_token: tokenResponse.access_token }; 
        const res = await api.post('/gmail/fetch', { tokens });
        alert(res.data.message || 'Emails fetched securely!');
      } catch (err) {
        alert('Failed to fetch emails: ' + (err.response?.data?.error || err.message));
      } finally {
        setIsFetching(false);
      }
    },
    onError: (error) => {
      alert('Google Login Failed: ' + error.error_description || error.error);
    }
  });

  const askQuestion = async (question) => {
    setIsAsking(true);
    setAnswer('');
    try {
      const res = await api.post('/query', { question });
      setAnswer(res.data.answer);
      setContextCount(res.data.contextCount);
    } catch (err) {
      setAnswer('Sorry, there was an error processing your query. ' + (err.response?.data?.error || err.message));
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <nav className="navbar glass">
        <div className="nav-brand">
          <Database className="icon-gold" />
          <span>Student RAG</span>
        </div>
        <div className="nav-actions">
          <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'Student'}</span>
          <button onClick={handleLogout} className="btn btn-outline small">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <header className="page-header">
          <h1>Your AI Email Assistant</h1>
          <p>Sync your emails and ask any question using advanced RAG.</p>
        </header>

        <section className="action-panel card glass">
          <div className="panel-info">
            <Mail size={24} className="icon-blue" />
            <div>
              <h3>Sync Latest Emails</h3>
              <p>Fetch your emails from the last 30 days (max 200).</p>
            </div>
          </div>
          <button onClick={fetchEmails} disabled={isFetching} className="btn btn-secondary">
            {isFetching ? <><RefreshCw size={16} className="spin" /> Syncing...</> : 'Fetch Emails'}
          </button>
        </section>

        <section className="query-section">
          <QueryBox onAsk={askQuestion} isAsking={isAsking} />
          {(answer || isAsking) && (
            <AnswerBox answer={answer} isAsking={isAsking} contextCount={contextCount} />
          )}
        </section>
      </main>
    </div>
  );
}
