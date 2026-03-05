# 🚀 AI Finance Visualizer

A full-stack finance tracking app with AI-powered insights, interactive charts, and a sleek glassmorphism UI.

## ✨ Features

- 🔐 **Secure JWT Authentication** (with bcrypt)
- 💰 **Expense Tracking** – Add, view, delete transactions
- 📊 **Interactive Charts** – Donut & area charts using Recharts
- 🤖 **AI Insights** – Personalized financial advice via Google Gemini 2.5 Flash
- 🎨 **Glassmorphism UI** – Dark theme with neon accents (Tailwind CSS)

## 🛠️ How AI Finance Visualizer Works

<img width="2229" height="569" alt="diagram-export-3-1-2026-11_44_31-PM" src="https://github.com/user-attachments/assets/b1ae4d96-ee95-4d7a-8292-c629923726b6" />


## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose 
- JWT & bcrypt for authentication
- Google Gemini API

### Frontend
- React 18 + TypeScript 
- Tailwind CSS (custom glassmorphism)
- Recharts for visualizations
- Axios for API calls

## ⚡ Quick Start

**Backend**
```bash
cd server
npm install
# Create .env with MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev
```

**Frontend**
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start tracking!

## 📁 Project Structure

```
ai-finance-visualizer/
├── server/                
│   ├── server.ts
│   ├── models/             # Mongoose schemas (User, Transaction)
│   ├── middleware/         # Auth middleware (JWT)
│   ├── controllers/        # Gemini AI logic
│   └── routes/             # API endpoints (auth, transactions, ai)
│
└── client/                
    └── src/
        ├── App.tsx          # Main app logic
        └── components/
            ├── Auth.tsx      # Login/Signup
            ├── Dashboard.tsx # Main dashboard
            └── Charts.tsx    # Recharts visualizations
```

## 🔍 Key Highlights

- **AI Integration** – Gemini API generates actionable insights from your transactions.
- **Interactive Charts** – Real-time spending breakdown and daily trends.
- **Secure Authentication** – JWT with protected routes.
- **Modern UI** – Glassmorphism cards, neon gradients, smooth animations.

---

Built with ❤️ using the MERN stack + AI.
