# Notes & Quiz Backend

This is the backend server for the Notes & Quiz application, built with Express.js and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE notes_quiz;
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`

4. Initialize the database:
   ```bash
   psql -U your_username -d notes_quiz -f schema.sql
   ```

5. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Quizzes

- `POST /api/quizzes`
  - Create a new quiz
  - Body: `{ title, note_id, questions: [{ question, options, correctAnswer }] }`

- `GET /api/quizzes/:id`
  - Get a quiz by ID
  - Returns quiz with questions

### Quiz Attempts

- `POST /api/quiz-attempts`
  - Save a quiz attempt
  - Body: `{ quiz_id, score, total_questions, percentage }`

- `GET /api/quiz-attempts/:quiz_id`
  - Get all attempts for a quiz
  - Returns array of attempts sorted by date 