/**
 * Componente con iconos deportivos SVG personalizados y visibles
 * Incluye: balón de soccer, balón de basketball, pompones de porrista
 */

export function SoccerBallIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo exterior blanco */}
      <circle cx="50" cy="50" r="48" fill="white" stroke="currentColor" strokeWidth="2" />
      
      {/* Patrón de pentágonos y hexágonos típico del balón de soccer */}
      {/* Pentágonos negros */}
      <polygon points="50,15 60,28 55,40 45,40 40,28" fill="currentColor" />
      <polygon points="85,35 80,48 70,45 75,32" fill="currentColor" />
      <polygon points="15,35 25,32 30,45 20,48" fill="currentColor" />
      <polygon points="50,85 60,72 55,60 45,60 40,72" fill="currentColor" />
      <polygon points="85,65 80,52 70,55 75,68" fill="currentColor" />
      <polygon points="15,65 25,68 30,55 20,52" fill="currentColor" />
      
      {/* Hexágonos blancos con borde */}
      <polygon points="50,28 60,35 60,50 50,57 40,50 40,35" fill="white" stroke="currentColor" strokeWidth="1" />
      <polygon points="70,40 80,45 80,60 70,65 60,60 60,45" fill="white" stroke="currentColor" strokeWidth="1" />
      <polygon points="30,40 40,35 50,40 50,55 40,60 30,55" fill="white" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function BasketballIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo exterior naranja */}
      <circle cx="50" cy="50" r="48" fill="currentColor" stroke="white" strokeWidth="2" />
      
      {/* Líneas características del basketball */}
      {/* Línea vertical central */}
      <line x1="50" y1="5" x2="50" y2="95" stroke="white" strokeWidth="2" />
      
      {/* Líneas horizontales curvas (arcos) */}
      <path d="M 20 50 Q 50 35 80 50" stroke="white" strokeWidth="2" fill="none" />
      <path d="M 20 50 Q 50 65 80 50" stroke="white" strokeWidth="2" fill="none" />
      
      {/* Línea ecuatorial */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1.5" />
      
      {/* Pequeños puntos decorativos */}
      <circle cx="35" cy="50" r="2" fill="white" />
      <circle cx="65" cy="50" r="2" fill="white" />
    </svg>
  );
}

export function PompomsIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pompones izquierdo (rojo) */}
      <circle cx="30" cy="25" r="12" fill="currentColor" />
      <circle cx="20" cy="35" r="10" fill="currentColor" />
      <circle cx="25" cy="48" r="11" fill="currentColor" />
      <circle cx="35" cy="55" r="9" fill="currentColor" />
      <circle cx="45" cy="50" r="10" fill="currentColor" />
      <circle cx="40" cy="38" r="11" fill="currentColor" />
      <circle cx="35" cy="25" r="10" fill="currentColor" />
      
      {/* Mango izquierdo */}
      <rect x="28" y="55" width="4" height="35" fill="currentColor" rx="2" />
      
      {/* Pompones derecho (amarillo/naranja) */}
      <circle cx="70" cy="25" r="12" fill="currentColor" />
      <circle cx="80" cy="35" r="10" fill="currentColor" />
      <circle cx="75" cy="48" r="11" fill="currentColor" />
      <circle cx="65" cy="55" r="9" fill="currentColor" />
      <circle cx="55" cy="50" r="10" fill="currentColor" />
      <circle cx="60" cy="38" r="11" fill="currentColor" />
      <circle cx="65" cy="25" r="10" fill="currentColor" />
      
      {/* Mango derecho */}
      <rect x="68" y="55" width="4" height="35" fill="currentColor" rx="2" />
    </svg>
  );
}
