import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Target, 
  TrendingUp,
  Clock,
  Flame,
  Award,
  Plus
} from 'lucide-react';
import { workoutApi, healthApi } from '../../Services/api';
import { fetchWorkouts } from '../../Services/workoutService';
import type { WorkoutEntry } from '../../types';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../../Services/profileService';

const Dashboard: React.FC<{ profile?: UserProfile | null }> = ({ profile }) => {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<string>('checking...');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate streak from workouts
  useEffect(() => {
    if (workouts.length === 0) {
      setStreak(0);
      return;
    }
    // Get unique workout dates (YYYY-MM-DD), sorted descending
    const dates = Array.from(new Set(workouts.map(w => w.date.split('T')[0]))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streakCount = 0;
    let current = new Date();
    for (let i = 0; i < dates.length; i++) {
      const workoutDate = new Date(dates[i]);
      // If the workout date matches the current date, increment streak
      if (
        workoutDate.getFullYear() === current.getFullYear() &&
        workoutDate.getMonth() === current.getMonth() &&
        workoutDate.getDate() === current.getDate()
      ) {
        streakCount++;
        // Move to previous day
        current.setDate(current.getDate() - 1);
      } else {
        // If the workout date is not the expected previous day, break
        break;
      }
    }
    setStreak(streakCount);
  }, [workouts]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Check API health
      try {
        const health = await healthApi.checkHealth();
        setApiHealth(health.status);
      } catch (error) {
        setApiHealth('offline');
      }

      // Fetch recent workouts from Supabase
      const workoutsData = await fetchWorkouts(5);
      setWorkouts(workoutsData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats from workouts
  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

  const statsCards = [
    {
      title: 'Current Streak',
      value: `${streak} days`,
      icon: Award,
      color: 'dashboard-stat-orange',
      bgColor: 'dashboard-stat-bg-orange'
    },
    {
      title: 'Total Workouts',
      value: totalWorkouts.toString(),
      icon: Activity,
      color: 'dashboard-stat-blue',
      bgColor: 'dashboard-stat-bg-blue'
    },
    {
      title: 'Calories Burned',
      value: totalCalories.toString(),
      icon: Flame,
      color: 'dashboard-stat-red',
      bgColor: 'dashboard-stat-bg-red'
    },
    {
      title: 'Total Duration',
      value: `${Math.round(totalDuration / 60)}h`,
      icon: Clock,
      color: 'dashboard-stat-green',
      bgColor: 'dashboard-stat-bg-green'
    }
  ];

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="dashboard-loading-title"></div>
          <div className="dashboard-loading-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="dashboard-loading-card"></div>
            ))}
          </div>
          <div className="dashboard-loading-content"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Profile completion message */}
      {profile && (typeof profile.name !== 'string' || profile.name.trim() === '' ||
        typeof profile.height_cm !== 'number' || isNaN(profile.height_cm) ||
        typeof profile.weight_kg !== 'number' || isNaN(profile.weight_kg) ||
        typeof profile.age !== 'number' || isNaN(profile.age) ||
        typeof profile.gender !== 'string' || profile.gender.trim() === '') && (
        <div className="dashboard-profile-warning">
          <b>Tip:</b> Fill your profile for a more personalized experience! <a href="/profile">Go to Profile</a>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back! Here's your fitness overview.
          </p>
        </div>
        <div className="dashboard-header-actions">
          <div className={`dashboard-api-status ${
            apiHealth === 'healthy' 
              ? 'dashboard-api-status-healthy' 
              : 'dashboard-api-status-offline'
          }`}>
            API: {apiHealth}
          </div>
          <button className="dashboard-quick-log-btn" onClick={() => navigate('/workouts')}>
            <Plus className="dashboard-btn-icon" />
            Quick Log
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats-grid">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`dashboard-stat-card ${stat.bgColor}`}>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-text">
                  <p className="dashboard-stat-title">{stat.title}</p>
                  <p className="dashboard-stat-value">{stat.value}</p>
                </div>
                <div className={`dashboard-stat-icon ${stat.color}`}>
                  <Icon className="dashboard-icon" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-activity-grid">
        {/* Recent Workouts */}
        <div className="dashboard-section-card">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent Workouts</h2>
            <button className="dashboard-view-all-btn" onClick={() => navigate('/workouts')}>
              View All
            </button>
          </div>
          
          {workouts.length === 0 ? (
            <div className="dashboard-empty-state">
              <Activity className="dashboard-empty-icon" />
              <p className="dashboard-empty-title">No workouts yet</p>
              <p className="dashboard-empty-subtitle">Start your fitness journey!</p>
            </div>
          ) : (
            <div className="dashboard-workout-list">
              {workouts.map((workout, index) => (
                <div key={index} className="dashboard-workout-item">
                  <div className="dashboard-workout-content">
                    <div className="dashboard-workout-icon">
                      <Activity className="dashboard-workout-icon-svg" />
                    </div>
                    <div className="dashboard-workout-details">
                      <p className="dashboard-workout-date">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                      <p className="dashboard-workout-stats">
                        {workout.duration} min • {workout.calories} cal
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="dashboard-workout-trend" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section-card">
          <h2 className="dashboard-section-title dashboard-actions-title">Quick Actions</h2>
          
          <div className="dashboard-actions-list">
            <button className="dashboard-action-btn dashboard-action-blue" onClick={() => navigate('/workouts')}>
              <div className="dashboard-action-content">
                <Plus className="dashboard-action-icon" />
                <div className="dashboard-action-text">
                  <p className="dashboard-action-title">Log New Workout</p>
                  <p className="dashboard-action-subtitle">Track your exercise session</p>
                </div>
              </div>
            </button>
            <button className="dashboard-action-btn dashboard-action-green" onClick={() => navigate('/profile')}>
              <div className="dashboard-action-content">
                <Target className="dashboard-action-icon" />
                <div className="dashboard-action-text">
                  <p className="dashboard-action-title">Set Goals</p>
                  <p className="dashboard-action-subtitle">Plan your fitness targets</p>
                </div>
              </div>
            </button>
            <button className="dashboard-action-btn dashboard-action-purple" onClick={() => navigate('/analytics')}>
              <div className="dashboard-action-content">
                <Calendar className="dashboard-action-icon" />
                <div className="dashboard-action-text">
                  <p className="dashboard-action-title">View Analytics</p>
                  <p className="dashboard-action-subtitle">Analyze your progress</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;