# Simple TODO with Real-Time Sync (GraphQL + .NET + React)

This repository contains a self‑contained sample application implementing a task manager with real‑time synchronization across clients. The backend uses ASP.NET Core 8 with HotChocolate GraphQL (queries, mutations, and subscriptions) and Entity Framework Core for persistence. The frontend is a React application built with Adobe React Spectrum UI components and Apollo Client for GraphQL communication. Docker Compose orchestrates the backend, frontend, and SQL Server database.

## Quick Start

You can run the entire application with a single command (requires [Docker](https://www.docker.com/)).

```bash
docker compose up --build
```

After the containers start:

* **Frontend**: http://localhost:5173 — the React UI where you can add tasks and toggle their status.
* **Backend GraphQL endpoint**: http://localhost:8080/graphql — interactive GraphQL IDE (Banana Cake Pop).

> **Note:** Subscriptions share the same `/graphql` path via WebSockets. The frontend proxies `/api/*` to the backend via nginx, so there are no CORS issues.

## System Architecture

* **Backend** (`/backend`): ASP.NET Core 8 minimal API using HotChocolate. It defines a `TaskItem` entity with an ID, title, description, status, and timestamps. GraphQL operations include:
  * **Query** `allTasks`: Returns all tasks ordered by creation time.
  * **Mutations**: `createTask` (adds a task) and `updateTaskStatus` (toggles status). Both publish events for real‑time updates.
  * **Subscriptions**: `onTaskAdded` and `onTaskUpdated` notify clients of changes.
  * Entity Framework Core persists tasks in a SQL Server database. Timestamps update automatically on save.

* **Frontend** (`/frontend`): React 18 application with Adobe React Spectrum for consistent accessible UI. Apollo Client manages GraphQL queries, mutations, and subscriptions over HTTP and WebSocket. The UI allows users to create tasks and toggle their status, and it reflects updates from other clients in real time.

* **Docker Compose**: Coordinates three services—`db` (SQL Server), `backend` (ASP.NET Core), and `frontend` (Nginx serving the built React app and proxying `/api` requests). The SQL Server password and other settings are configured via environment variables in `docker-compose.yml`.

## File Structure

```
todo-realtime/
├── docker-compose.yml         # Compose configuration
├── backend/                   # ASP.NET Core + GraphQL server
│   ├── Backend.csproj
│   ├── Program.cs
│   ├── AppDbContext.cs
│   ├── Models/
│   │   ├── TaskItem.cs
│   │   └── TaskStatus.cs
│   ├── GraphQL/
│   │   ├── Query.cs
│   │   ├── Mutation.cs
│   │   └── Subscription.cs
│   └── Dockerfile
├── frontend/                  # React client
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── graphql.ts
│   ├── nginx.conf
│   └── Dockerfile
└── README.md
```

## How to Test

1. **Open the app at `http://localhost:5173` in your browser.**

2. **Test task creation:**
   - Create a task by entering a title (and optional description) and clicking **Add Task**. The task appears immediately in the list.
   - Check that the **Total** counter increases

4. **Test pending/completed status:**
   - Click the checkbox next to a task to mark it as completed
   - Verify the **Completed** counter increases and **Pending** counter decreases
   - Toggle back to pending to test both directions

5. **Test delete functionality:**
   - Click the delete (trash) icon next to any task
   - Confirm deletion in the browser prompt
   - Verify the task is removed and counters update correctly

6. **Test real-time sync:**
   - Open the same URL in another browser window
   - Create, update, or delete tasks in one window
   - Verify changes appear instantly in the other window