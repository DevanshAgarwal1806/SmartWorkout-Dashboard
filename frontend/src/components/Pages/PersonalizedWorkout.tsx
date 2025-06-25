import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './WeightAndCalories.css';
import type { UserProfile } from '../../Services/profileService';
import {
  fetchPersonalizedWorkouts,
  savePersonalizedWorkout,
  deletePersonalizedWorkout,
} from '../../Services/personalizedWorkoutService';
import type { PersonalizedWorkoutPlan } from '../../Services/personalizedWorkoutService';

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];
const workoutTypes = ['Bodyweight', 'Cardio', 'Strength', 'HIIT', 'Yoga', 'Mixed'];

interface PersonalizedWorkoutProps {
  profile: UserProfile | null;
}

// Optimized Modal component with React.memo
const Modal = React.memo<{ open: boolean; onClose: () => void; children: React.ReactNode }>(({ open, onClose, children }) => {
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
});

const PersonalizedWorkout: React.FC<PersonalizedWorkoutProps> = ({ profile }) => {
  // Step state: 0 = choose, 1 = use profile, 2 = enter new
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState({
    current_weight: '',
    target_weight: '',
    days: '',
    exercise_hours: '',
    gym_access: 'Yes',
    days_per_week: '',
    workout_type: '',
    fitness_level: '',
    injuries: '',
    gender: 'Male',
    age: '',
  });
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  // Personalized workout plans state
  const [plans, setPlans] = useState<PersonalizedWorkoutPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planModal, setPlanModal] = useState<{ open: boolean; plan: PersonalizedWorkoutPlan | null }>({ open: false, plan: null });
  const [saveModal, setSaveModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch all personalized plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const data = await fetchPersonalizedWorkouts();
      setPlans(data);
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setResult('');
    if (!form.current_weight || !form.target_weight || !form.days || !form.exercise_hours || !form.days_per_week || !form.workout_type || !form.fitness_level) {
      setError('Please fill all required fields.');
      return;
    }
    const aim = Math.abs(Number(form.target_weight) - Number(form.current_weight));
    const decision = Number(form.target_weight) < Number(form.current_weight) ? 'Loose Weight' : 'Gain Weight';
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/personalized-workout', {
        decision,
        current_weight: Number(form.current_weight),
        aim,
        days: Number(form.days),
        exercise_hours: Number(form.exercise_hours),
        gym_access: form.gym_access,
        days_per_week: Number(form.days_per_week),
        workout_type: form.workout_type,
        fitness_level: form.fitness_level,
        injuries: form.injuries,
        gender: form.gender,
        age: Number(form.age),
      });
      setResult(res.data.workout_plan || 'No plan generated.');
      setSaveModal(true); // Prompt for name and save
    } catch (err: any) {
      let msg = 'Failed to generate workout plan.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map((e: any) => e.msg).join('; ');
        } else if (typeof err.response.data.detail === 'string') {
          msg = err.response.data.detail;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Save plan to Supabase
  const handleSavePlan = async () => {
    if (!planName.trim()) {
      setSaveError('Please enter a name for your plan.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    try {
      await savePersonalizedWorkout(planName.trim(), result);
      setSaveModal(false);
      setPlanName('');
      setResult('');
      setStep(0); // Redirect to main page to show saved plans
      fetchPlans();
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save plan.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete plan
  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deletePersonalizedWorkout(id);
      fetchPlans();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (step === 1 && profile) {
      setForm(f => ({
        ...f,
        current_weight: profile.weight_kg.toString(),
        gender: profile.gender,
        age: profile.age.toString(),
      }));
    } else if (step === 2) {
      setForm({
        current_weight: '',
        target_weight: '',
        days: '',
        exercise_hours: '',
        gym_access: 'Yes',
        days_per_week: '',
        workout_type: '',
        fitness_level: '',
        injuries: '',
        gender: 'Male',
        age: '',
      });
    }
  }, [step, profile]);

  // Helper: check if profile is complete
  const isProfileComplete = (profile: UserProfile | null) => {
    if (!profile) return false;
    return (
      typeof profile.name === 'string' && profile.name.trim() !== '' &&
      typeof profile.height_cm === 'number' && !isNaN(profile.height_cm) &&
      typeof profile.weight_kg === 'number' && !isNaN(profile.weight_kg) &&
      typeof profile.age === 'number' && !isNaN(profile.age) &&
      typeof profile.gender === 'string' && profile.gender.trim() !== ''
    );
  };

  // Memoized callback functions to prevent unnecessary re-renders
  const handleSaveModalClose = useCallback(() => {
    setSaveModal(false);
    setSaveError('');
  }, []);

  const handlePlanModalClose = useCallback(() => {
    setPlanModal({ open: false, plan: null });
  }, []);

  const handleMainModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handlePlanModalOpen = useCallback((plan: PersonalizedWorkoutPlan) => {
    setPlanModal({ open: true, plan });
  }, []);

  // Show all saved plans
  if (step === 0) {
    return (
      <div className="wc-main-bg">
        <div className="wc-info-box">
          <h2>Personalized Workout Plan</h2>
          <p>Get a daily, AI-powered workout plan tailored to your goals, schedule, and preferences. Enter your details below for a stunning, actionable plan!</p>
        </div>
        <div className="wc-choice-card">
          <h2>Create a new Personalized Workout Plan</h2>
          <button onClick={() => setStep(1)} disabled={!isProfileComplete(profile)}>Use my profile data</button>
          <button onClick={() => setStep(2)}>Enter new data</button>
          {!isProfileComplete(profile) && <div style={{color: 'red', marginTop: 8}}>Profile incomplete. Please fill your profile for best results.</div>}
        </div>
        <div className="wc-card" style={{marginTop: 32, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 16px rgba(30,41,59,0.08)', background: '#fff', borderRadius: 16, padding: '24px 18px'}}>
          <h2 className="wc-section-title" style={{textAlign:'center',marginBottom:18}}>Your Saved Workout Plans</h2>
          {plansLoading ? (
            <div style={{textAlign:'center'}}>Loading...</div>
          ) : plans.length === 0 ? (
            <div style={{color:'#888', margin:'16px 0', textAlign:'center'}}>No personalized plans yet.</div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:16, alignItems:'center'}}>
              {plans.map(plan => (
                <div key={plan.id} className="wc-plan-list-item" style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f7fafc',borderRadius:10,padding:'14px 22px',marginBottom:0, minWidth:320, maxWidth:420, width:'100%', boxShadow:'0 1px 6px rgba(30,41,59,0.04)'}}>
                  <div style={{flex:1, cursor:'pointer'}} onClick={() => handlePlanModalOpen(plan)}>
                    <b style={{fontSize:'1.08rem'}}>{plan.name}</b>
                    <div style={{fontSize:'0.95rem',color:'#555'}}>{new Date(plan.created_at).toLocaleString()}</div>
                  </div>
                  <button style={{marginLeft:12,background:'#e53e3e',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer'}} onClick={()=>handleDeletePlan(plan.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Modal open={planModal.open && !!planModal.plan} onClose={handlePlanModalClose}>
          {planModal.plan && (
            <div className="wc-result-modal wc-calories-modal">
              <div className="wc-modal-heading" style={{fontSize:'1.25rem'}}>{planModal.plan.name}</div>
              <pre style={{whiteSpace:'pre-wrap',fontSize:'1.08rem',background:'none',border:'none',margin:0}}>{planModal.plan.plan}</pre>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div className="wc-main-bg">
      <div className="wc-info-box">
        <h2>Personalized Workout Plan</h2>
        <p>Get a daily, AI-powered workout plan tailored to your goals, schedule, and preferences. Enter your details below for a stunning, actionable plan!</p>
      </div>
      <div className="wc-flex wc-flex-responsive" style={{justifyContent: 'center'}}>
        <div className="wc-card wc-card-predict wc-card-predict-wide">
          <h2 className="wc-section-title">Build Your Plan</h2>
          <form onSubmit={handleSubmit} className="wc-form wc-form-predict wc-form-grid">
            <div className="wc-form-col">
              <label>Current Weight (kg): <input name="current_weight" type="number" min="30" max="250" value={form.current_weight} onChange={handleChange} required readOnly={step === 1} disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''} /></label>
              <label>Target Weight (kg): <input name="target_weight" type="number" min="30" max="250" value={form.target_weight} onChange={handleChange} required /></label>
              <label>Gender:
                <select name="gender" value={form.gender} onChange={handleChange} required disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>
              <label>Age: <input name="age" type="number" min="10" max="100" value={form.age} onChange={handleChange} required readOnly={step === 1} disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''} /></label>
              <label>Target No. of Days: <input name="days" type="number" min="7" max="365" value={form.days} onChange={handleChange} required /></label>
              <label>Time You Can Dedicate Each Day (mins): <input name="exercise_hours" type="number" min="10" max="180" value={form.exercise_hours} onChange={handleChange} required /></label>
              <label>Gym Access:
                <select name="gym_access" value={form.gym_access} onChange={handleChange} required>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>
            </div>
            <div className="wc-form-col">
              <label>Workout Days per Week: <input name="days_per_week" type="number" min="1" max="7" value={form.days_per_week} onChange={handleChange} required /></label>
              <label>Preferred Workout Type:
                <select name="workout_type" value={form.workout_type} onChange={handleChange} required>
                  <option value="">Select</option>
                  {workoutTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>Current Fitness Level:
                <select name="fitness_level" value={form.fitness_level} onChange={handleChange} required>
                  <option value="">Select</option>
                  {fitnessLevels.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
              </label>
              <label>Limitations / Injuries (optional):
                <textarea name="injuries" value={form.injuries} onChange={handleChange} rows={2} placeholder="e.g. knee pain, asthma, etc." style={{resize:'vertical'}} />
              </label>
              <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Plan'}</button>
            </div>
          </form>
          {error && <div className="error-message">{error}</div>}
          
          {/* Save plan modal - Fixed to prevent flickering */}
          <Modal open={saveModal} onClose={handleSaveModalClose}>
            <div className="wc-result-modal wc-calories-modal">
              <div className="wc-modal-heading" style={{fontSize:'1.15rem',marginBottom:10}}>Save Your Workout Plan</div>
              <input
                type="text"
                placeholder="Enter a name for your plan"
                value={planName}
                onChange={e=>setPlanName(e.target.value)}
                style={{width:'100%',padding:'10px',borderRadius:6,border:'1px solid #cbd5e1',marginBottom:10}}
                autoFocus
              />
              <button 
                style={{width:'100%',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'10px',fontWeight:600,marginBottom:8}} 
                onClick={handleSavePlan} 
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Plan'}
              </button>
              {saveError && <div className="error-message">{saveError}</div>}
              <div style={{marginTop:10}}><b>Preview:</b></div>
              <pre style={{whiteSpace:'pre-wrap',fontSize:'1.08rem',background:'none',border:'none',margin:0,maxHeight:200,overflow:'auto'}}>{result}</pre>
            </div>
          </Modal>
          
          {/* View generated plan modal (legacy, not used anymore) */}
          <Modal open={modalOpen && !!result} onClose={handleMainModalClose}>
            <div className="wc-result-modal wc-calories-modal">
              <div className="wc-modal-heading" style={{fontSize: '1.25rem'}}>Your Personalized Workout Plan</div>
              <pre style={{whiteSpace: 'pre-wrap', fontSize: '1.08rem', background: 'none', border: 'none', margin: 0}}>{result}</pre>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedWorkout;