# Secure Authentication System

A complete and secure authentication system, built with a modern and containerized architecture.

## 🚀 Technologies

*   **Frontend**: React + TypeScript + Tailwind CSS (Vite)
*   **Backend**: Node.js + Express + TypeScript
*   **Database**: PostgreSQL (with Prisma ORM)
*   **Cache/Sessions**: Redis
*   **Infrastructure**: Docker + Docker Compose

## ✨ Features

*   Secure User Registration and Login.
*   Authentication via JWT (JSON Web Tokens).
*   Protected Routes in the Frontend.
*   Modern and responsive design with Tailwind.
*   Data persistence with PostgreSQL.

## 🛠️ How to Run

This project is fully dockerized for a quick start.

1.  Make sure you have **Docker** and **Docker Compose** installed.
2.  Run the following command in the project root:

```bash
docker-compose up --build
```

3.  Access the application:
    *   **Frontend**: http://localhost:5173
    *   **Backend API**: http://localhost:3001

## 📂 Project Structure

*   `/frontend`: Frontend source code (React).
*   `/backend`: Backend source code (Express + Prisma).
*   `docker-compose.yml`: Container orchestration.
