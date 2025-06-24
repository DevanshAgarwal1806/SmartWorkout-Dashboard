import React, { useState, useEffect } from 'react';
import './Profile.css';
import { getUserProfile, upsertUserProfile} from '../../Services/profileService';
// import type { UserProfile } from '../../types';
// TODO: Replace the below import with the correct path where UserProfile is defined
import type { UserProfile } from '../../Services/profileService';
const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', height_cm: '', weight_kg: '', age: '', gender: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // If profile is missing or incomplete, always force edit mode
    if (!profile && !loading) {
      setEditMode(true);
    }
    // Optionally, you can add more checks for incomplete fields here
  }, [profile, loading]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserProfile();
      setProfile(data);
      if (data) {
        setForm({
          name: data.name,
          height_cm: data.height_cm.toString(),
          weight_kg: data.weight_kg.toString(),
          age: data.age.toString(),
          gender: data.gender
        });
      }
    } catch (e: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.height_cm || !form.weight_kg || !form.age || !form.gender) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      await upsertUserProfile({
        name: form.name,
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        age: Number(form.age),
        gender: form.gender
      });
      setSuccess('Profile saved!');
      setEditMode(false);
      loadProfile();
    } catch (e: any) {
      setError(e.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="profile-container"><div className="profile-loading">Loading...</div></div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>
      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}
      {editMode || !profile ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="height_cm" type="number" placeholder="Height (cm)" value={form.height_cm} onChange={handleChange} required min={1} />
          <input name="weight_kg" type="number" placeholder="Weight (kg)" value={form.weight_kg} onChange={handleChange} required min={1} />
          <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required min={1} />
          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit">Save</button>
          {profile && <button type="button" className="profile-cancel" onClick={() => setEditMode(false)}>Cancel</button>}
        </form>
      ) : (
        <div className="profile-info-card">
          <div><b>Name:</b> {profile.name}</div>
          <div><b>Height:</b> {profile.height_cm} cm</div>
          <div><b>Weight:</b> {profile.weight_kg} kg</div>
          <div><b>Age:</b> {profile.age}</div>
          <div><b>Gender:</b> {profile.gender}</div>
          <button className="profile-edit-btn" onClick={() => setEditMode(true)}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
