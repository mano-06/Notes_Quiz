import { useState } from 'react';
import { FiX, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';

const QuizTaker = ({ quiz, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateProgress = () => {
    const answered = answers.filter(a => a !== null).length;
    return (answered / quiz.questions.length) * 100;
  };

  if (showResults) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="quiz-taker">
        <div className="quiz-taker-header">
          <h2>{quiz.title}</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>

        <div className="question-text">
          {quiz.questions[currentQuestion].question}
        </div>

        <div className="options-list">
          {quiz.questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="quiz-navigation">
          <button
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <FiArrowLeft /> Previous
          </button>

          <button
            className="nav-btn next"
            onClick={handleNext}
            disabled={answers[currentQuestion] === null}
          >
            {currentQuestion === quiz.questions.length - 1 ? (
              <>
                Finish <FiCheck />
              </>
            ) : (
              <>
                Next <FiArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;