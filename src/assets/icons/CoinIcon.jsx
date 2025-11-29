// src/assets/icons/CoinIcon.jsx
import React from 'react';

const CoinIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* حلقه طلایی بیرونی */}
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#D4AF37" strokeWidth="1.5"/>
    
    {/* طرح داخلی سکه */}
    <circle cx="12" cy="12" r="7" fill="url(#innerGradient)" stroke="#B8860B" strokeWidth="1"/>
    
    {/* علامت WE در وسط */}
    <text 
      x="12" 
      y="14" 
      textAnchor="middle" 
      fill="#8B7500" 
      fontSize="6" 
      fontFamily="Arial, sans-serif" 
      fontWeight="bold"
    >
      WE
    </text>
    
    {/* خطوط تزئینی */}
    <circle cx="12" cy="12" r="5" stroke="#FFD700" strokeWidth="0.5" fill="none"/>
    <circle cx="12" cy="12" r="3" stroke="#FFD700" strokeWidth="0.5" fill="none"/>
    
    {/* گرادیان‌ها */}
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700"/>
        <stop offset="50%" stopColor="#D4AF37"/>
        <stop offset="100%" stopColor="#B8860B"/>
      </linearGradient>
      
      <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF8DC"/>
        <stop offset="100%" stopColor="#FFEBCD"/>
      </linearGradient>
    </defs>
  </svg>
);

export default CoinIcon;