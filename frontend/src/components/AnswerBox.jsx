import { Sparkles, Mail } from 'lucide-react';

export default function AnswerBox({ answer, isAsking, contextCount }) {
  if (isAsking) {
    return (
      <div className="answer-box card glass skeleton">
        <div className="skeleton-pulse"></div>
        <div className="skeleton-pulse short"></div>
      </div>
    );
  }

  if (!answer) return null;

  return (
    <div className="answer-box card glass highlight">
      <div className="answer-header">
        <Sparkles className="icon-gold" size={24} />
        <h3 className="gradient-text">AI Analysis</h3>
      </div>
      <div className="answer-content">
        <p>{answer}</p>
      </div>
      {contextCount !== undefined && (
        <div className="context-meta">
          <Mail size={14} /> Based on {contextCount} relevant email{contextCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
