import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ score, time }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="scoreboard">
      <div className="score">Score: {score}</div>
      <div className="time">Time: {formatTime(time)}</div>
    </div>
  );
};

export default Scoreboard;