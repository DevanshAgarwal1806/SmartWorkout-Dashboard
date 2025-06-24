import React, { useState } from 'react';
import axios from 'axios';
import './AICoach.css';

const AICoachInfoBox: React.FC = () => (
  <div className="wc-info-box">
    <h2>AI Coach</h2>
    <p>
      Upload your workout CSV to get AI-powered insights and actionable recommendations. The AI Coach analyzes your data to help you optimize your fitness journey and spot trends or areas for improvement.
    </p>
  </div>
);

// Modal component (shared)
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <div className="wc-modal-blur"><div className="wc-modal-blur-effect" /></div>
      <div className="wc-modal-overlay" onClick={onClose}>
        <div className="wc-modal-content" onClick={e => e.stopPropagation()}>
          <button className="wc-modal-close" onClick={onClose}>&times;</button>
          {children}
        </div>
      </div>
    </>
  );
};

const AICoach: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInsights('');
    setError('');
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInsights('');
    setError('');
    if (!file) {
      setError('Please upload a CSV file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/ai-insights/data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInsights(res.data.insights || 'No insights returned.');
      setModalOpen(true);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to generate AI insights.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wc-main-bg">
      <AICoachInfoBox />
      <div className="wc-flex wc-flex-responsive">
        <div className="wc-card wc-card-ai">
          <h1 className="app-page-title wc-section-title">AI Coach</h1>
          <form onSubmit={handleSubmit} className="ai-form">
            <label>
              Upload CSV:
              <input type="file" accept=".csv" onChange={handleFileChange} />
            </label>
            <button type="submit" disabled={loading || !file}>
              {loading ? 'Analyzing...' : 'Get AI Insights'}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
          <Modal open={modalOpen && !!insights} onClose={() => setModalOpen(false)}>
            <div className="ai-insights-modal wc-result-modal wc-calories-modal">
              <div className="wc-modal-heading" style={{fontSize: '1.25rem'}}>AI Insights</div>
              <pre style={{whiteSpace: 'pre-wrap', fontSize: '1.08rem', background: 'none', border: 'none', margin: 0}}>{insights}</pre>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
