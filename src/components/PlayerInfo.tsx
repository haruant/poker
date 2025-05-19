import React from 'react';
import { PlayerType } from '../types/gameTypes';
import Card from './Card';
import './PlayerInfo.css';

interface PlayerInfoProps {
  player: PlayerType;
  isCurrentPlayer: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isCurrentPlayer }) => {
  return (
    <div className={`player-info-container ${isCurrentPlayer ? 'current-player' : ''}`}>
      <div className="player-details">
        <h3>{player.name}</h3>
        <p>チップ: {player.chips}</p>
        {player.bet > 0 && <p>現在のベット: {player.bet}</p>}
      </div>
      
      <div className="player-hand">
        {player.hand.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
    </div>
  );
};

export default PlayerInfo;
