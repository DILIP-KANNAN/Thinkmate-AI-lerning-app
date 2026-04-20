# AI Learning App

A full-stack AI-powered learning application designed to provide interactive and personalized education. The system features a responsive frontend, a robust backend API, and a specialized Retrieval-Augmented Generation (RAG) backend to process and serve intelligent insights from uploaded documents.

## 🚀 Project Structure

The repository is modularly structured into three distinct parts:

- **`/frontend`**: The user interface built with modern web technologies and Expo (React Native). It provides a seamless cross-platform experience.
- **`/backend`**: The primary Node.js/Express backend that handles user authentication, business logic, and database operations.
- **`/rag-backend`**: A specialized Python (FastAPI) backend dedicated to processing documents and running AI models. It implements a Retrieval-Augmented Generation (RAG) architecture using vector databases (like FAISS) and language models to power the app's intelligent features.

## 🛠️ Technology Stack

- **Frontend**: React, React Native, Expo, styling libraries
- **Backend (Main)**: Node.js, Express.js, MongoDB
- **Backend (AI/RAG)**: Python, FastAPI, FAISS, PyPDF2, LangChain / LlamaIndex

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v18+ recommended)
- Python (v3.10+ recommended)
- MongoDB (running locally or a connection string to MongoDB Atlas)

### 1. Setting up the RAG Backend (AI Service)

Navigate to the `rag-backend` directory and set up the Python environment:

```bash
cd rag-backend
python -m venv venv
# On Windows use: venv\Scripts\activate
# On Mac/Linux use: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `rag-backend` and add necessary environment variables (e.g., API keys, host configs).
Start the FastAPI server:

```bash
uvicorn main:app --host 0.0.0.0 --reload
```

### 2. Setting up the Main Backend

Navigate to the `backend` directory:

```bash
cd backend
npm install
```

Create a `.env` file in `backend`. Example configuration:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
node server.js
# or npm run dev
```

### 3. Setting up the Frontend

Navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npx expo start --web
```

## 🧠 AI Integration

This application leverages advanced AI capabilities to understand and summarize user-provided content. Uploaded documents are chunked, converted into high-dimensional vectors, and stored in a local FAISS index (handled by `rag-backend`). User queries are augmented with this custom knowledge context to provide highly relevant and contextual answers via Large Language Models.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

## 📝 License

This project is licensed under the MIT License.
