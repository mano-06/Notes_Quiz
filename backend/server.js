const express = require('express');
const cors = require('cors');
const { query } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create a quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    const { title, note_id, questions } = req.body;
    await query('BEGIN');
    const quizResult = await query(
      'INSERT INTO quizzes (title, note_id) VALUES ($1, $2) RETURNING id',
      [title, note_id]
    );
    const quizId = quizResult.rows[0].id;
    for (const question of questions) {
      await query(
        'INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
        [quizId, question.question, JSON.stringify(question.options), question.correctAnswer]
      );
    }
    await query('COMMIT');
    res.status(201).json({ id: quizId, title, note_id, questions });
  } catch (error) {
    try { await query('ROLLBACK'); } catch {}
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Get a quiz by ID
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quizResult = await query('SELECT * FROM quizzes WHERE id = $1', [id]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const questionsResult = await query('SELECT * FROM questions WHERE quiz_id = $1', [id]);
    const quiz = {
      ...quizResult.rows[0],
      questions: questionsResult.rows.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))
    };
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Save a quiz attempt
app.post('/api/quiz-attempts', async (req, res) => {
  try {
    const { quiz_id, score, total_questions, percentage } = req.body;
    const result = await query(
      'INSERT INTO quiz_attempts (quiz_id, score, total_questions, percentage) VALUES ($1, $2, $3, $4) RETURNING *',
      [quiz_id, score, total_questions, percentage]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    res.status(500).json({ error: 'Failed to save quiz attempt' });
  }
});

// Get quiz attempts for a quiz
app.get('/api/quiz-attempts/:quiz_id', async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const result = await query(
      'SELECT * FROM quiz_attempts WHERE quiz_id = $1 ORDER BY created_at DESC',
      [quiz_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
});

// Get a quiz by note_id
app.get('/api/quizzes/by-note/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    const quizResult = await query(
      'SELECT * FROM quizzes WHERE note_id = $1',
      [note_id]
    );
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const quizId = quizResult.rows[0].id;
    const questionsResult = await query(
      'SELECT * FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    const quiz = {
      ...quizResult.rows[0],
      questions: questionsResult.rows.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))
    };
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz by note_id:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Delete a quiz by note_id
app.delete('/api/quizzes/by-note/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    const result = await query('DELETE FROM quizzes WHERE note_id = $1 RETURNING *', [note_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found for this note' });
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz by note_id:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 