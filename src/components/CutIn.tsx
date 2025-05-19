import React from 'react';
import './CutIn.css';

type CutInType = 'check' | 'raise' | 'call' | 'bet' | 'win';

interface CutInProps {
  type: CutInType;
  isVisible: boolean;
}

const CutIn: React.FC<CutInProps> = ({ type, isVisible }) => {
  if (!isVisible) return null;

  // GitHub Pagesのベースパス
  const basePath = '/texas-holdem-poker/';

  const getCutInImage = () => {
    switch (type) {
      case 'check':
        return `${basePath}images/cutin/check.png`;
      case 'raise':
        return `${basePath}images/cutin/raise.png`;
      case 'call':
        return `${basePath}images/cutin/call.png`;
      case 'bet':
        return `${basePath}images/cutin/bet.png`;
      case 'win':
        return `${basePath}images/cutin/win.png`;
      default:
        return '';
    }
  };

  return (
    <div className={`cut-in ${type}`}>
      <img src={getCutInImage()} alt={`${type} cut-in`} />
    </div>
  );
};

export default CutIn; 