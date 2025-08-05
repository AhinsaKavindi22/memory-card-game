import React, { useEffect, useReducer } from 'react';
import Board from './Components/Board';
import Scoreboard from './Components/Scoreboard';
import './App.css';

/**
 * @typedef {'regular' | 'wildcard' | 'trap'} CardType
 * @typedef {{
 *  id: number;
 *  type: CardType;
 *  value: string;
 *  isFlipped: boolean;
 *  isMatched: boolean;
 * }} Card
 */

const programmingLanguages = [
  'JS', 'Python', 'Java', 'C#', 'Go', 'Ruby', 'PHP'
];

/**
 * Generates and shuffles a new set of 16 cards.
 * @returns {Card[]}
 */
const generateCards = () => {
    // Create 7 pairs of regular cards
    const regularCards = programmingLanguages.flatMap(lang => [
        { id: Math.random(), type: 'regular', value: lang, isFlipped: false, isMatched: false },
        { id: Math.random(), type: 'regular', value: lang, isFlipped: false, isMatched: false }
    ]);

    const allCards = [
        ...regularCards, // 14 cards
        { id: Math.random(), type: 'wildcard', value: 'Wild', isFlipped: false, isMatched: false },
        { id: Math.random(), type: 'trap', value: 'Trap', isFlipped: false, isMatched: false }
    ];

    // Shuffle the cards
    return allCards.sort(() => Math.random() - 0.5);
};

const initialState = {
  cards: [],
  flippedCards: [],
  matches: 0,
  mismatches: 0,
  timeRemaining: 180, // 3 minutes
  gameStatus: 'idle', // 'idle', 'playing', 'finished'
  score: 0
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        cards: generateCards(),
        gameStatus: 'playing',
      };
    case 'FLIP_CARD': {
      // Prevent flipping more than 2 cards or already flipped/matched cards
      if (state.flippedCards.length === 2 || action.payload.isFlipped) return state;

      const newCards = state.cards.map(card =>
        card.id === action.payload.id ? { ...card, isFlipped: true } : card
      );

      const newFlippedCards = [...state.flippedCards, action.payload];
      return { ...state, cards: newCards, flippedCards: newFlippedCards };
    }
    case 'CHECK_MATCH': {
      const [firstCard, secondCard] = state.flippedCards;

      // Wildcard logic
      if (firstCard.type === 'wildcard' || secondCard.type === 'wildcard') {
        const newCards = state.cards.map(card =>
          card.id === firstCard.id || card.id === secondCard.id
            ? { ...card, isMatched: true }
            : card
        );
        return {
          ...state,
          cards: newCards,
          flippedCards: [],
          matches: state.matches + 1,
          score: state.score + 100,
        };
      }

      // Regular match logic
      if (firstCard.value === secondCard.value) {
        const newCards = state.cards.map(card =>
          card.value === firstCard.value ? { ...card, isMatched: true } : card
        );
        return {
          ...state,
          cards: newCards,
          flippedCards: [],
          matches: state.matches + 1,
          score: state.score + 100,
        };
      }
      
      // Mismatch
      return {
        ...state,
        mismatches: state.mismatches + 1,
        score: Math.max(0, state.score - 20), // Score shouldn't go below 0
      };
    }
    case 'HANDLE_TRAP': {
        // Flip all matched cards face-down
        const newCards = state.cards.map(card => ({...card, isMatched: false, isFlipped: false}));
        return {
            ...state,
            cards: newCards,
            flippedCards: [],
            matches: 0, // Reset matches
        }
    }
    case 'FLIP_BACK': {
      // Flip back non-matched cards
      const newCards = state.cards.map(card =>
        state.flippedCards.some(fc => fc.id === card.id) ? { ...card, isFlipped: false } : card
      );
      return { ...state, cards: newCards, flippedCards: [] };
    }
    case 'TICK':
      if (state.timeRemaining > 0) {
        return { ...state, timeRemaining: state.timeRemaining - 1 };
      }
      return state;
    case 'GAME_OVER':
        const bonusPoints = state.gameStatus === 'playing' ? state.timeRemaining * 10 : 0;
        return {
            ...state,
            gameStatus: 'finished',
            score: state.score + bonusPoints
        }
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Game Timer
  useEffect(() => {
    if (state.gameStatus !== 'playing') return;

    if (state.timeRemaining <= 0) {
        dispatch({ type: 'GAME_OVER' });
        return;
    }

    const timer = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.gameStatus, state.timeRemaining]);

  // Check for matches/special cards
  useEffect(() => {
    if (state.flippedCards.length !== 2) return;

    const [firstCard, secondCard] = state.flippedCards;

    // Handle trap card immediately
    if (firstCard.type === 'trap' || secondCard.type === 'trap') {
        setTimeout(() => dispatch({ type: 'HANDLE_TRAP' }), 1000);
        return;
    }

    // Check for a match
    dispatch({ type: 'CHECK_MATCH' });
    
    // Flip back non-matches after a delay
    setTimeout(() => {
        dispatch({ type: 'FLIP_BACK' });
    }, 1000);

  }, [state.flippedCards]);

  // Check for win condition
  useEffect(() => {
      if (state.cards.length > 0 && state.cards.every(card => card.isMatched)) {
          dispatch({ type: 'GAME_OVER' });
      }
  }, [state.cards]);

  /** @param {Card} card */
  const handleCardClick = (card) => {
    if (state.gameStatus !== 'playing' || card.isFlipped || state.flippedCards.length === 2) {
      return;
    }
    dispatch({ type: 'FLIP_CARD', payload: card });
  };

  /** Bonus Challenge: Algorithm to detect if moves are possible */
  const hasPossibleMoves = () => {
      const unMatchedCards = state.cards.filter(card => !card.isMatched);
      if (unMatchedCards.some(card => card.type === 'wildcard')) return true;

      const counts = unMatchedCards.reduce((acc, card) => {
          if (card.type === 'regular') {
            acc[card.value] = (acc[card.value] || 0) + 1;
          }
          return acc;
      }, {});

      return Object.values(counts).some(count => count >= 2);
  }

  return (
    <div className="App">
      <h1>Memory Card Game</h1>
      {state.gameStatus === 'idle' && (
        <button className="start-button" onClick={() => dispatch({ type: 'START_GAME' })}>Start Game</button>
      )}

      {state.gameStatus === 'playing' && (
          <>
            <Scoreboard score={state.score} time={state.timeRemaining} />
            <Board cards={state.cards} onCardClick={handleCardClick} />
            {state.flippedCards.length === 0 && !hasPossibleMoves() && <p className="no-moves">No possible moves left!</p>}
          </>
      )}

      {state.gameStatus === 'finished' && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {state.score}</p>
          <button className="start-button" onClick={() => dispatch({ type: 'START_GAME' })}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;