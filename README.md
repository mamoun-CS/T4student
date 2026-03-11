# T4Student

T4Student is a Node.js web application platform that bridges Students and Teachers. It features an authentication system, email verification, AI assistance, and robust quiz management with image handling capabilities.

This project has been recently refactored into a clean, modern **MVC (Model-View-Controller)** architecture to ensure maintainability, clear separation of concerns, and robust error handling.

## Project Architecture

The application is structured into the following layers:
- **`config/`**: Contains core configurations like the PostgreSQL Connection Pool (`database.js`) and Passport local authentication (`passport.js`).
- **`models/`**: Centralized SQL database actions separated into `user.model.js` and `quiz.model.js`.
- **`controllers/`**: The business logic of the app, connecting models to route responses (`ai`, `auth`, `student`, `teacher`).
- **`middleware/`**: Pre-route hooks for handling `error.js`, file `upload.js`, and `auth.js` protection.
- **`routes/`**: Express routers that direct endpoints to their specific controllers.
- **`utils/`**: Helper utilities like `email.js` using Nodemailer.
- **`server.js`**: The main application entry point that binds everything together.

## Requirements

- **Node.js**: v18+ recommended.
- **PostgreSQL**: An active database with matching schema definitions.

## Installation & Setup

1. **Install dependencies**:
   ```sh
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (where `package.json` is located) and add the following keys. Adjust the values to match your local setup:
   
   ```env
   # PostgreSQL Settings
   PG_USER=postgres
   PG_HOST=localhost
   PG_DB=t4student
   PG_PD=your_database_password
   PG_PORT=5432

   # Email Configuration (for Nodemailer verifications)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password

   # Express Session Secret
   BOSS_CLICK=your_random_secret_string

   # Google AI Keys (for AI Assistant feature)
   GOOGLE_AI1=your_google_ai_key_1
   GOOGLE_AI2=your_google_ai_key_2
   GOOGLE_AI3=your_google_ai_key_3
   ```

3. **Running the Application**:
   You can run the refactored MVC app by targeting the new `server.js` (or run the original monolithic app using `index.js`).
   
   To run the new MVC app natively:
   ```sh
   node refactored_app/server.js
   ```

4. **Access the App**:
   Visit [http://localhost:3000](http://localhost:3000) in your web browser.
