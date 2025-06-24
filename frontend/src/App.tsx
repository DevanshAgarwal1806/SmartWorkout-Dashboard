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
import { supabase } from './supabaseClient';
import { getUserProfile } from './Services/profileService';
import type { UserProfile } from './Services/profileService';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
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
        setProfileLoading(true);
        try {
          const data = await getUserProfile();
          setProfile(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } finally {
          setProfileLoading(false);
          setInitialLoadComplete(true);
        }
      } else {
        setProfile(null);
        setProfileLoading(false);
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
    return <Login onLogin={setUser} />;
  }

  if (!initialLoadComplete) {
    return (
      <Layout>
        <div className="welcome-user-bar">
          <span className="welcome-user">Welcome, {user.email}!</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
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
        <span className="welcome-user">Welcome, {profile && profile.name ? profile.name : user.email}!</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
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