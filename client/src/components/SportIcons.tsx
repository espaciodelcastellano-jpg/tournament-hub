import React from 'react';

interface SportIconProps {
  size?: number;
  className?: string;
}

/**
 * Icono de balón de soccer con colores vibrantes
 */
export const SoccerBallIcon: React.FC<SportIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
    {/* Pentágonos negros */}
    <polygon points="12,5 14.5,8.5 11,10 8.5,8.5" fill="currentColor" opacity="0.8" />
    <polygon points="12,19 14.5,15.5 11,14 8.5,15.5" fill="currentColor" opacity="0.8" />
    <polygon points="5,12 8.5,11 10,14.5 7.5,16.5" fill="currentColor" opacity="0.8" />
    <polygon points="19,12 15.5,11 14,14.5 16.5,16.5" fill="currentColor" opacity="0.8" />
    {/* Hexágonos blancos */}
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
  </svg>
);

/**
 * Icono de balón de basketball con colores vibrantes
 */
export const BasketballIcon: React.FC<SportIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
    {/* Líneas horizontales del basketball */}
    <path d="M 12 1 Q 12 12 12 23" stroke="currentColor" strokeWidth="1.5" />
    <path d="M 1 12 Q 12 12 23 12" stroke="currentColor" strokeWidth="1.5" />
    {/* Líneas curvas */}
    <path d="M 5 8 Q 12 5 19 8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <path d="M 5 16 Q 12 19 19 16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
  </svg>
);

/**
 * Icono de pompones de porristas con colores vibrantes
 */
export const CheerleadingPompomsIcon: React.FC<SportIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Pompom izquierdo */}
    <circle cx="6" cy="6" r="4" fill="currentColor" opacity="0.8" />
    <circle cx="4" cy="4" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="8" cy="4" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="4" cy="8" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
    
    {/* Pompom derecho */}
    <circle cx="18" cy="6" r="4" fill="currentColor" opacity="0.8" />
    <circle cx="16" cy="4" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="4" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="16" cy="8" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="8" r="2" fill="currentColor" opacity="0.6" />
    
    {/* Mangos */}
    <line x1="6" y1="10" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" />
    <line x1="18" y1="10" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
    
    {/* Manos */}
    <circle cx="6" cy="19" r="1.5" fill="currentColor" />
    <circle cx="18" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * Componente que muestra el icono del deporte correspondiente
 */
export const SportIconDisplay: React.FC<{
  sport: 'soccer' | 'basketball' | 'cheerleading';
  size?: number;
  className?: string;
}> = ({ sport, size = 24, className = '' }) => {
  switch (sport) {
    case 'soccer':
      return <SoccerBallIcon size={size} className={className} />;
    case 'basketball':
      return <BasketballIcon size={size} className={className} />;
    case 'cheerleading':
      return <CheerleadingPompomsIcon size={size} className={className} />;
    default:
      return null;
  }
};
