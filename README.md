# 🚀 Worker Fatigue & Stress Detection System

Complete end-to-end implementation guide for building a production-ready fatigue detection system.


## 📁 STEP 1: PROJECT STRUCTURE

Create the following folder structure:

```
worker-fatigue-detection/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── emotion_model.py
│   │   │   └── risk_engine.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── temporal_smoothing.py
│   ├── ml_training/
│   │   ├── train_model.py
│   │   ├── prepare_dataset.py
│   │   └── model_architecture.py
│   ├── requirements.txt
│   └── saved_models/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## 🐍 STEP 2: BACKEND SETUP

### 2.1 Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On Mac/Linux
source venv/bin/activate
```

### 2.2 Install Dependencies

Create `requirements.txt`:
```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
opencv-python==4.8.1.78
mediapipe==0.10.8
tensorflow==2.15.0
numpy==1.24.3
Pillow==10.1.0
pandas==2.1.3
tqdm==4.66.1
scikit-learn==1.3.2
matplotlib==3.8.2
```

Install:
```bash
pip install -r requirements.txt
```

---
<!-- 
## 🧠 STEP 3: DATASET PREPARATION

### 3.1 Download FER-2013 Dataset

1. Go to: https://www.kaggle.com/datasets/msambare/fer2013
2. Click "Download" (you'll need a Kaggle account)
3. Extract the downloaded zip file
4. Move the extracted `fer2013` folder to: `backend/ml_training/`

Your structure should look like:
```
backend/ml_training/
├── fer2013/
│   ├── train/
│   │   ├── angry/
│   │   ├── disgust/
│   │   ├── fear/
│   │   ├── happy/
│   │   ├── sad/
│   │   ├── surprise/
│   │   └── neutral/
│   └── test/
│       ├── angry/
│       ├── disgust/
│       ├── fear/
│       ├── happy/
│       ├── sad/
│       ├── surprise/
│       └── neutral/
├── prepare_dataset.py
├── model_architecture.py
└── train_model.py
```

### 3.2 Prepare Dataset

```bash
cd ml_training
python prepare_dataset.py
```

Expected output:
```
🔄 Loading FER-2013 dataset from folders...
📦 Loading TRAIN set...
📁 Loading angry...
  angry: 100%|████████████| 3995/3995 [00:02<00:00]
...
✅ Dataset loaded successfully!
   Training samples: 28709
   Test samples: 7178
   Class mapping:
   0 = Fatigue (sad, neutral)
   1 = Stress (angry, disgust, fear)
   2 = Normal (happy, surprise) -->
<!-- ``` -->

<!-- ### 3.3 Verify Dataset (Optional but Recommended)

```bash
python verify_dataset.py
```

This checks that everything loaded correctly and creates sample visualizations.

---

## 🤖 STEP 4: TRAIN THE MODEL

### 4.1 Create Model Directory

```bash
cd ..
mkdir saved_models
cd ml_training
```

### 4.2 Train Model

```bash
python train_model.py
```

**Training time:** 2-3 hours on CPU, 30-45 minutes on GPU

Expected output:
```
✅ Model saved to: ../saved_models/emotion_model_final.h5
   Test Accuracy: 68.5%
```

**Note:** 65-75% accuracy is acceptable for this application. Focus is on insights, not perfect accuracy.

---

## 🚀 STEP 5: START BACKEND SERVER

### 5.1 Navigate to Backend

```bash
cd ../app
``` -->

### STEP 3: Run Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
🔄 Loading emotion model...
✅ Model loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 3.1 Test Backend

Open browser: http://localhost:8000

You should see:
```json
{
  "status": "online",
  "message": "Worker Fatigue Detection API",
  "version": "1.0.0"
}
```

---

<!-- ## ⚛️ STEP 6: FRONTEND SETUP

### 6.1 Create React Project

Open a **new terminal** (keep backend running):

```bash
cd ..  # Go to project root
npm create vite@latest frontend -- --template react
cd frontend
``` -->

### STEP 4: Install Dependencies

```bash
cd frontend
npm install
npm install axios recharts lucide-react
```

<!-- ### 6.3 Replace Default Files

Copy all the provided components into their respective folders:
- `src/App.jsx`
- `src/index.css`
- `src/utils/api.js`
- `src/components/Sidebar.jsx`
- `src/components/LiveMonitoring.jsx`
- `src/components/Analytics.jsx`
- `src/components/Reports.jsx`

### 6.4 Update `main.jsx`

Replace `src/main.jsx` with:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
``` -->

---

## 🎯 STEP 5: RUN THE APPLICATION

### 5.1 Start Backend (if not running)

Terminal 1:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
cd app
python main.py
```

### 5.2 Start Frontend

Terminal 2:
```bash
cd frontend
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5.3 Open Application

Open browser: **http://localhost:5173**

---

## 🧪 STEP 6: TESTING THE SYSTEM

### 6.1 Live Monitoring

1. Click "Live Monitoring" in sidebar
2. Click "Start Camera"
3. Allow camera access
4. Watch real-time detection:
   - Fatigue levels
   - Stress levels
   - Risk score
   - Trend graphs

### 6.2 Analytics

1. Let the system collect data (2-3 minutes)
2. Click "Analytics" in sidebar
3. View:
   - Average fatigue/stress
   - Hourly breakdowns
   - Distribution charts

### 6.3 Reports

1. Click "Reports" in sidebar
2. Click "Export CSV" or "Export Report"
3. Download and review files

---

## TROUBLESHOOTING

### Issue: Camera not working

**Solution:**
- Ensure HTTPS or localhost
- Check browser permissions
- Try different browser (Chrome recommended)

### Issue: "No face detected"

**Solution:**
- Ensure good lighting
- Face camera directly
- Move closer to camera
- Remove glasses/masks if possible

### Issue: Backend error 500

**Solution:**
```bash
# Check model exists
ls backend/saved_models/emotion_model_final.h5

# Check Python version (3.8-3.10 recommended)
python --version

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

### Issue: CORS errors

**Solution:**
- Ensure backend is running on port 8000
- Check `backend/app/config.py` CORS_ORIGINS includes your frontend URL

---

## 📊 EXPECTED RESULTS

### Model Performance
- Training Accuracy: 70-75%
- Validation Accuracy: 65-70%
- Inference Time: <100ms per frame

### System Performance
- FPS: 0.5 (one analysis every 2 seconds)
- Latency: <1 second
- Memory: ~1GB RAM

---

## UI FEATURES

### Live Monitoring Page
✅ Real-time webcam feed  
✅ Fatigue/stress bars  
✅ Risk gauge with color coding  
✅ Trend indicators  
✅ Real-time line charts  

### Analytics Page
✅ Key metrics cards  
✅ Trend charts  
✅ Distribution pie charts  
✅ Hourly breakdown bars  
✅ Risk summary boxes  

### Reports Page
✅ Session summary  
✅ Detailed statistics  
✅ CSV export  
✅ Text report export  
✅ Recommendations  

---

## FOR PROJECT PRESENTATION

### Key Points to Highlight

1. **Industry Relevance**
   - Manufacturing safety
   - Productivity optimization
   - Accident prevention

2. **Technical Stack**
   - Deep Learning (CNN)
   - Computer Vision (MediaPipe)
   - Real-time Processing
   - RESTful API
   - Modern UI (React)

3. **Novel Features**
   - Temporal smoothing
   - Risk scoring engine
   - Privacy-first (no image storage)
   - Industry 4.0 ready

4. **Practical Value**
   - Real-time alerts
   - Actionable insights
   - Export capabilities
   - Scalable architecture


## FUTURE ENHANCEMENTS

1. **Multi-worker tracking**
   - Track multiple faces
   - Line-wise monitoring

2. **Advanced analytics**
   - Shift comparison
   - Worker performance trends
   - Predictive alerts

3. **Integration**
   - Database (PostgreSQL)
   - Email/SMS alerts
   - Dashboard for managers

4. **Mobile app**
   - React Native version
   - On-site monitoring


## PROJECT DOCUMENTATION

### Abstract Template

```
This project presents a real-time Worker Fatigue and Stress Detection 
System for smart manufacturing environments. Using computer vision and 
deep learning, the system analyzes facial expressions to identify fatigue 
and stress levels, calculating risk scores to prevent accidents and 
improve productivity.

The system employs a CNN-based emotion detection model trained on 
FER-2013 dataset, MediaPipe for face detection, and temporal smoothing 
for noise reduction. A comprehensive web dashboard provides live 
monitoring, analytics, and reporting capabilities.

Key achievements include 68% detection accuracy, real-time processing 
(<100ms per frame), and privacy-compliant design with no image storage. 
The system demonstrates practical applicability in Industry 4.0 
manufacturing environments.
```

### Keywords
```
Smart Manufacturing, Worker Safety, Fatigue Detection, Computer Vision, 
Deep Learning, Industry 4.0, Real-time Analytics, CNN, Emotion Recognition
```

---

## ✅ PROJECT DELIVERABLES CHECKLIST

- [ ] Trained emotion detection model (.h5 file)
- [ ] Backend API (FastAPI)
- [ ] Frontend dashboard (React)
- [ ] Real-time webcam integration
- [ ] Risk scoring engine
- [ ] Analytics dashboard
- [ ] Report generation
- [ ] Documentation
- [ ] Presentation slides
- [ ] Demo video (optional)

---

## SUCCESS CRITERIA

Your project is **presentation-ready** when:

✅ Camera feed works smoothly  
✅ Emotions detected in real-time  
✅ Charts update dynamically  
✅ Risk scores calculated correctly  
✅ Reports can be exported  
✅ UI is clean and professional  
✅ No critical bugs  
✅ Documentation complete  

<!-- 
## 📞 SUPPORT

If you encounter any issues:

1. Check troubleshooting section
2. Verify all dependencies installed
3. Ensure correct Python/Node versions
4. Review error messages carefully -->

**Common Commands:**

```bash
# Backend
cd backend
source venv/bin/activate
python app/main.py

# Frontend
cd frontend
npm run dev

# Check ports
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Mac/Linux
```

---