import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './Login.css';

const Login: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else if (data.user && !data.user.confirmed_at) {
      setAwaitingConfirm(true);
      setInfo('Please confirm your email before logging in.');
    } else onLogin(data.user);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setAwaitingConfirm(true);
      setInfo('Signup successful! Please check your email to confirm your account before logging in.');
    }
  };

  return (
    <div className="login-modal-bg">
      <div className="login-modal">
        <h2>Login or Sign Up</h2>
        {info && <div className="login-info">{info}</div>}
        <form>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={awaitingConfirm}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={awaitingConfirm}
          />
          {error && <div className="login-error">{error}</div>}
          <button onClick={handleLogin} disabled={loading || awaitingConfirm} type="submit">Login</button>
          <button onClick={handleSignup} disabled={loading || awaitingConfirm} type="button">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
