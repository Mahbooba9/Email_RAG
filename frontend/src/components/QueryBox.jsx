import { useState } from 'react';

export default function QueryBox({ onAsk, isAsking }) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;
    onAsk(question);
  };

  return (
    <div className="query-box card glass">
      <h2>Ask About Your Emails</h2>
      <form onSubmit={handleSubmit} className="query-form">
        <input 
          type="text" 
          value={question} 
          onChange={e => setQuestion(e.target.value)} 
          placeholder="e.g., 'Did I receive any job rejection emails?'" 
          className="input-field"
          disabled={isAsking}
        />
        <button type="submit" className="btn btn-primary" disabled={isAsking || !question.trim()}>
          {isAsking ? 'Thinking...' : 'Ask RAG'}
        </button>
      </form>
    </div>
  );
}
