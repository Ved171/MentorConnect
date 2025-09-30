# MentorConnect

This is a full-stack web application that connects university students with mentors, structured as a modern monorepo.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.
-   A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Setup & Running the Application

Follow these steps exactly for a clean, error-free installation.

### 1. Clean Up Old Project Files (CRITICAL STEP)

Before installing, you **must** delete your old project directory entirely. Starting fresh in a new, empty folder is the best way to guarantee there are no conflicting old files.

### 2. Install Dependencies

Once you have placed all the files from this final project into your new, clean folder, open your terminal in the project's **root directory** and run this single command. It will install all necessary packages for both the backend and the frontend from the single `package.json` file.

```bash
npm install
```

### 3. Configure Backend Environment

1.  In the `backend/` directory, create a file named `.env`.
2.  Open the new `backend/.env` file and add the following content, replacing the placeholder values with your actual keys.

    ```
    # Your MongoDB connection string
    MONGO_URI=mongodb://localhost:27017/mentorconnect

    # A secret key for signing JWT tokens. Replace with a long, random string.
    JWT_SECRET=your_super_secret_jwt_key_12345

    # Your Google Gemini API Key
    API_KEY=your_gemini_api_key_here

    # The port for the backend server
    PORT=5001
    ```

### 4. Run the Application

Run the development server from the **root directory**. This starts both the backend and frontend servers at the same time.

```bash
npm run dev
```

-   The backend API will be running on `http://localhost:5001`.
-   The frontend application will be served on `http://localhost:3000`.

Open your web browser and navigate to **http://localhost:3000** to use the application.