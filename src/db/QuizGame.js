// src/components/QuizGame.js
import React, { useState } from "react";

export default function QuizGame() {
  const questions = [
    {
      question: "What is 5 × 6?",
      options: ["25", "30", "35", "40"],
      answer: "30",
    },
    {
      question: "Water boils at what temperature (°C)?",
      options: ["50", "100", "150", "200"],
      answer: "100",
    },
    {
      question: "The capital of Odisha is?",
      options: ["Cuttack", "Puri", "Bhubaneswar", "Sambalpur"],
      answer: "Bhubaneswar",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (option) => {
    if (option === questions[current].answer) {
      setScore(score + 1);
    }
    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={styles.container}>
      {!finished ? (
        <>
          <h2>{questions[current].question}</h2>
          <div>
            {questions[current].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                style={styles.button}
              >
                {opt}
              </button>
            ))}
          </div>
          <p>
            Question {current + 1} of {questions.length}
          </p>
        </>
      ) : (
        <h2>
          🎉 Game Over! Your Score: {score}/{questions.length}
        </h2>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    background: "white",
    borderRadius: 15,
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    maxWidth: 400,
    margin: "auto",
    textAlign: "center",
  },
  button: {
    display: "block",
    width: "100%",
    margin: "10px 0",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
