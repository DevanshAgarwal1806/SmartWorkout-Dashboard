# backend/main.py - Enhanced Version
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, date
import requests
import io
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()
print("OpenRouter key loaded:", os.getenv("OPENROUTER_API_KEY"))
app = FastAPI(title="FitTrack API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class WorkoutEntry(BaseModel):
    date: str
    duration: int
    calories: int
    exercises: Dict[str, Any]

class UserProfile(BaseModel):
    age: int
    height_cm: int
    weight_kg: int
    activity_level: str
    gender: str

class WeightPredictionRequest(BaseModel):
    age: int
    height_cm: int
    weight_kg: float
    activity_level: str
    gender: str
    goal_type: str  # "lose" only

class CalorieCalculationRequest(BaseModel):
    gender: str
    weight_kg: float
    age: int
    duration_mins: int
    exercise_type: str
    intensity: Optional[str] = None
    heart_rate: Optional[int] = None
    swimming_style: Optional[str] = None

class AIInsightRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

class RoutePoint(BaseModel):
    latitude: float
    longitude: float
    timestamp: str

class PlotRequest(BaseModel):
    x_axis: str
    y_axis: str
    graph_type: str  # "Line", "Scatter", "Bar", "Histogram", "Box"
    legend_attr: Optional[str] = None
    stat_mode: Optional[str] = "Sum"  # "Sum", "Mean", "Median", "Mode"

class PersonalizedWorkoutRequest(BaseModel):
    decision: str  # "Loose Weight" or "Gain Weight"
    current_weight: float
    aim: float  # kg to lose/gain
    days: int
    exercise_hours: int  # minutes per day
    gym_access: str  # "Yes" or "No"
    days_per_week: int
    workout_type: str
    fitness_level: str
    injuries: Optional[str] = ""
    gender: str
    age: int

class DietPlanRequest(BaseModel):
    name: str
    age: int
    gender: str  # "M", "F", "Other"
    height_cm: int
    weight_kg: float
    goal_type: str  # "Weight Loss", "Muscle Gain", "Maintenance"
    target_weight: Optional[float] = None
    timeline_weeks: int
    allergies: Optional[str] = ""
    medical_conditions: Optional[str] = ""
    diet_type: Optional[str] = ""  # "Vegan", "Vegetarian", "Keto", etc.
    restrictions: Optional[str] = ""  # "Halal", "Kosher", etc.
    meal_frequency: int = 3  # meals per day
    disliked_foods: Optional[str] = ""
    preferred_cuisines: Optional[str] = ""

class DietPlanResponse(BaseModel):
    success: bool
    diet_plan: str
    user_data: Dict[str, Any]
    generated_at: str

# In-memory storage (replace with database in production)
workout_logs: List[WorkoutEntry] = []
user_profiles: Dict[str, UserProfile] = {}
active_routes: Dict[str, List[RoutePoint]] = {}  # sessionId -> route points

def save_logs():
    pass  # No-op, remove JSON logging

def generate_with_openrouter(prompt: str) -> str:
    """Generate AI response using OpenRouter"""
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    
    if not openrouter_key:
        return "❌ Error: OpenRouter API key not configured"
    
    headers = {
        "Authorization": f"Bearer {openrouter_key}",
        "HTTP-Referer": "https://your-app-domain.com",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "mistralai/mistral-small-3.2-24b-instruct:free",
        "messages": [
            {"role": "system", "content": "You are a helpful and motivating fitness coach."},
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"❌ Error: {e}"
def create_diet_plan_prompt(user_data: Dict[str, Any]) -> str:
    """Create detailed prompt for diet plan generation"""
    return f"""
    You are a professional AI dietitian. Based on the following user details, generate a detailed personalized diet plan.

    User Details:
    - Name: {user_data.get('name', 'User')}
    - Age: {user_data.get('age')} years
    - Gender: {user_data.get('gender')}
    - Height: {user_data.get('height_cm')} cm
    - Weight: {user_data.get('weight_kg')} kg
    - Fitness Goal: {user_data.get('goal_type')}
    - Target Weight: {user_data.get('target_weight', 'Not specified')} kg
    - Timeline: {user_data.get('timeline_weeks')} weeks
    - Allergies: {user_data.get('allergies', 'None')}
    - Medical Conditions: {user_data.get('medical_conditions', 'None')}
    - Diet Preference: {user_data.get('diet_type', 'No specific preference')}
    - Restrictions: {user_data.get('restrictions', 'None')}
    - Meal Frequency: {user_data.get('meal_frequency')} meals per day
    - Disliked Foods: {user_data.get('disliked_foods', 'None')}
    - Preferred Cuisines: {user_data.get('preferred_cuisines', 'Any')}

    Your output should include:
    
    1. **DAILY CALORIC AND MACRONUTRIENT TARGETS**
       - Total daily calories needed
       - Protein (grams and percentage)
       - Carbohydrates (grams and percentage)
       - Fats (grams and percentage)
       - Fiber recommendations
    
    2. **SAMPLE DAILY MEAL PLAN**
       - Breakfast with detailed portions
       - Mid-morning snack (if applicable)
       - Lunch with detailed portions
       - Afternoon snack (if applicable)
       - Dinner with detailed portions
       - Evening snack (if applicable)
    
    3. **WEEKLY SHOPPING LIST**
       - Categorized by food groups
       - Estimated quantities needed
    
    4. **NUTRITIONAL WARNINGS AND TIPS**
       - Important considerations based on medical conditions/allergies
       - Hydration recommendations
       - Supplement suggestions if needed
    
    5. **MEAL REPLACEMENT SUGGESTIONS**
       - Alternative options for each meal
       - Emergency meal ideas
    
    6. **PROGRESS TRACKING TIPS**
       - How to monitor progress
       - When to adjust the plan
    
    Present everything in a clear, organized format with emojis for better readability.
    Make it motivating and personalized for {user_data.get('name', 'the user')}.
    """

@app.get("/")
async def root():
    return {"message": "FitTrack API is running!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
@app.post("/api/predict-weight")
async def predict_weight(request: WeightPredictionRequest):
    """Predict weight for 1, 2, and 6 months based on user data and goal"""
    bmr = 10 * request.weight_kg + 6.25 * request.height_cm - 5 * request.age
    bmr += 5 if request.gender.lower() == "male" else -161
    activity_multipliers = {
        "Sedentary": 1.2,
        "Lightly active": 1.375,
        "Moderately active": 1.55,
        "Very active": 1.725,
        "Super active": 1.9
    }
    tdee = bmr * activity_multipliers.get(request.activity_level, 1.2)
    # Assume a moderate, safe rate: 0.5 kg/week (lose) or 0.25 kg/week (gain)
    if request.goal_type == "lose":
        weekly_kg = 0.5
        sign = -1
    else:
        # If not 'lose', default to no weight change or raise error
        weekly_kg = 0
        sign = 0
    calories_per_kg = 7700
    daily_calorie_change = (weekly_kg * calories_per_kg) / 7
    def predict_weight_for_days(days):
        weight_change = sign * (daily_calorie_change * days) / calories_per_kg
        return round(request.weight_kg + weight_change, 2)
    protein = request.weight_kg * 2
    fat = request.weight_kg * 0.8
    carbs = (tdee - (protein * 4 + fat * 9)) / 4
    return {
        "predictions": {
            "1_month": predict_weight_for_days(30),
            "2_months": predict_weight_for_days(60),
            "6_months": predict_weight_for_days(180)
        },
        "macros": {
            "protein": round(protein, 1),
            "fat": round(fat, 1),
            "carbs": round(carbs, 1)
        },
        "daily_calories": round(tdee + sign * daily_calorie_change),
        "tdee": round(tdee)
    }

# Calorie Calculation Endpoints
@app.post("/api/calculate-calories")
async def calculate_calories(request: CalorieCalculationRequest):
    """Calculate calories burned during exercise"""
    
    if request.heart_rate and request.exercise_type in ["Jogging", "Cycling"]:
        # Heart rate-based calculation
        if request.gender == "Male":
            calories = ((-55.0969 + (0.6309 * request.heart_rate) + 
                        (0.1988 * request.weight_kg) + (0.2017 * request.age)) / 4.184) * request.duration_mins
        else:
            calories = ((-20.4022 + (0.4472 * request.heart_rate) - 
                        (0.1263 * request.weight_kg) + (0.074 * request.age)) / 4.184) * request.duration_mins
    else:
        # MET-based calculation
        met_values = {
            "Jogging": 10,
            "Cycling": 8,
            "Weight Lifting": {
                "Light Effort": 3,
                "Moderate Effort": 4.5,
                "Vigorous Effort": 6
            },
            "Swimming": {
                "Leisurely swimming": 6,
                "Backstroke": 4.8,
                "Breaststroke": 5.3,
                "Freestyle (slow)": 5.8,
                "Freestyle (moderate)": 8.3,
                "Freestyle (fast)": 9.8,
                "Butterfly": 13.8,
                "Treading water (moderate)": 3.5,
                "Treading water (vigorous)": 7,
            }
        }
        
        if request.exercise_type == "Weight Lifting":
            met = met_values[request.exercise_type].get(request.intensity, 4.5)
        elif request.exercise_type == "Swimming":
            met = met_values[request.exercise_type].get(request.swimming_style, 6)
        else:
            met = met_values.get(request.exercise_type, 5)
        
        calories = met * request.weight_kg * (request.duration_mins / 60)
    
    return {
        "calories_burned": round(calories, 2),
        "method": "heart_rate" if request.heart_rate else "met",
        "weekly_plan": [
            "Mon/Wed/Fri: Full-body training",
            "Tue/Thu: Cardio (45 mins)",
            "Sat: Light Yoga or Stretch",
            "Sun: Rest"
        ]
    }

# Diet plan generation endpoint
@app.post("/api/generate-diet-plan", response_model=DietPlanResponse)
async def generate_diet_plan(request: DietPlanRequest):
    """
    Generate a personalized diet plan based on user information
    """
    try:
        # Convert request to dictionary for processing
        user_data = {
            "name": request.name,
            "age": request.age,
            "gender": request.gender,
            "height_cm": request.height_cm,
            "weight_kg": request.weight_kg,
            "goal_type": request.goal_type,
            "target_weight": request.target_weight,
            "timeline_weeks": request.timeline_weeks,
            "allergies": request.allergies,
            "medical_conditions": request.medical_conditions,
            "diet_type": request.diet_type,
            "restrictions": request.restrictions,
            "meal_frequency": request.meal_frequency,
            "disliked_foods": request.disliked_foods,
            "preferred_cuisines": request.preferred_cuisines
        }
        
        # Validate required fields
        if not all([request.name, request.age, request.height_cm, request.weight_kg, request.goal_type]):
            raise HTTPException(status_code=400, detail="Missing required fields: name, age, height_cm, weight_kg, goal_type")
        
        # Generate diet plan using existing OpenRouter function
        diet_plan_prompt = create_diet_plan_prompt(user_data)
        diet_plan = generate_with_openrouter(diet_plan_prompt)
        
        if diet_plan.startswith("❌ Error"):
            raise HTTPException(status_code=500, detail=diet_plan)
        
        # Store the diet plan request (optional - for analytics)
        # You can save this to a database or file if needed
        
        return DietPlanResponse(
            success=True,
            diet_plan=diet_plan,
            user_data=user_data,
            generated_at=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate diet plan: {str(e)}")

# Data Analysis Endpoints
@app.post("/api/analyze-data")
async def analyze_data(file: UploadFile = File(...)):
    """Analyze uploaded workout data"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Basic analysis
        analysis = {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "data_types": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "summary_stats": df.describe().to_dict() if len(df.select_dtypes(include=[np.number]).columns) > 0 else {},
            "sample_data": df.head(5).to_dict('records')
        }
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.post("/api/generate-plot")
async def generate_plot(file: UploadFile = File(...), plot_config: str = Form(None)):
    """Generate plot from uploaded data"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        df.columns = df.columns.str.strip()
        config = json.loads(plot_config) if plot_config else {}
        x_axis = config.get('x_axis')
        y_axis = config.get('y_axis')
        graph_type = config.get('graph_type', 'Line')
        legend_attr = config.get('legend_attr')
        stat_mode = config.get('stat_mode', 'Sum')
        if x_axis: x_axis = x_axis.strip()
        if y_axis: y_axis = y_axis.strip()
        if legend_attr: legend_attr = legend_attr.strip()
        if not x_axis or not y_axis:
            raise HTTPException(status_code=400, detail="x_axis and y_axis are required")
        if x_axis not in df.columns or y_axis not in df.columns:
            raise HTTPException(status_code=400, detail=f"Invalid column names: x_axis='{x_axis}', y_axis='{y_axis}', available={list(df.columns)}")
        plt.figure(figsize=(10, 6))
        # Helper for aggregation
        def aggregate(grouped):
            if stat_mode == "Sum":
                return grouped.sum().reset_index()
            elif stat_mode == "Mean":
                return grouped.mean().reset_index()
            elif stat_mode == "Median":
                return grouped.median().reset_index()
            else:
                return grouped.sum().reset_index()
        if graph_type == "Line":
            if legend_attr and legend_attr in df.columns:
                for val in df[legend_attr].unique():
                    subset = df[df[legend_attr] == val]
                    grouped = subset.groupby(x_axis)[y_axis]
                    agg = aggregate(grouped)
                    plt.plot(agg[x_axis], agg[y_axis], label=str(val))
                plt.legend(title=legend_attr)
            else:
                grouped = df.groupby(x_axis)[y_axis]
                agg = aggregate(grouped)
                plt.plot(agg[x_axis], agg[y_axis])
        elif graph_type == "Scatter":
            if legend_attr and legend_attr in df.columns:
                for val in df[legend_attr].unique():
                    subset = df[df[legend_attr] == val]
                    grouped = subset.groupby(x_axis)[y_axis]
                    agg = aggregate(grouped)
                    plt.scatter(agg[x_axis], agg[y_axis], label=str(val))
                plt.legend(title=legend_attr)
            else:
                grouped = df.groupby(x_axis)[y_axis]
                agg = aggregate(grouped)
                plt.scatter(agg[x_axis], agg[y_axis])
        elif graph_type == "Bar":
            if df[x_axis].dtype == 'object' or df[x_axis].nunique() < 50:
                if legend_attr and legend_attr in df.columns:
                    grouped = df.groupby([x_axis, legend_attr])[y_axis]
                    agg = aggregate(grouped)
                    pivot = agg.pivot(index=x_axis, columns=legend_attr, values=y_axis).fillna(0)
                    x_vals = list(pivot.index)
                    legend_vals = list(pivot.columns)
                    x_indices = np.arange(len(x_vals))
                    bar_width = 0.8 / max(len(legend_vals), 1)
                    for i, lval in enumerate(legend_vals):
                        y = pivot[lval].values
                        plt.bar(x_indices + i*bar_width, y, width=bar_width, label=str(lval))
                    plt.xticks(x_indices + bar_width*(len(legend_vals)-1)/2, x_vals, rotation=45)
                    plt.legend(title=legend_attr)
                else:
                    grouped = df.groupby(x_axis)[y_axis]
                    agg = aggregate(grouped)
                    plt.bar(agg[x_axis], agg[y_axis])
                    plt.xticks(rotation=45)
            else:
                raise HTTPException(status_code=400, detail="Bar chart requires categorical X-axis")
        elif graph_type == "Histogram":
            if legend_attr and legend_attr in df.columns:
                for val in df[legend_attr].unique():
                    subset = df[df[legend_attr] == val]
                    plt.hist(subset[y_axis], bins=20, alpha=0.6, label=str(val))
                plt.legend(title=legend_attr)
            else:
                plt.hist(df[y_axis], bins=20)
        elif graph_type == "Box":
            plt.boxplot(df[y_axis])
            plt.xticks([1], [y_axis])
        plt.xlabel(x_axis)
        plt.ylabel(y_axis)
        plt.title(f"{graph_type} Plot of {y_axis} vs {x_axis} ({stat_mode})")
        plt.tight_layout()
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        plot_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        return {"plot": f"data:image/png;base64,{plot_base64}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating plot: {str(e)}")

# AI Integration Endpoints
@app.post("/api/ai-insights")
async def generate_ai_insights(request: AIInsightRequest):
    """Generate AI insights using OpenRouter"""
    try:
        insights = generate_with_openrouter(request.prompt)
        return {"insights": insights}
    except Exception as e:
        return {"error": f"AI service error: {str(e)}"}

@app.post("/api/ai-insights/data")
async def generate_ai_insights_from_data(file: UploadFile = File(...)):
    """Generate AI insights from uploaded CSV data"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Prepare data summary for AI
        preview = df.head(5).to_string()
        summary = df.describe(include='all').to_string()
        
        # Handle correlation matrix safely
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 1:
            correlation = df[numeric_cols].corr().to_string()
        else:
            correlation = "Not enough numeric columns for correlation analysis"
        
        missing = df.isnull().sum().to_string()
        
        prompt = f"""
You are a certified Exercise Physiologist and Performance Data Specialist with advanced expertise in biomechanics, training science, and athletic performance analysis. You've spent years helping elite athletes and fitness enthusiasts optimize their training through data-driven insights.

**CLIENT'S WORKOUT DATA ANALYSIS**

**RAW PERFORMANCE DATA:**
{preview}

**PHYSIOLOGICAL METRICS SUMMARY:**
{summary}

**MOVEMENT PATTERN CORRELATIONS:**
{correlation}

**DATA INTEGRITY ASSESSMENT:**
{missing}

**YOUR EXPERT ANALYSIS APPROACH:**

As their performance analyst, conduct a comprehensive evaluation of their training data using your deep understanding of exercise science. Your analysis should reveal the story their body is telling through the numbers.

**DELIVER YOUR PROFESSIONAL ASSESSMENT:**

**🔬 PERFORMANCE INTELLIGENCE FINDINGS**
Identify 3 critical discoveries from their data that reveal:
- **Training Adaptation Patterns**: How their body is responding to stimulus over time
- **Performance Bottlenecks**: What's limiting their progress or creating plateaus
- **Recovery & Overload Signatures**: Signs of optimal training stress vs. potential overreaching

For each finding, explain:
- The physiological significance ("This pattern indicates...")
- Why it matters for their goals ("This means your body is...")
- The timeline/progression you observe ("Over the past X weeks...")

**⚡ EVIDENCE-BASED OPTIMIZATION STRATEGIES**
Provide 3 data-driven interventions that will maximize their results:
- **Training Variable Adjustments**: Specific modifications to volume, intensity, or frequency
- **Recovery Protocol Enhancements**: Targeted strategies based on their fatigue patterns  
- **Progressive Overload Refinements**: How to manipulate training stress for continued adaptation

Each recommendation should include:
- The scientific rationale ("Research shows that...")
- Expected timeline for results ("You should see changes within...")
- Measurable success metrics ("Track improvement by monitoring...")

**📊 VISUAL PERFORMANCE ANALYTICS**
Recommend 2 powerful data visualizations that will unlock deeper insights:
- **Primary Analysis Chart**: The most revealing visualization for their specific training pattern
- **Tracking Dashboard Visual**: The best ongoing monitoring tool for their goals

For each visualization, specify:
- What metrics to plot and why
- What patterns to look for
- How to interpret the results for training decisions

**PROFESSIONAL DELIVERY STANDARDS:**
- Use exercise science terminology appropriately ("VO2 kinetics", "neuromuscular adaptation", "periodization")
- Reference training principles when relevant ("progressive overload", "specificity", "supercompensation")
- Provide confidence levels for your insights ("The data strongly suggests...", "There's a moderate indication that...")
- Include practical implementation timelines
- Address potential confounding factors in the data
- Suggest follow-up metrics to track

**YOUR ANALYTICAL VOICE:**
- Speak with scientific authority while remaining accessible
- Use evidence-based language ("The data indicates...", "Analysis reveals...")
- Provide context for why certain metrics matter
- Balance technical precision with practical application
- Show enthusiasm for the insights discovered ("This is particularly interesting because...")

Remember: You're not just reporting numbers—you're translating complex physiological data into actionable intelligence that will transform their training effectiveness. Make them feel like they have a world-class performance team analyzing their every rep.
"""
        
        insights = generate_with_openrouter(prompt)
        return {"insights": insights}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

# Personalized Workout Plan Endpoints
@app.post("/api/personalized-workout")
async def generate_personalized_workout(request: PersonalizedWorkoutRequest):
    """Generate personalized workout plan using AI"""
    
    prompt = f"""
You are an experienced, certified personal trainer with 10+ years of coaching clients to achieve their fitness goals. You're known for creating realistic, sustainable programs that get results while keeping clients motivated and injury-free.

**CLIENT PROFILE:**
- Goal: {request.decision} {request.aim} kg in {request.days} days
- Current Weight: {request.current_weight} kg  
- Demographics: {request.gender}, {request.age} years old
- Available Training Time: {request.exercise_hours} minutes per session
- Training Frequency: {request.days_per_week} days per week
- Preferred Workout Style: {request.workout_type}
- Current Fitness Level: {request.fitness_level}
- Equipment Access: {request.gym_access}
- Physical Limitations: {request.injuries}

**YOUR COACHING APPROACH:**

As their dedicated trainer, create a comprehensive {request.days}-day transformation program that speaks directly to them. Use your professional expertise to:

**STRUCTURE YOUR PROGRAM LIKE A TRUE COACH:**
1. **Opening Assessment & Motivation** - Address their specific goal with encouragement and realistic expectations
2. **Progressive Training Philosophy** - Explain your methodology for their success
3. **Daily Workout Breakdown** - Design each day with purpose and progression

**FOR EACH TRAINING DAY, PROVIDE:**
- **Pre-Workout Prep** (5-10 min dynamic warm-up specific to the day's focus)
- **Main Training Block** with:
  - Exercise selection with clear rationale
  - Precise sets × reps × rest periods
  - Weight/intensity recommendations based on their level
  - Form cues and safety reminders
  - Progression markers ("Increase weight when you can complete all sets with 2 reps in reserve")
- **Recovery Protocol** (cool-down, stretching, mobility work)
- **Coach's Daily Note** (motivation, what to expect, key focus points)

**COACHING PRINCIPLES TO FOLLOW:**
- Speak with authority and confidence, but remain encouraging
- Adjust intensity appropriately for age, gender, and fitness level
- Build in progressive overload while respecting their limitations
- Include recovery strategies and injury prevention
- Address both physical and mental aspects of their journey
- Provide alternatives for exercises when needed
- Give them checkpoints to assess progress

**DELIVERY STYLE:**
- Use direct, motivational coaching language ("Today we're focusing on...", "Your mission is...", "By the end of this week, you'll feel...")
- Include specific coaching cues ("Drive through your heels", "Control the negative")
- Add accountability measures ("Track your weights", "Rate your effort 1-10")
- Provide troubleshooting tips for common challenges

Remember: You're not just giving them a workout list—you're their coach guiding them through a transformation journey. Make them feel confident, supported, and excited to start each session.
"""
    
    try:
        workout_plan = generate_with_openrouter(prompt)
        return {"workout_plan": workout_plan}
    except Exception as e:
        return {"error": f"Error generating workout plan: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)