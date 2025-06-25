// src/App.tsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Pages/Dashboard';
import Analytics from './components/Pages/Analytics';
import AICoach from './components/Pages/AICoach';
import WeightAndCalories from './components/Pages/WeightAndCalories';
import PersonalizedWorkout from './components/Pages/PersonalizedWorkout';
import Workouts from './components/Pages/Workouts';
import Login from './components/Pages/Login';
import Profile from './components/Pages/Profile';
import Goals from './components/Pages/Goals';
import Landing from './components/Pages/Landing';
import { supabase } from './supabaseClient';
import { getUserProfile } from './Services/profileService';
import type { UserProfile } from './Services/profileService';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const data = await getUserProfile();
          setProfile(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } finally {
          setInitialLoadComplete(true);
        }
      } else {
        setProfile(null);
        setInitialLoadComplete(true);
      }
    }
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInitialLoadComplete(false); // Reset initial load state
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  if (!initialLoadComplete) {
    return (
      <Layout>
        <div className="welcome-user-bar">
          <span className="welcome-user">
            <span className="welcome-user-icon">
              <svg width="22" height="22" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
            </span>
            Welcome, <span className="welcome-user-name">{profile && profile.name ? profile.name : user.email}</span>!
          </span>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="logout-btn-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="logout-btn-text">Logout</span>
          </button>
        </div>
        <div className="app-page-container">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="welcome-user-bar">
        <span className="welcome-user">
          <span className="welcome-user-icon">
            <svg width="22" height="22" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
          </span>
          Welcome, <span className="welcome-user-name">{profile && profile.name ? profile.name : user.email}</span>!
        </span>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="logout-btn-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span className="logout-btn-text">Logout</span>
        </button>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard profile={profile} />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AICoach />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/weight-calories" element={<WeightAndCalories profile={profile} />} />
        <Route path="/personalized-workout" element={<PersonalizedWorkout profile={profile} />} />
        <Route path="*" element={<Dashboard profile={profile} />} />
      </Routes>
    </Layout>
  );
}

export default App;