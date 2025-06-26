import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DietPlan.css';
import type { UserProfile } from '../../Services/profileService';
import { saveDietPlan, fetchDietPlans, deleteDietPlan, type DietPlanEntry } from '../../Services/dietPlanService';

const initialForm = {
  name: '',
  age: '',
  gender: 'M',
  height_cm: '',
  weight_kg: '',
  goal_type: 'Weight Loss',
  target_weight: '',
  timeline_weeks: '',
  allergies: '',
  medical_conditions: '',
  diet_type: '',
  restrictions: '',
  meal_frequency: 3,
  disliked_foods: '',
  preferred_cuisines: '',
};

const goalTypes = [
  { value: 'Weight Loss', label: 'Weight Loss' },
  { value: 'Muscle Gain', label: 'Muscle Gain' },
  { value: 'Maintenance', label: 'Maintenance' },
];

const genderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <div className="pw-modal-blur"><div className="pw-modal-blur-effect" /></div>
      <div className="pw-modal-overlay" onClick={onClose}>
        <div className="pw-modal-content" onClick={e => e.stopPropagation()}>
          <button className="pw-modal-close" onClick={onClose}>&times;</button>
          {children}
        </div>
      </div>
    </>
  );
};

interface DietPlanProps {
  profile: UserProfile | null;
}

const DietPlan: React.FC<DietPlanProps> = ({ profile }) => {
  // Step state: 0 = choose, 1 = use profile, 2 = enter new
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Add state for saved diet plans
  const [dietPlans, setDietPlans] = useState<DietPlanEntry[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [saveModal, setSaveModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Add state for selected plan name
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (step === 1 && profile) {
      setForm({
        name: profile.name || '',
        age: profile.age !== undefined && profile.age !== null ? profile.age.toString() : '',
        gender: profile.gender === 'Male' ? 'M' : profile.gender === 'Female' ? 'F' : (profile.gender || ''),
        height_cm: profile.height_cm !== undefined && profile.height_cm !== null ? profile.height_cm.toString() : '',
        weight_kg: profile.weight_kg !== undefined && profile.weight_kg !== null ? profile.weight_kg.toString() : '',
        goal_type: 'Weight Loss',
        target_weight: '',
        timeline_weeks: '',
        allergies: profile.allergies || '',
        medical_conditions: profile.medical_conditions || '',
        diet_type: '',
        restrictions: '',
        meal_frequency: 3,
        disliked_foods: '',
        preferred_cuisines: '',
      });
      setResult(null);
      setSelectedPlanName(null);
    } else if (step === 2) {
      setForm(initialForm);
      setResult(null);
      setSelectedPlanName(null);
    }
  }, [step, profile]);

  // Fetch all diet plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const data = await fetchDietPlans();
      setDietPlans(data);
    } catch {
      setDietPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/generate-diet-plan', {
        ...form,
        age: Number(form.age),
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        target_weight: form.target_weight ? Number(form.target_weight) : undefined,
        timeline_weeks: Number(form.timeline_weeks),
        meal_frequency: Number(form.meal_frequency),
      });
      setResult(res.data);
      setModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate diet plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      setSaveError('Please enter a name for your plan.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    try {
      await saveDietPlan(planName.trim(), result.diet_plan);
      setSaveModal(false);
      setPlanName('');
      setResult(null);
      setStep(0); // Redirect to main page to show saved plans
      fetchPlans();
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save plan.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deleteDietPlan(id);
      fetchPlans();
    } catch {
      // ignore
    }
  };

  // Step 0: Ask user for choice
  if (step === 0) {
    const hasProfileData = (profile: UserProfile | null) => {
      if (!profile) return false;
      // Check if at least one field is present
      return (
        (typeof profile.name === 'string' && profile.name.trim() !== '') ||
        (typeof profile.height_cm === 'number' && !isNaN(profile.height_cm)) ||
        (typeof profile.weight_kg === 'number' && !isNaN(profile.weight_kg)) ||
        (typeof profile.age === 'number' && !isNaN(profile.age)) ||
        (typeof profile.gender === 'string' && profile.gender.trim() !== '')
      );
    };
    return (
      <div className="pw-container">
        <div className="pw-title">AI-Powered Diet Plan Generator</div>
        <div className="wc-choice-card">
          <h2>How would you like to proceed?</h2>
          <button onClick={() => setStep(1)} disabled={!hasProfileData(profile)}>Use my profile data</button>
          <button onClick={() => setStep(2)}>Enter new data</button>
          {!hasProfileData(profile) && <div style={{color: 'red', marginTop: 8}}>No profile data found. Please fill your profile for best results.</div>}
        </div>
        <div className="pw-section" style={{marginTop: 32, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto'}}>
          <h2 className="pw-section-title" style={{textAlign:'center',marginBottom:18}}>Your Saved Diet Plans</h2>
          {plansLoading ? (
            <div style={{textAlign:'center'}}>Loading...</div>
          ) : dietPlans.length === 0 ? (
            <div style={{color:'#888', margin:'16px 0', textAlign:'center'}}>No diet plans yet.</div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:16, alignItems:'center'}}>
              {dietPlans.map(plan => (
                <div key={plan.id} className="pw-plan-card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',minWidth:320, maxWidth:420, width:'100%'}}>
                  <div style={{flex:1, cursor:'pointer'}} onClick={() => { setResult({diet_plan: plan.plan}); setSelectedPlanName(plan.name); setModalOpen(true); }}>
                    <b className="pw-plan-title">{plan.name}</b>
                    <div style={{fontSize:12, color:'#aaa'}}>{new Date(plan.created_at).toLocaleString()}</div>
                  </div>
                  <button className="pw-plan-delete" onClick={() => handleDeletePlan(plan.id)} title="Delete">🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Always render the modal at the root so it can open from anywhere */}
        <Modal open={modalOpen && !!result?.diet_plan} onClose={() => { setModalOpen(false); setSelectedPlanName(null); }}>
          {result && result.diet_plan && (
            <div className="pw-section" style={{marginTop: 0, minWidth: 320, maxWidth: '90vw'}}>
              <div className="pw-section-title">{selectedPlanName ? selectedPlanName : 'Your Personalized Diet Plan'}</div>
              {!dietPlans.some(p => p.plan === result.diet_plan) && (
                <div style={{marginBottom: 16}}>
                  <input className="pw-form-input" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Enter a name for your plan" />
                  <button className="pw-form-btn" onClick={handleSavePlan} disabled={saveLoading || !planName.trim()}>{saveLoading ? 'Saving...' : 'Save Plan'}</button>
                  {saveError && <div className="pw-error-message">{saveError}</div>}
                </div>
              )}
              <pre className="pw-plan-preview" style={{maxHeight: 400, overflowY: 'auto'}}>{result.diet_plan}</pre>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div className="pw-container">
      <div className="pw-title">AI-Powered Diet Plan Generator</div>
      <form className="pw-form" onSubmit={handleSubmit}>
        <div className="pw-form-cols">
          <div className="pw-form-col">
            <label>Name
              <input className="pw-form-input" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>Age
              <input className="pw-form-input" name="age" type="number" min="10" max="100" value={form.age} onChange={handleChange} required />
            </label>
            <label>Gender
              <select className="pw-form-input" name="gender" value={form.gender} onChange={handleChange} required>
                {genderOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <label>Height (cm)
              <input className="pw-form-input" name="height_cm" type="number" min="100" max="250" value={form.height_cm} onChange={handleChange} required />
            </label>
            <label>Weight (kg)
              <input className="pw-form-input" name="weight_kg" type="number" min="30" max="250" value={form.weight_kg} onChange={handleChange} required />
            </label>
            <label>Goal
              <select className="pw-form-input" name="goal_type" value={form.goal_type} onChange={handleChange} required>
                {goalTypes.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <label>Target Weight (kg)
              <input className="pw-form-input" name="target_weight" type="number" min="30" max="250" value={form.target_weight} onChange={handleChange} />
            </label>
            <label>Timeline (weeks)
              <input className="pw-form-input" name="timeline_weeks" type="number" min="1" max="52" value={form.timeline_weeks} onChange={handleChange} required />
            </label>
          </div>
          <div className="pw-form-col">
            <label>Allergies
              <input className="pw-form-input" name="allergies" value={form.allergies} onChange={handleChange} />
            </label>
            <label>Medical Conditions
              <input className="pw-form-input" name="medical_conditions" value={form.medical_conditions} onChange={handleChange} />
            </label>
            <label>Diet Type
              <input className="pw-form-input" name="diet_type" value={form.diet_type} onChange={handleChange} placeholder="e.g. Vegan, Keto" />
            </label>
            <label>Restrictions
              <input className="pw-form-input" name="restrictions" value={form.restrictions} onChange={handleChange} placeholder="e.g. Halal, Kosher" />
            </label>
            <label>Meal Frequency
              <input className="pw-form-input" name="meal_frequency" type="number" min="1" max="8" value={form.meal_frequency} onChange={handleChange} required />
            </label>
            <label>Disliked Foods
              <input className="pw-form-input" name="disliked_foods" value={form.disliked_foods} onChange={handleChange} />
            </label>
            <label>Preferred Cuisines
              <input className="pw-form-input" name="preferred_cuisines" value={form.preferred_cuisines} onChange={handleChange} />
            </label>
          </div>
        </div>
        <button className="pw-form-btn" type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Diet Plan'}</button>
        {error && <div className="pw-error-message">{error}</div>}
      </form>
      {/* The modal is now always rendered at the root level */}
      <Modal open={modalOpen && !!result?.diet_plan} onClose={() => { setModalOpen(false); setSelectedPlanName(null); }}>
        {result && result.diet_plan && (
          <div className="pw-section" style={{marginTop: 0, minWidth: 320, maxWidth: '90vw'}}>
            <div className="pw-section-title">{selectedPlanName ? selectedPlanName : 'Your Personalized Diet Plan'}</div>
            {!dietPlans.some(p => p.plan === result.diet_plan) && (
              <div style={{marginBottom: 16}}>
                <input className="pw-form-input" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Enter a name for your plan" />
                <button className="pw-form-btn" onClick={handleSavePlan} disabled={saveLoading || !planName.trim()}>{saveLoading ? 'Saving...' : 'Save Plan'}</button>
                {saveError && <div className="pw-error-message">{saveError}</div>}
              </div>
            )}
            <pre className="pw-plan-preview" style={{maxHeight: 400, overflowY: 'auto'}}>{result.diet_plan}</pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DietPlan;
