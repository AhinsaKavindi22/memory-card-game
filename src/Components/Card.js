import React from 'react';
import './Card.css';
import { logos } from '../assets/logos';

const Card = ({ card, onCardClick }) => {
  const getCardContent = () => {
    if (card.type === 'wildcard') return '★';
    if (card.type === 'trap') return '💣';
    return <img src={logos[card.value]} alt={card.value} className="card-logo" />;
  };

  return (
    <div
      className={`card ${card.isFlipped ? 'flipped' : ''} ${
        card.isMatched ? 'matched' : ''
      }`}
      onClick={() => onCardClick(card)}
    >
      <div className="card-inner">
        <div className="card-front">?</div>
        <div className="card-back">{getCardContent()}</div>
      </div>
    </div>
  );
};

export default Card;