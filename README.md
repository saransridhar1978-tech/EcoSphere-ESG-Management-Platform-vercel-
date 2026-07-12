# EcoSphere AI - Full-Stack ESG Management & Auditing Platform

EcoSphere AI is a modern, production-ready AI-powered corporate sustainability platform designed to help organizations analyze carbon footprints, allocate daily eco tasks, detect greenwashing, model plantation offsets, and audit ESG parameters with high visual fidelity.

---

## 🚀 Key Features

1. **Interactive Operations Dashboard**
   * Real-time site monitoring with active GPS coordinates and a dynamic local time clock.
   * **Campus Photo Review System:** Allows workers to upload photos of campus assets and review their clean maintenance status.
   * **Simplified Carbon Engine Graph:** Visualizes purchased grid electricity vs. direct machine smoke footprint in plain language.

2. **Daily Work Allocation Panel**
   * Allocates key duties (e.g., "Switch off water motor", "Maintain grassland lawn") to specific workers to minimize energy loss.
   * Recommends environmental best practices and rewards workers with **Eco Coins** upon completion.

3. **Eco-Gini AI Scorecard**
   * Computes complex ESG scores based on energy, waste recycle rates, and governance indices.
   * **Google Maps Tamil Nadu Integration:** Allows auditing specific locations with map coordinate validation.
   * Displays dynamic landscape visual representations based on the prediction rating (e.g., thriving green city vs. deforested dry land).

4. **Tree Plantation Impact Simulator**
   * Models carbon capture based on duration (starting at 5 days) and sapling counts (starting at 5 trees).
   * Generates dynamic growth scale visualizations and gamified Eco Coin reward suggestions.

5. **Renewable Energy Predictor**
   * Side-by-side Solar Specification and Wind Specification calculators to model annual green generation offsets.

6. **Interactive AI Copilot (Chatbot)**
   * A persistent floating chatbot bubble represented by a cute robot icon (`🤖`) available globally across all sections.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (React, TypeScript, Tailwind CSS, ChartJS)
* **Backend:** FastAPI (Python, SQLite, SQLAlchemy, ReportLab PDF exporter)
* **AI Modules:** Dynamic environmental calculators & greenwashing estimators.

---

## 📦 Installation & Setup

### 1. Backend Setup
Make sure you have Python 3.10+ installed.
```bash
# Navigate to project root
cd "EcoSphere ESG Management Platform"

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Frontend Setup & Build
Make sure you have NodeJS 18+ installed.
```bash
# Navigate to frontend folder
cd frontend

# Install Node modules
npm install

# Compile pages into a static export folder
npm run build
```

### 3. Launching the App
Launch the unified FastAPI server which serves both the API endpoints and the Next.js static pages:
```bash
# From project root directory
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your web browser to access the live dashboard.

---

## 📄 Dynamic PDF Reports
* Click **"Export ESG Report"** inside the dashboard to generate and download a dynamically compiled PDF audit detailing organization stats, environmental scores, and future compliance roadmaps.
