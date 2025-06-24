import React, { useEffect, useState } from 'react';
import { getGoals, addGoal, deleteGoal, completeGoal } from '../../Services/goalsService';
import type { Goal } from '../../types';
import './Goals.css';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const todayDate = new Date().toISOString().slice(0, 10);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (e: any) {
      setError('Failed to fetch goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setLoading(true);
    setError('');
    try {
      await addGoal({ goal: newGoal, target_date: todayDate });
      setNewGoal('');
      fetchGoals();
    } catch (e: any) {
      setError('Failed to add goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      await deleteGoal(id);
      fetchGoals();
    } catch (e: any) {
      setError('Failed to delete goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoal = async (id: string, completed: boolean) => {
    setLoading(true);
    setError('');
    try {
      await completeGoal(id, !completed);
      fetchGoals();
    } catch (e: any) {
      setError('Failed to update goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goals-page app-page-container">
      <h1 className="app-page-title">Set Goals</h1>
      <form className="goals-form" onSubmit={handleAddGoal}>
        <input
          type="text"
          placeholder="Enter your goal (e.g. Run 5km, Lose 2kg)"
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
          className="goals-input"
          required
        />
        <button type="submit" className="goals-add-btn" disabled={loading}>
          Add Goal
        </button>
      </form>
      {error && <div className="goals-error">{error}</div>}
      <div className="goals-list-container">
        {loading ? (
          <div>Loading...</div>
        ) : goals.length === 0 ? (
          <div className="goals-empty">No goals set yet.</div>
        ) : (
          <ul className="goals-list">
            {goals.sort((a, b) => a.target_date.localeCompare(b.target_date)).map(goal => (
              <li key={goal.id} className={`goals-list-item${goal.completed ? ' completed' : ''}`}>
                <div className="goals-list-main">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => handleCompleteGoal(goal.id, goal.completed)}
                  />
                  <span className="goals-list-goal">{goal.goal}</span>
                  <span className="goals-list-date">{goal.target_date}</span>
                </div>
                <button
                  className="goals-delete-btn"
                  onClick={() => handleDeleteGoal(goal.id)}
                  disabled={loading}
                  title="Delete goal"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Goals;
