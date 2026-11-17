// Logo do Drawn Love: coração em traço aberto com três pontinhos fechando o desenho.
// Versão rosa (traço magenta + pontos rosa) com o nome pequeno embaixo.

export function HeartMark({ size = 64, line = '#C93A73', dots = '#F26B91', title = 'Drawn Love' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title} style={{ display: 'block', overflow: 'visible' }}>
      <path
        d="M50 86 C32 72 14 59 14 38 C14 25 23 17 34 17 C42 17 47 22 50 29 C53 22 58 17 66 17 C77 17 86 25 86 38 C86 44 85 47.5 82.5 51"
        fill="none" stroke={line} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="74.4" cy="59.8" r="3.4" fill={dots} />
      <circle cx="66.3" cy="68.5" r="3.4" fill={dots} />
      <circle cx="58.1" cy="77.3" r="3.4" fill={dots} />
    </svg>
  );
}

// Coração + nome pequeno embaixo. size = tamanho do coração.
export default function Logo({ size = 96, name = true, nameSize, align = 'center', className = '' }) {
  return (
    <div className={'brand ' + className} style={{ alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      <HeartMark size={size} />
      {name && <span className="brand-name" style={{ fontSize: nameSize || Math.max(13, Math.round(size * 0.2)) }}>Drawn Love</span>}
    </div>
  );
}
