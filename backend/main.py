import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Using the universal free router (automatically picks an available free model)
DEFAULT_MODEL = os.getenv("MODEL_ID", "openrouter/free")

class EmergencyRequest(BaseModel):
    input: str
    language: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Hospital(BaseModel):
    name: str
    address: str
    distance: str
    link: str
    lat: float
    lng: float

class EmergencyResponse(BaseModel):
    severity: str
    actions: List[str]
    nextSteps: str
    localAdvice: Optional[str] = None
    hospitals: Optional[List[Hospital]] = None

async def get_nearby_hospitals(lat: float, lng: float) -> List[Hospital]:
    if not GOOGLE_MAPS_API_KEY:
        return []
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Search for hospitals
            places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=5000&type=hospital&key={GOOGLE_MAPS_API_KEY}"
            resp = await client.get(places_url)
            results = resp.json().get("results", [])[:3] # Get top 3
            
            hospitals = []
            for place in results:
                name = place.get("name")
                address = place.get("vicinity")
                place_id = place.get("place_id")
                
                # Create a Google Maps link
                link = f"https://www.google.com/maps/dir/?api=1&origin={lat},{lng}&destination=place_id:{place_id}"
                
                # Get distance (simplified: using straight line or Distance Matrix if needed)
                # For now, let's keep it simple or use Distance Matrix for better UX
                dist_url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={lat},{lng}&destinations=place_id:{place_id}&key={GOOGLE_MAPS_API_KEY}"
                dist_resp = await client.get(dist_url)
                dist_data = dist_resp.json()
                
                distance = "Nearby"
                if dist_data["status"] == "OK":
                    distance = dist_data["rows"][0]["elements"][0].get("distance", {}).get("text", "Nearby")

                # Get lat/lng for mapping
                geom = place.get("geometry", {}).get("location", {})
                h_lat = geom.get("lat")
                h_lng = geom.get("lng")
                
                if h_lat and h_lng:
                    hospitals.append(Hospital(
                        name=name,
                        address=address,
                        distance=distance,
                        link=link,
                        lat=h_lat,
                        lng=h_lng
                    ))
            return hospitals
        except Exception as e:
            print(f"Maps Error: {e}")
            return []

@app.post("/analyze", response_model=EmergencyResponse)
async def analyze_emergency(request: EmergencyRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")

    system_prompt = f"""
    You are a Medical Emergency Assistant. Analyze the user's situation and provide life-saving guidance.
    
    CRITICAL RULES:
    1. If the situation is life-threatening, set severity to 'CRITICAL'.
    2. ALWAYS recommend calling 1122 for emergencies in Pakistan.
    3. Use simple, direct language.
    4. Return valid JSON only.
    5. Respond in the requested language: {request.language}
    6. For Urdu (ur) and Pashto (ps), use the correct script.
    
    Response Format:
    {{
        "severity": "LOW" | "MEDIUM" | "CRITICAL",
        "actions": ["Step 1", "Step 2"],
        "nextSteps": "Consolidated next steps advice",
        "localAdvice": "Specific advice for Pakistan (KP/rural areas). Use 1122 as the helpline."
    }}
    """

    # Default fallback data
    analysis = {
        "severity": "Medium",
        "actions": ["Seek medical attention immediately.", "Stay calm and wait for professional help."],
        "nextSteps": "The AI service is currently busy. Please consult a doctor.",
        "localAdvice": "Emergency services can be reached at 1122."
    }

    async with httpx.AsyncClient() as client:
        try:
            print(f"--- Assessment Start: {request.input[:30]} ---")
            full_user_content = f"{system_prompt}\n\nUser Symptoms: {request.input}"
            
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://em-app.vercel.app",
                    "X-Title": "EmergiAI",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openrouter/free", # Hardcoded for stability
                    "messages": [{"role": "user", "content": full_user_content}]
                },
                timeout=25.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"].get("content")
                if content:
                    try:
                        ai_data = json.loads(content)
                        # Ensure required fields exist in AI response
                        if all(k in ai_data for k in ["severity", "actions", "nextSteps"]):
                            analysis = ai_data
                            print("AI Analysis Successful")
                    except json.JSONDecodeError:
                        print("AI returned invalid JSON, using fallback")
            else:
                print(f"OpenRouter Error {response.status_code}: {response.text}")

        except Exception as e:
            print(f"AI Connection Error: {str(e)}")

    # Fetch hospitals (Always happens, even if AI fails)
    hospitals = []
    if request.latitude and request.longitude:
        try:
            print(f"Searching hospitals near: {request.latitude}, {request.longitude}")
            hospitals = await get_nearby_hospitals(request.latitude, request.longitude)
        except Exception as e:
            print(f"Hospital Search Error: {e}")
    
    analysis["hospitals"] = hospitals
    return analysis

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
         raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    
    try:
        # Save temporary file
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        
        with open(temp_filename, "rb") as audio_file:
            translation = client.audio.transcriptions.create(
                file=(temp_filename, audio_file.read()),
                model="whisper-large-v3",
                response_format="json",
            )
        
        os.remove(temp_filename)
        return {"text": translation.text}
        
    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        print(f"Transcription Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
