export interface WorkoutEntry {
  date: string;
  duration: number;
  calories: number;
  exercises: Record<string, any>;
}

export interface UserProfile {
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  gender: string;
}

export interface WeightPredictionRequest {
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  goal_type: "lose" | "gain";
  target_weight_change: number;
  target_days: number;
}

export interface WeightPredictionResponse {
  predictions: {
    "1_month": number;
    "2_months": number;
    "6_months": number;
    "target_date": number;
  };
  macros: {
    protein: number;
    fat: number;
    carbs: number;
  };
  daily_calories: number;
  tdee: number;
}

export interface CalorieCalculationRequest {
  gender: string;
  weight_kg: number;
  age: number;
  duration_mins: number;
  exercise_type: string;
  intensity?: string;
  heart_rate?: number;
  swimming_style?: string;
}

export interface CalorieCalculationResponse {
  calories_burned: number;
  method: "heart_rate" | "met";
  weekly_plan: string[];
}

export interface AIInsightRequest {
  prompt: string;
  context?: string;
}

export interface AIInsightResponse {
  insights: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface PlotRequest {
  x_axis: string;
  y_axis: string;
  graph_type: "Line" | "Scatter" | "Bar" | "Histogram" | "Box";
  legend_attr?: string;
  stat_mode?: "Sum" | "Mean" | "Median" | "Mode";
}

export interface PersonalizedWorkoutRequest {
  decision: "Loose Weight" | "Gain Weight";
  current_weight: number;
  aim: number;
  days: number;
  exercise_hours: number;
  gym_access: "Yes" | "No";
  days_per_week: number;
  workout_type: string;
  fitness_level: string;
  injuries?: string;
}

export interface PersonalizedWorkoutResponse {
  workout_plan: string;
}

export interface DataAnalysisResponse {
  rows: number;
  columns: number;
  column_names: string[];
  data_types: Record<string, string>;
  missing_values: Record<string, number>;
  summary_stats: Record<string, any>;
  sample_data: Record<string, any>[];
}

export interface PlotResponse {
  plot: string; // base64 encoded image
}

export interface RouteResponse {
  points: RoutePoint[];
  distance_km: number;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: any; // Lucide icon component
  current?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}