import { useState, useEffect } from 'react';
import './App.css';
import PokerTable from './components/PokerTable';
import GameControls from './components/GameControls';
import PlayerInfo from './components/PlayerInfo';
import CutIn from './components/CutIn';
import { CardType, PlayerType, GameState } from './types/gameTypes';
import { dealCards, evaluateHands } from './utils/gameLogic';

function App() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [communityCards, setCommunityCards] = useState<CardType[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>([
    { id: 1, name: 'あなた', chips: 1000, hand: [], bet: 0, isActive: true, isDealer: true },
    { id: 2, name: 'CPU 1', chips: 1000, hand: [], bet: 0, isActive: true, isDealer: false },
    { id: 3, name: 'CPU 2', chips: 1000, hand: [], bet: 0, isActive: true, isDealer: false },
    { id: 4, name: 'CPU 3', chips: 1000, hand: [], bet: 0, isActive: true, isDealer: false },
  ]);
  const [pot, setPot] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState<PlayerType | null>(null);
  const [cutInType, setCutInType] = useState<'check' | 'raise' | 'call' | 'bet' | 'win' | null>(null);
  const [showCutIn, setShowCutIn] = useState(false);

  // CPUプレイヤーの自動行動のための副作用
  useEffect(() => {
    // CPUのターンで、ゲームが進行中の場合
    if (currentPlayer > 0 && gameState !== 'waiting' && gameState !== 'showdown') {
      // CPUの行動に少し遅延を入れて、より自然に見せる
      const cpuActionTimeout = setTimeout(() => {
        executeCpuAction();
      }, 1000);
      
      return () => clearTimeout(cpuActionTimeout);
    }
  }, [currentPlayer, gameState]);

  // CPUの行動を決定して実行
  const executeCpuAction = () => {
    const cpu = players[currentPlayer];
    const maxBet = Math.max(...players.map(p => p.bet));
    const callAmount = maxBet - cpu.bet;

    // CPUの行動パターン（単純なランダム戦略）
    // より複雑なAIロジックに置き換えることも可能
    const randomAction = Math.random();
    
    if (callAmount > 0) {
      // 誰かがベットしている場合
      if (randomAction < 0.2) {
        // 20%の確率でフォールド
        playerAction('fold');
      } else if (randomAction < 0.7) {
        // 50%の確率でコール
        playerAction('call');
      } else {
        // 30%の確率でレイズ
        const raiseAmount = callAmount + Math.floor(Math.random() * 3 + 1) * 5; // 5, 10, 15のいずれか
        playerAction('raise', raiseAmount);
      }
    } else {
      // 誰もベットしていない場合
      if (randomAction < 0.5) {
        // 50%の確率でチェック
        playerAction('check');
      } else {
        // 50%の確率でベット
        const betAmount = Math.floor(Math.random() * 3 + 1) * 5; // 5, 10, 15のいずれか
        playerAction('raise', betAmount);
      }
    }
  };

  const startGame = () => {
    // ゲームの状態をリセット
    const resetPlayers = players.map(player => ({
      ...player,
      hand: [],
      bet: 0,
      isActive: true
    }));
    setPlayers(resetPlayers);
    setCommunityCards([]);
    setPot(0);
    setWinner(null);
    
    // カードを配る
    const { playerHands } = dealCards(players.length);
    
    // プレイヤーにカードを設定
    const updatedPlayers = resetPlayers.map((player, index) => ({
      ...player,
      hand: playerHands[index]
    }));
    
    setPlayers(updatedPlayers);
    setGameState('preFlop');
    setCurrentPlayer(0); // プレイヤーからスタート
  };

  const dealNextRound = () => {
    switch (gameState) {
      case 'preFlop':
        // フロップを配る（3枚のコミュニティカード）
        setCommunityCards(communityCards.concat(dealCards(0, 3).communityCards));
        setGameState('flop');
        break;
      case 'flop':
        // ターンを配る（4枚目のコミュニティカード）
        setCommunityCards(communityCards.concat(dealCards(0, 1).communityCards));
        setGameState('turn');
        break;
      case 'turn':
        // リバーを配る（5枚目のコミュニティカード）
        setCommunityCards(communityCards.concat(dealCards(0, 1).communityCards));
        setGameState('river');
        break;
      case 'river':
        // ショーダウン - 勝者を決定
        const winningPlayer = evaluateHands(players, communityCards);
        setWinner(winningPlayer);
        setGameState('showdown');
        
        // 勝者にポットを与える
        if (winningPlayer) {
          setPlayers(players.map(player => 
            player.id === winningPlayer.id 
              ? { ...player, chips: player.chips + pot } 
              : player
          ));
        }
        break;
      default:
        break;
    }
    
    // ベットをリセット
    setPlayers(players.map(player => ({
      ...player,
      bet: 0
    })));
    setCurrentPlayer(0);
  };

  // カットインを表示する関数
  const showCutInAnimation = (type: 'check' | 'raise' | 'call' | 'bet' | 'win') => {
    setCutInType(type);
    setShowCutIn(true);
    setTimeout(() => {
      setShowCutIn(false);
    }, 1500);
  };

  const playerAction = (action: 'fold' | 'check' | 'call' | 'raise', amount = 0) => {
    // 現在のプレイヤーのアクションを処理
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    
    switch (action) {
      case 'fold':
        player.isActive = false;
        break;
      case 'check':
        showCutInAnimation('check');
        break;
      case 'call':
        showCutInAnimation('call');
        const maxBet = Math.max(...players.map(p => p.bet));
        const callAmount = maxBet - player.bet;
        player.chips -= callAmount;
        player.bet += callAmount;
        setPot(pot + callAmount);
        break;
      case 'raise':
        showCutInAnimation('raise');
        player.chips -= amount;
        player.bet += amount;
        setPot(pot + amount);
        break;
    }
    
    // 次のプレイヤーへ
    let nextPlayer = (currentPlayer + 1) % players.length;
    
    // アクティブでないプレイヤーをスキップ
    while (!updatedPlayers[nextPlayer].isActive && nextPlayer !== currentPlayer) {
      nextPlayer = (nextPlayer + 1) % players.length;
    }
    
    // 全員のベットが同じか、1人だけ残っているかチェック
    const activePlayers = updatedPlayers.filter(p => p.isActive);
    const allBetsEqual = activePlayers.every(p => p.bet === activePlayers[0].bet);
    
    if (activePlayers.length === 1) {
      showCutInAnimation('win');
      setWinner(activePlayers[0]);
      setGameState('showdown');
      // 勝者にポットを与える
      setPlayers(players.map(player => 
        player.id === activePlayers[0].id 
          ? { ...player, chips: player.chips + pot } 
          : player
      ));
    } else if (allBetsEqual && nextPlayer === 0) {
      // 全員のベットが同じになり、一周した場合は次のラウンドへ
      dealNextRound();
    } else {
      // 次のプレイヤーへ
      setCurrentPlayer(nextPlayer);
    }
    
    setPlayers(updatedPlayers);
  };

  return (
    <div className="app-container">
      <h1>テキサスホールデムポーカー</h1>
      
      <div className="game-status">
        <p>ゲームステータス: {gameState === 'waiting' ? '待機中' : 
                            gameState === 'preFlop' ? 'プリフロップ' : 
                            gameState === 'flop' ? 'フロップ' : 
                            gameState === 'turn' ? 'ターン' : 
                            gameState === 'river' ? 'リバー' : 'ショーダウン'}</p>
        <p>ポット: {pot} チップ</p>
        {winner && <p>勝者: {winner.name}!</p>}
      </div>
      
      <PokerTable 
        communityCards={communityCards}
        players={players}
        currentPlayer={currentPlayer}
      />
      
      <div className="player-controls">
        <PlayerInfo 
          player={players[0]} 
          isCurrentPlayer={currentPlayer === 0 && gameState !== 'waiting' && gameState !== 'showdown'}
        />
        
        {gameState === 'waiting' ? (
          <button onClick={startGame}>ゲーム開始</button>
        ) : gameState === 'showdown' ? (
          <button onClick={startGame}>新しいゲーム</button>
        ) : currentPlayer === 0 ? (
          <GameControls onAction={playerAction} />
        ) : (
          <p>CPUのターンです... ({players[currentPlayer].name})</p>
        )}
      </div>
      
      <CutIn type={cutInType!} isVisible={showCutIn} />
    </div>
  );
}

export default App; 