import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiBookmark, FiPlus, FiPlay } from 'react-icons/fi';
import QuizCreator from './components/QuizCreator';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';
import './App.css';
import axios from 'axios';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [cnote, setCnote] = useState({
    id: null,
    title: '',
    content: '',
    isForQuiz: false
  });
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState('all');
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [showQuizTaker, setShowQuizTaker] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [quizExistsMap, setQuizExistsMap] = useState({});

  const filteredNotes = active === 'quiz'
    ? notes.filter(note => note.isForQuiz)
    : notes;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCnote({
      ...cnote,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cnote.title.trim()) return;

    if (editing) {
      setNotes(notes.map(note =>
        note.id === cnote.id ? cnote : note
      ));
    } else {
      setNotes([...notes, {
        ...cnote,
        id: Math.floor(Math.random() * 1000000),
        createdAt: new Date().toString()
      }]);
    }

    setCnote({ id: null, title: '', content: '', isForQuiz: false });
    setEditing(false);
  };

  const handleEdit = (note) => {
    setCnote(note);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    const note = notes.find(n => n.id === id);

    if (note && note.isForQuiz) {
      try {
        await axios.delete(`http://localhost:5000/api/quizzes/by-note/${id}`);
        setQuizExistsMap(prev => {
          const newMap = { ...prev };
          delete newMap[id];
          return newMap;
        });
      } catch (err) {
        console.error('Quiz deletion error (may be normal if quiz not created):', err);
      }
    }

    setNotes(notes.filter(note => note.id !== id));
    if (cnote.id === id) {
      setCnote({ id: null, title: '', content: '', isForQuiz: false });
      setEditing(false);
    }
  };

  const toggleQuizMark = (id) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isForQuiz: !note.isForQuiz } : note
    ));
  };

  const handleCreateQuiz = (note) => {
    setSelectedNote(note);
    setShowQuizCreator(true);
  };

  const handleSaveQuiz = async (quiz) => {
    try {
      if (!quiz.note_id && selectedNote) {
        quiz.note_id = selectedNote.id;
      }
      await axios.post('http://localhost:5000/api/quizzes', quiz);
      setShowQuizCreator(false);
      setSelectedNote(null);
      checkQuizExists(quiz.note_id);
    } catch (err) {
      console.error(err);
      alert('Failed to save quiz.');
    }
  };

  const handleTakeQuiz = async (note) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/quizzes/by-note/${note.id}`);
      const quiz = {
        ...res.data,
        questions: res.data.questions.map(q => ({
          ...q,
          correctAnswer: q.correct_answer
        }))
      };
      setCurrentQuiz(quiz);
      setShowQuizTaker(true);
    } catch (err) {
      console.error(err);
      alert('Quiz not found for this note.');
    }
  };

  const handleQuizComplete = async (answers) => {
    setShowQuizTaker(false);
    setQuizAnswers(answers);
    setShowQuizResults(true);

    try {
      await axios.post('http://localhost:5000/api/quiz-attempts', {
        quiz_id: currentQuiz.id,
        score: answers.filter((a, i) => a === currentQuiz.questions[i].correctAnswer).length,
        total_questions: currentQuiz.questions.length,
        percentage: Math.round(
          (answers.filter((a, i) => a === currentQuiz.questions[i].correctAnswer).length /
            currentQuiz.questions.length) * 100
        ),
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save quiz attempt.');
    }
  };

  const checkQuizExists = async (noteId) => {
    try {
      await axios.get(`http://localhost:5000/api/quizzes/by-note/${noteId}`);
      setQuizExistsMap(prev => ({ ...prev, [noteId]: true }));
    } catch {
      setQuizExistsMap(prev => ({ ...prev, [noteId]: false }));
    }
  };

  useEffect(() => {
    filteredNotes.forEach(note => {
      if (note.isForQuiz) {
        checkQuizExists(note.id);
      }
    });
  }, [filteredNotes]);

  return (
    <div className="notes-app">
      <header className="app-header">
        <h1>Notes & Quiz</h1>
        <div className="tabs">
          <button
            className={active === 'all' ? 'active' : ''}
            onClick={() => setActive('all')}
          >
            All Notes
          </button>
          <button
            className={active === 'quiz' ? 'active' : ''}
            onClick={() => setActive('quiz')}
          >
            Quiz Notes <span>{notes.filter(n => n.isForQuiz).length}</span>
          </button>
        </div>
      </header>

      <div className="app-container">
        <div className="editor-panel">
          <form onSubmit={handleSubmit} className="note-editor">
            <input
              type="text"
              name="title"
              value={cnote.title}
              onChange={handleInputChange}
              placeholder="Note title..."
              className="title-input"
              autoFocus
            />
            <textarea
              name="content"
              value={cnote.content}
              onChange={handleInputChange}
              placeholder="Start writing your note here..."
              className="content-input"
            />
            <div className="editor-footer">
              <label className="quiz-toggle">
                <input
                  type="checkbox"
                  name="isForQuiz"
                  checked={cnote.isForQuiz}
                  onChange={handleInputChange}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Include in Quiz</span>
              </label>
              <button type="submit" className="save-btn">
                {editing ? 'Update' : 'Add'}
                <FiPlus className="icon" />
              </button>
            </div>
          </form>
        </div>

        <div className="notes-panel">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <h3>{active === 'quiz'
                ? 'No notes marked for quiz yet'
                : 'No notes yet'}</h3>
              <p>{active === 'quiz'
                ? 'Mark notes with the bookmark icon to see them here'
                : 'Create your first note using the editor'}</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(note => (
                <div key={note.id} className={`note-card ${note.isForQuiz ? 'quiz-note' : ''}`}>
                  <div className="card-header">
                    <h3>{note.title}</h3>
                    <div className="card-actions">
                      {note.isForQuiz && (
                        <>
                          {quizExistsMap[note.id] ? (
                            <button
                              onClick={() => handleTakeQuiz(note)}
                              className="take-quiz-btn"
                              title="Take Quiz"
                            >
                              <FiPlay />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCreateQuiz(note)}
                              className="create-quiz-btn"
                              title="Create Quiz"
                            >
                              <FiPlus />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => toggleQuizMark(note.id)}
                        className={`quiz-btn ${note.isForQuiz ? 'active' : ''}`}
                        title="Mark for quiz"
                      >
                        <FiBookmark />
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="edit-btn"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="card-content">
                    {note.content.split('\n')[0].substring(0, 100)}
                    {note.content.length > 100 && '...'}
                  </div>
                  <div className="card-footer">
                    <span className="date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showQuizCreator && selectedNote && (
        <QuizCreator
          note={selectedNote}
          onSave={handleSaveQuiz}
          onClose={() => {
            setShowQuizCreator(false);
            setSelectedNote(null);
          }}
        />
      )}

      {showQuizTaker && currentQuiz && (
        <QuizTaker
          quiz={currentQuiz}
          onComplete={handleQuizComplete}
          onClose={() => {
            setShowQuizTaker(false);
            setCurrentQuiz(null);
          }}
        />
      )}

      {showQuizResults && currentQuiz && quizAnswers && (
        <QuizResults
          quiz={currentQuiz}
          answers={quizAnswers}
          onClose={() => {
            setShowQuizResults(false);
            setCurrentQuiz(null);
            setQuizAnswers(null);
          }}
        />
      )}
    </div>
  );
};

export default App;