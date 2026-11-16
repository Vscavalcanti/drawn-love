import { useLayoutEffect, useRef, useState } from 'react';

const INK = '#1E1A22';
// Contorno do coração, desenhado a partir da ponta de baixo
const HEART = 'M50 82 C30 68 14 56 14 38 C14 26 23 18 33 18 C41 18 47 23 50 30 C53 23 59 18 67 18 C77 18 86 26 86 38 C86 56 70 68 50 82 Z';

// Mascote da sequência: um lápis desenhando um coração no caderno.
// progress vai de 0 a 15; mood: 'ok' | 'espera' | 'pendente' | 'curta' | 'zerou'
export default function Mascot({ progress = 0, mood = 'pendente', size = 64 }) {
  const pathRef = useRef(null);
  const [len, setLen] = useState(0);
  const [tip, setTip] = useState({ x: 50, y: 82 });
  const done = progress >= 15;
  const frac = Math.min(progress, 15) / 15;

  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const total = p.getTotalLength();
    setLen(total);
    const pt = p.getPointAtLength(total * frac);
    setTip({ x: pt.x, y: pt.y });
  }, [frac]);

  const sad = mood === 'zerou';
  const worried = mood === 'curta' || mood === 'pendente' || mood === 'espera';

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img"
      aria-label={done ? 'Coração completo: galeria liberada' : `Coração ${Math.round(frac * 100)}% desenhado`}>
      {/* caderno */}
      <rect x="6" y="8" width="96" height="104" rx="8" fill="#FFFFFF" stroke={INK} strokeWidth="4" />
      {[30, 46, 62, 78, 94].map((y) => <line key={y} x1="20" y1={y} x2="96" y2={y} stroke="#BFD3EE" strokeWidth="2" />)}
      <line x1="22" y1="12" x2="22" y2="108" stroke="#F4A3B9" strokeWidth="2" />
      {[22, 42, 62, 82, 100].map((y) => <circle key={y} cx="6" cy={y} r="4" fill="#FDF2EE" stroke={INK} strokeWidth="3" />)}

      <g transform="translate(8 8)">
        {/* rascunho clarinho do coração inteiro */}
        <path d={HEART} fill="none" stroke="#E7DDEB" strokeWidth="4" strokeDasharray="3 6" strokeLinecap="round" />
        {/* parte já desenhada */}
        {done && <path d={HEART} fill="#F26B91" />}
        <path ref={pathRef} d={HEART} fill="none" stroke="#C93A73" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={len || 1} strokeDashoffset={len ? len * (1 - frac) : 1} style={{ transition: 'stroke-dashoffset .6s ease' }} />
        {done && (
          <g fill="#F7D046" stroke={INK} strokeWidth="2">
            <path d="M88 6 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
            <path d="M6 70 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
          </g>
        )}

        {/* lápis com a ponta onde o traço parou */}
        {!done && (
          <g transform={`translate(${tip.x} ${tip.y}) rotate(-35)`} style={{ transition: 'transform .6s ease' }}>
            <path d="M0 0 L-6 -12 L6 -12 Z" fill="#F6D3B8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M0 0 L-2 -4 L2 -4 Z" fill={INK} />
            <rect x="-8" y="-46" width="16" height="34" rx="2" fill="#F7D046" stroke={INK} strokeWidth="2.5" />
            <rect x="-8" y="-54" width="16" height="9" rx="3" fill="#F26B91" stroke={INK} strokeWidth="2.5" />
            {/* carinha */}
            {sad ? (
              <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round">
                <path d="M-5 -34 l3 2 M5 -34 l-3 2" /><path d="M-3 -24 Q0 -27 3 -24" />
              </g>
            ) : (
              <g>
                <circle cx="-3.5" cy="-33" r="1.8" fill={INK} /><circle cx="3.5" cy="-33" r="1.8" fill={INK} />
                <path d={worried ? 'M-3 -26 L3 -26' : 'M-3.5 -27 Q0 -23 3.5 -27'} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  );
}
