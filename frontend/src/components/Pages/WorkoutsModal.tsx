import React, { useState } from 'react';
import './WorkoutsModal.css';
import { logWorkout } from '../../Services/workoutService';

interface Props {
  open: boolean;
  onClose: () => void;
  onLogged: () => void;
}

const WorkoutsModal: React.FC<Props> = ({ open, onClose, onLogged }) => {
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!date || !type || !duration) {
      setError('Please fill all required fields.');
      return;
    }
    if (date > todayStr) {
      setError('You cannot log a workout for a future date.');
      return;
    }
    setLoading(true);
    try {
      await logWorkout({ date, type, duration: Number(duration), calories: calories ? Number(calories) : undefined, notes });
      setSuccess(true);
      setDate(''); setType(''); setDuration(''); setCalories(''); setNotes('');
      onLogged();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (e: any) {
      setError(e.message || 'Failed to log workout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workout-modal-bg">
      <div className="workout-modal">
        <h2>Log Workout</h2>
        <form onSubmit={handleSubmit}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required max={todayStr} />
          <input type="text" placeholder="Workout Type (e.g. Cardio, Strength)" value={type} onChange={e => setType(e.target.value)} required />
          <input type="number" placeholder="Duration (minutes)" value={duration} onChange={e => setDuration(e.target.value)} required min={1} />
          <input type="number" placeholder="Calories (optional)" value={calories} onChange={e => setCalories(e.target.value)} min={0} />
          <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
          {error && <div className="workout-modal-error">{error}</div>}
          {success && <div className="workout-modal-success">Workout logged!</div>}
          <div className="workout-modal-actions">
            <button type="submit" disabled={loading}>{loading ? 'Logging...' : 'Log Workout'}</button>
            <button type="button" onClick={onClose} className="workout-modal-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutsModal;
