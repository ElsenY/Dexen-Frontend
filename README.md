# Dexen Frontend

React application for user WFH management and activity tracking.

## 🚀 Getting Started

Follow these steps to get the application running on your local machine:

1.  **Install Dependencies**
    Ensure you have [Node.js](https://nodejs.org/) installed, then run:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**
    Create a `.env` file in the root directory and fill in based on your backend port:
    ```env
    REACT_APP_API_URL=http://localhost:5000
    PORT=3000
    ```

3.  **Launch the Application**
    Start the development server:
    ```bash
    npm start
    ```
    The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Routes Overview

### 🔐 1. Login Page (`/login`)
The entry point for authenticated sessions.
- **Purpose**: Authenticates users via email and password.
- **Tech**: Uses token-based authentication (stored in `localStorage`).
- **Features**: Real-time error handling, sleek animations, and social login placeholders.

### 👤 2. Profile Page (`/profile`) [Protected]
The personalized workspace for registered personnel.
- **Purpose**: Manage personal data and track shift history.
- **Key Features**:
  - **Dynamic Profile Editing**: Update phone numbers and profile images with live preview.
  - **Security Management**: Change account passwords (requires current password validation).
  - **Activity Logs**: View attendance history with reactive **Date Range Filtering** (From/To).

### 🛠️ 3. Admin Dashboard (`/admin`) [Public]
The command center for system-wide user oversight.
- **Purpose**: Monitor all registered users and perform administrative actions.
- **Key Features**:
  - **Global User List**: Real-time table showing all personnel, system IDs, and contact info.
  - **Real-Time Updates (WebSockets)**: Integrates `socket.io-client` to listen for global `userUpdated` events, triggering automated system refreshes and premium notification modals.
  - **User Enrollment**: Register new users using **Multipart Form-Data** (supporting binary image uploads).
  - **Personnel Configuration**: Remotely edit any user's profile or reset credentials.

---

## 🛠️ Built with
- **React & TypeScript**: For type-safe, robust component architecture.
- **Tailwind CSS**: For a cutting-edge utility-first design system.
- **Socket.io**: For instant, real-time administrative synchronization.
