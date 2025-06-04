import { useState } from 'react';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';

const QuizCreator = ({ note, onSave, onClose }) => {
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  if (!note || !note.id) {
    return <div>Error: No note selected for quiz creation.</div>;
  }

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = questions.every(q =>
      q.question.trim() &&
      q.options.every(o => o.trim()) &&
      q.correctAnswer >= 0
    );

    if (!isValid) {
      alert('Please fill in all questions and options');
      return;
    }

    onSave({
      title: note.title,
      questions: questions.map(q => ({
        ...q,
        question: q.question.trim(),
        options: q.options.map(o => o.trim())
      })),
      note_id: note.id
    });
  };

  return (
    <div className="modal-overlay">
      <div className="quiz-creator">
        <div className="quiz-creator-header">
          <h2>Create Quiz: {note.title}</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-container">
              <div className="question-header">
                <h3>Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="remove-btn"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={question.question}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                placeholder="Enter your question..."
                className="question-input"
              />

              <div className="options-container">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-row">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                      className="correct-radio"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="option-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="quiz-creator-footer">
            <button type="button" onClick={addQuestion} className="add-question-btn">
              <FiPlus /> Add Question
            </button>
            <button type="submit" className="save-quiz-btn">
              <FiSave /> Save Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizCreator;