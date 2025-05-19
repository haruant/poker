export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type CardType = {
  suit: Suit;
  rank: Rank;
  value: number; // 2-14 (2-10, J=11, Q=12, K=13, A=14)
};

export type PlayerType = {
  id: number;
  name: string;
  chips: number;
  hand: CardType[];
  bet: number;
  isActive: boolean;
  isDealer: boolean;
};

export type GameState = 'waiting' | 'preFlop' | 'flop' | 'turn' | 'river' | 'showdown';

export type HandRank = 
  | 'high-card' 
  | 'one-pair' 
  | 'two-pair' 
  | 'three-of-a-kind' 
  | 'straight' 
  | 'flush' 
  | 'full-house' 
  | 'four-of-a-kind' 
  | 'straight-flush' 
  | 'royal-flush';

export type HandResult = {
  player: PlayerType;
  handRank: HandRank;
  handValue: number;
  bestHand: CardType[];
}; 