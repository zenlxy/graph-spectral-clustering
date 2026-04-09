# Graph Spectral Clustering Visualiser

An interactive web application that helps users understand graph concepts such as adjacency matrices, Laplacian matrices, spectral clustering, and Lᵏ influence through visualisation and guided learning.

## ✨ Features

- Interactive graph canvas (add/remove nodes and edges)
- Step-by-step learning:
  - Adjacency Matrix
  - Degree Matrix
  - Laplacian Matrix
  - Spectral Clustering
  - Lᵏ Influence
- Dynamic matrix visualisations
- Cluster highlighting based on eigenvalues
- Lᵏ influence exploration with adjustable k
- AI-generated quiz based on the current graph
- Immediate feedback with explanations and scoring

## 🛠️ Tech Stack

Frontend:

- React (Vite)
- CSS

Backend:

- Node.js (Express)

AI:

- Google Gemini API

## 🌐 Deployment

Frontend (Vercel):  
🔗 https://graph-spectral-clustering.vercel.app

## ⚠️ Note on API Availability

Quiz generation depends on the Google Gemini API.  
Due to occasional high demand, the API may temporarily return errors (e.g. 503).

## 💻 Run Locally

1. Clone the repository:

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Start the backend:

```bash
cd server
npm install
npm run dev
```

3. Start the frontend

```bash
cd ..
npm install
npm run dev
```

4. Open in browser

```bash
http://localhost:5173
```

## 🔐 Environment Variables

To run locally, create a .env file inside the server folder:

```bash
GEMINI_API_KEY=your_api_key_here
```
