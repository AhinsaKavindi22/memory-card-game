import React from 'react';
import Card from './Card';
import './Board.css';

const Board = ({ cards, onCardClick }) => {
  return (
    <div className="board">
      {cards.map((card) => (
        <Card key={card.id} card={card} onCardClick={onCardClick} />
      ))}
    </div>
  );
};

export default Board;