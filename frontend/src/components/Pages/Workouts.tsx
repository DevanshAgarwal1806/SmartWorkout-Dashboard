import React, { useState, useEffect } from 'react';
import { Activity, Plus } from 'lucide-react';
import { fetchWorkouts, deleteWorkout } from '../../Services/workoutService';
import type { WorkoutEntry } from '../../types';
import './Workouts.css';
import WorkoutsModal from './WorkoutsModal';

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkoutsList();
  }, []);

  const fetchWorkoutsList = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkouts(100);
      // Sort by date descending (latest first)
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setWorkouts(data);
    } catch (e) {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    try {
      await deleteWorkout(id);
      fetchWorkoutsList();
    } catch (e) {
      alert('Failed to delete workout.');
    }
  };

  return (
    <div className="workouts-container">
      <div className="workouts-header">
        <h1 className="workouts-title">All Workouts</h1>
        <button className="workouts-log-btn" onClick={() => setModalOpen(true)}>
          <Plus className="workouts-btn-icon" /> Log Workout
        </button>
      </div>
      {/* Workout list */}
      {loading ? (
        <div className="workouts-loading">Loading...</div>
      ) : workouts.length === 0 ? (
        <div className="workouts-empty">
          <Activity className="workouts-empty-icon" />
          <p>No workouts found.</p>
        </div>
      ) : (
        <div className="workouts-list">
          {workouts.map((w) => (
            <div key={w.id} className="workouts-item">
              <div className="workouts-item-date">{new Date(w.date).toLocaleDateString()}</div>
              <div className="workouts-item-type">{w.type || <span className="workouts-item-type-missing">No type</span>}</div>
              <div className="workouts-item-duration">{w.duration} min</div>
              <div className="workouts-item-calories">{w.calories ?? '-'} cal</div>
              <button className="workouts-delete-btn" title="Delete workout" onClick={() => handleDelete(w.id)}>
                <span role="img" aria-label="delete">🗑️</span>
              </button>
            </div>
          ))}
        </div>
      )}
      <WorkoutsModal open={modalOpen} onClose={() => setModalOpen(false)} onLogged={fetchWorkoutsList} />
    </div>
  );
};

export default Workouts;
