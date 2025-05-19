import React from 'react';
import './CutIn.css';

type CutInType = 'check' | 'raise' | 'call' | 'bet' | 'win';

interface CutInProps {
  type: CutInType;
  isVisible: boolean;
}

const CutIn: React.FC<CutInProps> = ({ type, isVisible }) => {
  if (!isVisible) return null;

  const getCutInImage = () => {
    switch (type) {
      case 'check':
        return '/images/cutin/check.png';
      case 'raise':
        return '/images/cutin/raise.png';
      case 'call':
        return '/images/cutin/call.png';
      case 'bet':
        return '/images/cutin/bet.png';
      case 'win':
        return '/images/cutin/win.png';
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