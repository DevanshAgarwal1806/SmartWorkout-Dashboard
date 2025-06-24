// src/services/api.ts

import axios from 'axios';
import type {
  WorkoutEntry,
  WeightPredictionRequest,
  WeightPredictionResponse,
  CalorieCalculationRequest,
  CalorieCalculationResponse,
  AIInsightRequest,
  AIInsightResponse,
  PersonalizedWorkoutRequest,
  PersonalizedWorkoutResponse,
  RoutePoint,
  RouteResponse,
  DataAnalysisResponse,
  PlotResponse,
  PlotRequest
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Workout API
export const workoutApi = {
  // Log a new workout
  logWorkout: async (workout: WorkoutEntry): Promise<{ message: string; workout: WorkoutEntry }> => {
    const response = await api.post('/workouts', workout);
    return response.data;
  },

  // Get recent workouts
  getWorkouts: async (limit: number = 10): Promise<{ workouts: WorkoutEntry[] }> => {
    const response = await api.get(`/workouts?limit=${limit}`);
    return response.data;
  },

  // Get workout streak
  getWorkoutStreak: async (): Promise<{ streak: number }> => {
    const response = await api.get('/workouts/streak');
    return response.data;
  },
};

// Weight Prediction API
export const weightApi = {
  predictWeight: async (request: WeightPredictionRequest): Promise<WeightPredictionResponse> => {
    const response = await api.post('/predict-weight', request);
    return response.data;
  },
};

// Calorie Calculation API
export const calorieApi = {
  calculateCalories: async (request: CalorieCalculationRequest): Promise<CalorieCalculationResponse> => {
    const response = await api.post('/calculate-calories', request);
    return response.data;
  },
};

// Data Analysis API
export const dataApi = {
  analyzeData: async (file: File): Promise<DataAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/analyze-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generatePlot: async (file: File, plotConfig: PlotRequest): Promise<PlotResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('plot_config', JSON.stringify(plotConfig));
    
    const response = await api.post('/generate-plot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// AI Integration API
export const aiApi = {
  generateInsights: async (request: AIInsightRequest): Promise<AIInsightResponse> => {
    const response = await api.post('/ai-insights', request);
    return response.data;
  },

  generateInsightsFromData: async (file: File): Promise<AIInsightResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/ai-insights/data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generatePersonalizedWorkout: async (request: PersonalizedWorkoutRequest): Promise<PersonalizedWorkoutResponse> => {
    const response = await api.post('/personalized-workout', request);
    return response.data;
  },
};

// Route Tracking API
export const routeApi = {
  calculateDistance: async (routePoints: RoutePoint[]): Promise<{ distance_km: number }> => {
    const response = await api.post('/routes/calculate-distance', routePoints);
    return response.data;
  },

  addRoutePoint: async (sessionId: string, point: RoutePoint): Promise<{ message: string; total_points: number; distance_km: number }> => {
    const response = await api.post(`/routes/${sessionId}/add-point`, point);
    return response.data;
  },

  getRoute: async (sessionId: string): Promise<RouteResponse> => {
    const response = await api.get(`/routes/${sessionId}`);
    return response.data;
  },

  clearRoute: async (sessionId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/routes/${sessionId}`);
    return response.data;
  },
};

// Health Check API
export const healthApi = {
  checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// WebSocket connection for real-time route tracking
export const createRouteWebSocket = (sessionId: string): WebSocket => {
  const wsUrl = `ws://localhost:8000/ws/route/${sessionId}`;
  return new WebSocket(wsUrl);
};

// Export default api instance for custom requests
export default api;