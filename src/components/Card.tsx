import React from 'react';
import { CardType } from '../types/gameTypes';
import './Card.css';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
}

const Card: React.FC<CardProps> = ({ card, faceDown = false }) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getCardColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  };

  return (
    <div className={`card ${faceDown ? 'face-down' : ''}`}>
      {!faceDown && (
        <div className={`card-content ${getCardColor(card.suit)}`}>
          <div className="card-corner top-left">
            <div className="card-rank">{card.rank}</div>
            <div className="card-suit">{getSuitSymbol(card.suit)}</div>
          </div>
          
          <div className="card-center">
            {getSuitSymbol(card.suit)}
          </div>
          
          <div className="card-corner bottom-right">
            <div className="card-rank">{card.rank}</div>
            <div className="card-suit">{getSuitSymbol(card.suit)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card; 