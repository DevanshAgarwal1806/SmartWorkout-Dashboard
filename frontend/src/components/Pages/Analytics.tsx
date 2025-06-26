import React, { useState } from 'react';
import axios from 'axios';
import './Analytics.css';

const graphTypes = [
  'Line',
  'Scatter',
  'Bar',
  'Histogram',
  'Box',
];

const statModes = [
  'Sum',
  'Mean',
  'Median',
];

const AnalyticsInfoBox: React.FC = () => (
  <div className="wc-info-box">
    <h2>Analytics Plotter</h2>
    <p>
      You can upload your workout CSV from any of the fitness apps you are using(Ex: google fit) and visualize trends with interactive plots. Select the axes, graph type, and optional legend to explore your data and gain insights into your fitness journey.
    </p>
  </div>
);

// Modal component (shared, copied from AICoach)
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

const Analytics: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [graphType, setGraphType] = useState('Line');
  const [legend, setLegend] = useState('');
  const [statMode, setStatMode] = useState('Sum');
  const [plotUrl, setPlotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Step 1: Read columns from CSV
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlotUrl(null);
    setError('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Fetch columns from backend
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        setLoading(true);
        const res = await axios.post(
          'http://localhost:8000/api/analyze-data',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setColumns(res.data.column_names || []);
        setXAxis('');
        setYAxis('');
      } catch (err) {
        setError('Failed to analyze CSV.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Step 2: Submit for plot
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPlotUrl(null);
    if (!file || !xAxis || !yAxis) {
      setError('Please select a file and both axes.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'plot_config',
      JSON.stringify({ x_axis: xAxis, y_axis: yAxis, graph_type: graphType, legend_attr: legend, stat_mode: statMode })
    );
    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:8000/api/generate-plot',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setPlotUrl(res.data.plot);
      setModalOpen(true);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to generate plot.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wc-main-bg">
      <AnalyticsInfoBox />
      <div className="wc-flex wc-flex-responsive">
        <div className="wc-card wc-card-analytics">
          <h1 className="app-page-title wc-section-title">Analytics</h1>
          <form onSubmit={handleSubmit} className="analytics-form">
            <label>
              Upload CSV:
              <input type="file" accept=".csv" onChange={handleFileChange} />
            </label>
            {columns.length > 0 && (
              <>
                <label>
                  X Axis:
                  <select value={xAxis} onChange={e => setXAxis(e.target.value)}>
                    <option value="">Select</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Y Axis:
                  <select value={yAxis} onChange={e => setYAxis(e.target.value)}>
                    <option value="">Select</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Graph Type:
                  <select value={graphType} onChange={e => setGraphType(e.target.value)}>
                    {graphTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Statistic Mode:
                  <select value={statMode} onChange={e => setStatMode(e.target.value)}>
                    {statModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Legend (optional):
                  <select value={legend} onChange={e => setLegend(e.target.value)}>
                    <option value="">None</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </label>
                <button type="submit" disabled={loading || !xAxis || !yAxis}>
                  {loading ? 'Generating...' : 'Generate Plot'}
                </button>
              </>
            )}
          </form>
          {error && <div className="error-message">{error}</div>}
          {plotUrl && (
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <div className="analytics-plot-modal wc-result-modal wc-calories-modal">
                <div className="wc-modal-heading" style={{fontSize: '1.25rem'}}>Analytics Plot</div>
                <img src={plotUrl} alt="Generated Plot" style={{ maxWidth: '100%', marginTop: 24 }} />
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
