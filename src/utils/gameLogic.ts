import { CardType, PlayerType, HandRank, HandResult } from '../types/gameTypes';

// デッキを生成
const createDeck = (): CardType[] => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
  const deck: CardType[] = [];

  suits.forEach(suit => {
    ranks.forEach((rank, index) => {
      deck.push({
        suit,
        rank,
        value: index + 2 // 2-14
      });
    });
  });

  return deck;
};

// デッキをシャッフル
const shuffleDeck = (deck: CardType[]): CardType[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// カードを配る
export const dealCards = (numPlayers: number, numCommunityCards = 0): { 
  playerHands: CardType[][], 
  communityCards: CardType[],
  communityDeck: CardType[]
} => {
  let deck = shuffleDeck(createDeck());
  const playerHands: CardType[][] = [];
  
  // 各プレイヤーに2枚ずつ配る
  for (let i = 0; i < numPlayers; i++) {
    playerHands.push([deck.pop()!, deck.pop()!]);
  }
  
  // コミュニティカードを配る
  const communityCards: CardType[] = [];
  for (let i = 0; i < numCommunityCards; i++) {
    communityCards.push(deck.pop()!);
  }
  
  return { playerHands, communityCards, communityDeck: deck };
};

// 役の強さを数値で表現
const getHandRankValue = (handRank: HandRank): number => {
  const rankValues: Record<HandRank, number> = {
    'high-card': 1,
    'one-pair': 2,
    'two-pair': 3,
    'three-of-a-kind': 4,
    'straight': 5,
    'flush': 6,
    'full-house': 7,
    'four-of-a-kind': 8,
    'straight-flush': 9,
    'royal-flush': 10
  };
  
  return rankValues[handRank];
};

// ハイカードの価値を計算
const getHighCardValue = (cards: CardType[]): number => {
  // カードの価値を高い順にソート
  const sortedValues = [...cards].sort((a, b) => b.value - a.value);
  
  // 最大5枚のカードから数値を生成
  // 例: A, K, Q, J, 10 → 14 * 10^8 + 13 * 10^6 + 12 * 10^4 + 11 * 10^2 + 10
  let value = 0;
  for (let i = 0; i < Math.min(5, sortedValues.length); i++) {
    value += sortedValues[i].value * Math.pow(10, 8 - i * 2);
  }
  
  return value;
};

// 7枚のカードから最良の5枚を見つけ、役を判定
const evaluateHand = (cards: CardType[]): { handRank: HandRank, handValue: number, bestHand: CardType[] } => {
  if (cards.length < 5) {
    return { handRank: 'high-card', handValue: 0, bestHand: [] };
  }
  
  // カードをランク順にソート（降順）
  const sortedCards = [...cards].sort((a, b) => b.value - a.value);
  
  // フラッシュの確認
  const suitGroups: Record<string, CardType[]> = {};
  for (const card of sortedCards) {
    if (!suitGroups[card.suit]) {
      suitGroups[card.suit] = [];
    }
    suitGroups[card.suit].push(card);
  }
  
  let flush: CardType[] | null = null;
  for (const suit in suitGroups) {
    if (suitGroups[suit].length >= 5) {
      flush = suitGroups[suit].slice(0, 5);
      break;
    }
  }
  
  // ストレートの確認
  let straight: CardType[] | null = null;
  for (let i = 0; i <= sortedCards.length - 5; i++) {
    const possibleStraight = sortedCards.slice(i, i + 5);
    let isStraight = true;
    
    for (let j = 0; j < possibleStraight.length - 1; j++) {
      if (possibleStraight[j].value !== possibleStraight[j + 1].value + 1) {
        isStraight = false;
        break;
      }
    }
    
    if (isStraight) {
      straight = possibleStraight;
      break;
    }
  }
  
  // A, 2, 3, 4, 5 のストレート確認（エースが最小値）
  if (!straight) {
    const aceIndex = sortedCards.findIndex(card => card.value === 14);
    if (aceIndex >= 0) {
      const hasTwo = sortedCards.some(card => card.value === 2);
      const hasThree = sortedCards.some(card => card.value === 3);
      const hasFour = sortedCards.some(card => card.value === 4);
      const hasFive = sortedCards.some(card => card.value === 5);
      
      if (hasTwo && hasThree && hasFour && hasFive) {
        const lowAce = { ...sortedCards[aceIndex], value: 1 };
        straight = [
          sortedCards.find(card => card.value === 5)!,
          sortedCards.find(card => card.value === 4)!,
          sortedCards.find(card => card.value === 3)!,
          sortedCards.find(card => card.value === 2)!,
          lowAce
        ];
      }
    }
  }
  
  // ストレートフラッシュの確認
  let straightFlush: CardType[] | null = null;
  if (flush && straight) {
    const flushSuit = flush[0].suit;
    const sameSuit = straight.every(card => card.suit === flushSuit);
    if (sameSuit) {
      straightFlush = straight;
    }
  }
  
  // ロイヤルフラッシュの確認
  let royalFlush: CardType[] | null = null;
  if (straightFlush && straightFlush[0].value === 14 && straightFlush[4].value === 10) {
    royalFlush = straightFlush;
  }
  
  // ペア、スリーカード、フォーカードの確認
  const rankGroups: Record<number, CardType[]> = {};
  for (const card of sortedCards) {
    if (!rankGroups[card.value]) {
      rankGroups[card.value] = [];
    }
    rankGroups[card.value].push(card);
  }
  
  const pairs: CardType[][] = [];
  let threeOfAKind: CardType[] | null = null;
  let fourOfAKind: CardType[] | null = null;
  
  for (const value in rankGroups) {
    const group = rankGroups[value];
    if (group.length === 2) {
      pairs.push(group);
    } else if (group.length === 3) {
      threeOfAKind = group;
    } else if (group.length === 4) {
      fourOfAKind = group;
    }
  }
  
  // 役の判定と最高のハンドを返す
  if (royalFlush) {
    return { handRank: 'royal-flush', handValue: getHandRankValue('royal-flush') * 1e10, bestHand: royalFlush };
  }
  
  if (straightFlush) {
    return { 
      handRank: 'straight-flush', 
      handValue: getHandRankValue('straight-flush') * 1e10 + getHighCardValue(straightFlush), 
      bestHand: straightFlush 
    };
  }
  
  if (fourOfAKind) {
    const kickers = sortedCards.filter(card => card.value !== fourOfAKind![0].value).slice(0, 1);
    const bestHand = [...fourOfAKind, ...kickers];
    return { 
      handRank: 'four-of-a-kind', 
      handValue: getHandRankValue('four-of-a-kind') * 1e10 + getHighCardValue(bestHand), 
      bestHand 
    };
  }
  
  if (threeOfAKind && pairs.length > 0) {
    const bestHand = [...threeOfAKind, ...pairs[0]];
    return { 
      handRank: 'full-house', 
      handValue: getHandRankValue('full-house') * 1e10 + getHighCardValue(bestHand), 
      bestHand 
    };
  }
  
  if (flush) {
    return { 
      handRank: 'flush', 
      handValue: getHandRankValue('flush') * 1e10 + getHighCardValue(flush), 
      bestHand: flush 
    };
  }
  
  if (straight) {
    return { 
      handRank: 'straight', 
      handValue: getHandRankValue('straight') * 1e10 + getHighCardValue(straight), 
      bestHand: straight 
    };
  }
  
  if (threeOfAKind) {
    const kickers = sortedCards.filter(card => card.value !== threeOfAKind![0].value).slice(0, 2);
    const bestHand = [...threeOfAKind, ...kickers];
    return { 
      handRank: 'three-of-a-kind', 
      handValue: getHandRankValue('three-of-a-kind') * 1e10 + getHighCardValue(bestHand), 
      bestHand 
    };
  }
  
  if (pairs.length >= 2) {
    const bestPairs = pairs.slice(0, 2);
    const pairedValues = new Set(bestPairs.flatMap(pair => pair.map(card => card.value)));
    const kickers = sortedCards.filter(card => !pairedValues.has(card.value)).slice(0, 1);
    const bestHand = [...bestPairs[0], ...bestPairs[1], ...kickers];
    return { 
      handRank: 'two-pair', 
      handValue: getHandRankValue('two-pair') * 1e10 + getHighCardValue(bestHand), 
      bestHand 
    };
  }
  
  if (pairs.length === 1) {
    const kickers = sortedCards.filter(card => card.value !== pairs[0][0].value).slice(0, 3);
    const bestHand = [...pairs[0], ...kickers];
    return { 
      handRank: 'one-pair', 
      handValue: getHandRankValue('one-pair') * 1e10 + getHighCardValue(bestHand), 
      bestHand 
    };
  }
  
  // ハイカード
  const bestHand = sortedCards.slice(0, 5);
  return { 
    handRank: 'high-card', 
    handValue: getHandRankValue('high-card') * 1e10 + getHighCardValue(bestHand), 
    bestHand 
  };
};

// 各プレイヤーの手札を評価し、勝者を決定
export const evaluateHands = (players: PlayerType[], communityCards: CardType[]): PlayerType => {
  const results: HandResult[] = [];
  
  // アクティブなプレイヤーだけを評価
  const activePlayers = players.filter(player => player.isActive);
  
  for (const player of activePlayers) {
    const allCards = [...player.hand, ...communityCards];
    const { handRank, handValue, bestHand } = evaluateHand(allCards);
    
    results.push({
      player,
      handRank,
      handValue,
      bestHand
    });
  }
  
  // 最高の手を持つプレイヤーを見つける
  results.sort((a, b) => b.handValue - a.handValue);
  
  return results[0].player;
}; 