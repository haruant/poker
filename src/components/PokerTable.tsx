import React from 'react';
import { CardType, PlayerType } from '../types/gameTypes';
import Card from './Card';
import './PokerTable.css';

interface PokerTableProps {
  communityCards: CardType[];
  players: PlayerType[];
  currentPlayer: number;
}

const PokerTable: React.FC<PokerTableProps> = ({ communityCards, players, currentPlayer }) => {
  // プレイヤーの位置を計算
  const getPlayerPosition = (index: number, totalPlayers: number) => {
    // 自分は常に下側
    if (index === 0) {
      return { bottom: '10px', left: '50%', transform: 'translateX(-50%)' };
    }
    
    // その他のプレイヤーは上部に配置
    const spacing = 33; // 各プレイヤー間のスペース (%)
    const startPosition = 50 - (spacing * (totalPlayers - 2)) / 2;
    const position = startPosition + (index - 1) * spacing;
    
    return { top: '10px', left: `${position}%`, transform: 'translateX(-50%)' };
  };

  return (
    <div className="poker-table">
      <div className="table-felt">
        {/* コミュニティカード */}
        <div className="community-cards">
          {communityCards.length > 0 ? (
            communityCards.map((card, index) => (
              <Card key={`community-${index}`} card={card} />
            ))
          ) : (
            <div className="empty-community-cards">
              <span>コミュニティカード</span>
            </div>
          )}
        </div>
        
        {/* プレイヤー */}
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`player-spot ${currentPlayer === index ? 'active-player' : ''} ${!player.isActive ? 'folded-player' : ''}`} 
            style={getPlayerPosition(index, players.length)}
          >
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              <div className="player-chips">{player.chips} チップ</div>
              {player.bet > 0 && <div className="player-bet">{player.bet}</div>}
            </div>
            
            <div className="player-cards">
              {player.hand.length > 0 ? (
                player.hand.map((card, cardIndex) => (
                  <Card 
                    key={`player-${player.id}-card-${cardIndex}`} 
                    card={card} 
                    // 他のプレイヤーのカードは裏向きに表示
                    faceDown={index !== 0} 
                  />
                ))
              ) : (
                <>
                  <div className="card card-placeholder"></div>
                  <div className="card card-placeholder"></div>
                </>
              )}
            </div>
            
            {player.isDealer && <div className="dealer-button">D</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokerTable; 