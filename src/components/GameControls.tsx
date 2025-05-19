import React, { useState } from 'react';
import './GameControls.css';

interface GameControlsProps {
  onAction: (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onAction }) => {
  const [raiseAmount, setRaiseAmount] = useState(10);

  return (
    <div className="game-controls">
      <div className="action-buttons">
        <button 
          className="action-button fold" 
          onClick={() => onAction('fold')}
        >
          フォールド
        </button>
        
        <button 
          className="action-button check" 
          onClick={() => onAction('check')}
        >
          チェック
        </button>
        
        <button 
          className="action-button call" 
          onClick={() => onAction('call')}
        >
          コール
        </button>
        
        <div className="raise-controls">
          <button 
            className="action-button raise" 
            onClick={() => onAction('raise', raiseAmount)}
          >
            レイズ {raiseAmount}
          </button>
          
          <div className="raise-amount-controls">
            <button 
              className="amount-button" 
              onClick={() => setRaiseAmount(prev => Math.max(5, prev - 5))}
            >
              -
            </button>
            
            <div className="amount-display">{raiseAmount}</div>
            
            <button 
              className="amount-button" 
              onClick={() => setRaiseAmount(prev => prev + 5)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameControls; 