import { FiX } from 'react-icons/fi';

const QuizResults = ({ quiz, answers, onClose }) => {
  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100)
    };
  };

  const score = calculateScore();

  return (
    <div className="modal-overlay">
      <div className="quiz-results">
        <div className="results-header">
          <h2>Quiz Results: {quiz.title}</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="score-summary">
          <div className="score-circle">
            <div className="score-percentage">{score.percentage}%</div>
            <div className="score-fraction">{score.correct}/{score.total}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;