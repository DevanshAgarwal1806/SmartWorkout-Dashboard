import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeightAndCalories.css';
import type { UserProfile } from '../../Services/profileService';

// Modal component
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
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
};

const activityLevels = [
  'Sedentary',
  'Lightly active',
  'Moderately active',
  'Very active',
  'Super active',
];
const goalTypes = [
  { value: 'lose', label: 'Lose Weight' },
];
const exerciseTypes = [
  'Jogging',
  'Cycling',
  'Weight Lifting',
  'Swimming',
];
const intensities = ['Light Effort', 'Moderate Effort', 'Vigorous Effort'];
const swimmingStyles = [
  'Leisurely swimming',
  'Backstroke',
  'Breaststroke',
  'Freestyle (slow)',
  'Freestyle (moderate)',
  'Freestyle (fast)',
  'Butterfly',
  'Treading water (moderate)',
  'Treading water (vigorous)',
];

// Info box for calculators
const InfoBox: React.FC = () => (
  <div className="wc-info-box">
    <h2>Smart Fitness Calculators</h2>
    <p>
      Use these calculators to estimate your future weight and calories burned during exercise. The predictions are based on your personal data and activity level, helping you set realistic goals and track your progress. For best results, be as accurate as possible with your inputs!
    </p>
  </div>
);

interface WeightAndCaloriesProps {
  profile: UserProfile | null;
}

const WeightAndCalories: React.FC<WeightAndCaloriesProps> = ({ profile }) => {
  // Step state: 0 = choose, 1 = use profile, 2 = enter new
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Weight Prediction State
  const [wpForm, setWpForm] = useState({
    age: '', height_cm: '', weight_kg: '', activity_level: '', gender: 'Male', goal_type: 'lose'
  });
  const [wpResult, setWpResult] = useState<any>(null);
  const [wpLoading, setWpLoading] = useState(false);
  const [wpError, setWpError] = useState('');

  // Calories Calculator State
  const [ccForm, setCcForm] = useState({
    gender: 'Male', weight_kg: '', age: '', duration_mins: '', exercise_type: 'Jogging', intensity: '', heart_rate: '', swimming_style: ''
  });
  const [ccResult, setCcResult] = useState<any>(null);
  const [ccLoading, setCcLoading] = useState(false);
  const [ccError, setCcError] = useState('');

  // Modal state
  const [wpModalOpen, setWpModalOpen] = useState(false);
  const [ccModalOpen, setCcModalOpen] = useState(false);

  useEffect(() => {
    if (step === 1 && profile) {
      setWpForm({
        age: profile.age.toString(),
        height_cm: profile.height_cm.toString(),
        weight_kg: profile.weight_kg.toString(),
        gender: profile.gender,
        activity_level: '',
        goal_type: 'lose',
      });
      setCcForm({
        gender: profile.gender,
        weight_kg: profile.weight_kg.toString(),
        age: profile.age.toString(),
        duration_mins: '',
        exercise_type: 'Jogging',
        intensity: '',
        heart_rate: '',
        swimming_style: ''
      });
    } else if (step === 2) {
      setWpForm({
        age: '', height_cm: '', weight_kg: '', activity_level: '', gender: 'Male', goal_type: 'lose'
      });
      setCcForm({
        gender: 'Male', weight_kg: '', age: '', duration_mins: '', exercise_type: 'Jogging', intensity: '', heart_rate: '', swimming_style: ''
      });
    }
  }, [step, profile]);

  // Handlers for Weight Prediction
  const handleWpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWpForm({ ...wpForm, [e.target.name]: e.target.value });
  };
  const handleWpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWpError(''); setWpResult(null);
    try {
      setWpLoading(true);
      const res = await axios.post('http://localhost:8000/api/predict-weight', {
        ...wpForm,
        age: Number(wpForm.age),
        height_cm: Number(wpForm.height_cm),
        weight_kg: Number(wpForm.weight_kg),
      });
      setWpResult(res.data);
      setWpModalOpen(true);
    } catch (err: any) {
      setWpError(err.response?.data?.detail || 'Failed to predict weight.');
    } finally {
      setWpLoading(false);
    }
  };

  // Handlers for Calories Calculator
  const handleCcChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCcForm({ ...ccForm, [e.target.name]: e.target.value });
  };
  const handleCcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCcError(''); setCcResult(null);
    try {
      setCcLoading(true);
      const res = await axios.post('http://localhost:8000/api/calculate-calories', {
        ...ccForm,
        weight_kg: Number(ccForm.weight_kg),
        age: Number(ccForm.age),
        duration_mins: Number(ccForm.duration_mins),
        heart_rate: ccForm.heart_rate ? Number(ccForm.heart_rate) : undefined,
      });
      setCcResult(res.data);
      setCcModalOpen(true);
    } catch (err: any) {
      setCcError(err.response?.data?.detail || 'Failed to calculate calories.');
    } finally {
      setCcLoading(false);
    }
  };

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

  // Step 0: Ask user for choice
  if (step === 0) {
    return (
      <div className="wc-main-bg">
        <InfoBox />
        <div className="wc-choice-card">
          <h2>How would you like to proceed?</h2>
          <button onClick={() => setStep(1)} disabled={!isProfileComplete(profile)}>Use my profile data</button>
          <button onClick={() => setStep(2)}>Enter new data</button>
          {!isProfileComplete(profile) && <div style={{color: 'red', marginTop: 8}}>Profile incomplete. Please fill your profile for best results.</div>}
        </div>
      </div>
    );
  }

  // Remove extra container and improve layout
  return (
    <div className="wc-main-bg">
      <InfoBox />
      <div className="wc-flex wc-flex-responsive">
        <div className="wc-card wc-card-predict">
          <h2 className="wc-section-title">Weight Prediction</h2>
          <form onSubmit={handleWpSubmit} className="wc-form wc-form-predict wc-form-prefill">
            <label>Age: <input name="age" type="number" min="10" max="100" value={wpForm.age} onChange={handleWpChange} required readOnly={step === 1} disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''} /></label>
            <label>Height (cm): <input name="height_cm" type="number" min="100" max="250" value={wpForm.height_cm} onChange={handleWpChange} required readOnly={step === 1} disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''} /></label>
            <label>Weight (kg): <input name="weight_kg" type="number" min="30" max="250" value={wpForm.weight_kg} onChange={handleWpChange} required readOnly={step === 1} disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''} /></label>
            <label>Gender:
              <select name="gender" value={wpForm.gender} onChange={handleWpChange} required disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label>Activity Level:
              <select name="activity_level" value={wpForm.activity_level} onChange={handleWpChange} required>
                <option value="">Select</option>
                {activityLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </label>
            <label>Goal:
              <select name="goal_type" value={wpForm.goal_type} onChange={handleWpChange} required>
                {goalTypes.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <button type="submit" disabled={wpLoading}>{wpLoading ? 'Predicting...' : 'Predict Weight'}</button>
          </form>
          {wpError && <div className="error-message">{wpError}</div>}
          <Modal open={wpModalOpen && !!wpResult} onClose={() => setWpModalOpen(false)}>
            {wpResult && (
              <div className="wc-result-modal wc-predict-modal wc-calories-modal">
                <div className="wc-predict-weights wc-calories-burnt" style={{flexDirection: 'column', alignItems: 'center', marginBottom: 0}}>
                  <div style={{fontSize: '2.1rem', fontWeight: 700, color: '#3182ce', marginBottom: 8}}>Predicted Weight</div>
                  <div className="wc-predict-value-box"><span>1 Month:</span> <b>{wpResult.predictions["1_month"]} kg</b></div>
                  <div className="wc-predict-value-box"><span>2 Months:</span> <b>{wpResult.predictions["2_months"]} kg</b></div>
                  <div className="wc-predict-value-box"><span>6 Months:</span> <b>{wpResult.predictions["6_months"]} kg</b></div>
                </div>
                <div className="wc-weekly-heading" style={{marginTop: 18}}>RECOMMENDED MACROS (PER DAY)</div>
                <div className="wc-predict-macros-box">
                  <ul>
                    <li className="wc-predict-value-box">Protein: <span>{wpResult.macros.protein} g</span></li>
                    <li className="wc-predict-value-box">Fat: <span>{wpResult.macros.fat} g</span></li>
                    <li className="wc-predict-value-box">Carbs: <span>{wpResult.macros.carbs} g</span></li>
                  </ul>
                </div>
                <div className="wc-predict-value-box">Daily Calories: <b>{wpResult.daily_calories} kcal</b></div>
                <div className="wc-predict-value-box">TDEE: <b>{wpResult.tdee} kcal</b></div>
              </div>
            )}
          </Modal>
        </div>
        <div className="wc-card wc-card-calories">
          <h2 className="wc-section-title">Calories Calculator</h2>
          <form onSubmit={handleCcSubmit} className="wc-form wc-form-prefill">
            <label>Gender:
              <select name="gender" value={ccForm.gender} onChange={handleCcChange} required disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label>Weight (kg): <input name="weight_kg" type="number" min="30" max="250" value={ccForm.weight_kg} onChange={handleCcChange} required readOnly={step === 1} disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''} /></label>
            <label>Age: <input name="age" type="number" min="10" max="100" value={ccForm.age} onChange={handleCcChange} required readOnly={step === 1} disabled={step === 1} className={step === 1 ? 'wc-prefill-input' : ''} /></label>
            <label>Duration (mins): <input name="duration_mins" type="number" min="5" max="300" value={ccForm.duration_mins} onChange={handleCcChange} required /></label>
            <label>Exercise Type:
              <select name="exercise_type" value={ccForm.exercise_type} onChange={handleCcChange} required>
                {exerciseTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            {ccForm.exercise_type === 'Weight Lifting' && (
              <label>Intensity:
                <select name="intensity" value={ccForm.intensity} onChange={handleCcChange} required>
                  <option value="">Select</option>
                  {intensities.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>
            )}
            {ccForm.exercise_type === 'Swimming' && (
              <label>Swimming Style:
                <select name="swimming_style" value={ccForm.swimming_style} onChange={handleCcChange} required>
                  <option value="">Select</option>
                  {swimmingStyles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}
            {(ccForm.exercise_type === 'Jogging' || ccForm.exercise_type === 'Cycling') && (
              <div>
                <div className="wc-hr-info">Do you know your average heart rate during the exercise? <span style={{ color: '#3182ce' }}>This will make the result more accurate.</span></div>
                <label>Heart Rate (bpm): <input name="heart_rate" type="number" min="60" max="220" value={ccForm.heart_rate} onChange={handleCcChange} placeholder="Optional" /></label>
              </div>
            )}
            <button type="submit" disabled={ccLoading}>{ccLoading ? 'Calculating...' : 'Calculate Calories'}</button>
          </form>
          {ccError && <div className="error-message">{ccError}</div>}
          <Modal open={ccModalOpen && !!ccResult} onClose={() => setCcModalOpen(false)}>
            {ccResult && (
              <div className="wc-result-modal wc-calories-modal">
                <div className="wc-calories-burnt">
                  <span className="wc-calories-number">{ccResult.calories_burned}</span>
                  <span className="wc-calories-unit">kcal</span>
                </div>
                {ccForm.heart_rate && ccForm.heart_rate.trim() !== '' && (
                  <div className="wc-method">Method: {ccResult.method}</div>
                )}
                <div className="wc-weekly-heading">WEEKLY PLAN (RECOMMENDED)</div>
                <ul className="wc-weekly-list">
                  {ccResult.weekly_plan.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default WeightAndCalories;
