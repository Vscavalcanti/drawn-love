// Personagem desenhado no estilo cartoon (traço preto grosso).
// Recebe "a" com as escolhas do personagem e, opcionalmente, "onPaint"
// para pintar a parte clicada (cabelo, roupa, detalhe, acessório, pele).

const INK = '#1E1A22';

export default function Avatar({ a, width = 240, onPaint }) {
  const head = a.head || 'f';
  const p = (part) => (onPaint ? { onClick: () => onPaint(part), style: { cursor: 'pointer' } } : {});
  const hair = p('hair'), shirt = p('shirt'), accent = p('accent'), hat = p('hat'), skin = p('skin');
  const is = (k, v) => a[k] === v;

  return (
    <svg viewBox="0 0 200 220" width={width} height={Math.round(width * 1.1)} role="img" aria-label="Personagem desenhado">
      {/* cabelo de trás */}
      {is('hairStyle', 'franja') && (
        <path {...hair} d="M140 96 C178 98 186 146 164 176 C160 156 154 136 136 120 Z" fill={a.hair} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      )}
      {is('hairStyle', 'longo') && (
        <path {...hair} d="M46 108 C38 62 70 42 100 42 C130 42 162 62 154 108 L160 196 C134 204 66 204 40 196 Z" fill={a.hair} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      )}
      {is('hairStyle', 'cacheado') && (
        <g {...hair} fill={a.hair} stroke={INK} strokeWidth="5">
          <circle cx="56" cy="132" r="22" /><circle cx="144" cy="132" r="22" /><circle cx="60" cy="96" r="30" />
          <circle cx="140" cy="96" r="30" /><circle cx="78" cy="62" r="28" /><circle cx="122" cy="62" r="28" /><circle cx="100" cy="50" r="28" />
        </g>
      )}
      {is('hairStyle', 'coque') && <circle {...hair} cx="100" cy="44" r="22" fill={a.hair} stroke={INK} strokeWidth="5" />}

      {/* pescoço */}
      <rect {...skin} x="88" y="144" width="24" height="28" fill={a.skin} stroke={INK} strokeWidth="5" />

      {/* roupas */}
      {is('outfit', 'avental') && (
        <g>
          <path {...shirt} d="M34 224 C36 184 64 166 100 166 C136 166 164 184 166 224 Z" fill={a.shirt} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path {...accent} d="M76 180 L124 180 L130 224 L70 224 Z" fill={a.accent} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M86 204 L114 204 M80 180 L72 171 M120 180 L128 171" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M86 169 L100 181 L114 169" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        </g>
      )}
      {is('outfit', 'jaqueta') && (
        <g>
          <path {...shirt} d="M34 224 C36 184 64 166 100 166 C136 166 164 184 166 224 Z" fill={a.shirt} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path {...accent} d="M34 224 C36 186 58 170 84 167 L94 224 Z" fill={a.accent} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path {...accent} d="M166 224 C164 186 142 170 116 167 L106 224 Z" fill={a.accent} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M86 168 Q100 180 114 168" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {is('outfit', 'camiseta') && (
        <g>
          <path {...shirt} d="M34 224 C36 184 64 166 100 166 C136 166 164 184 166 224 Z" fill={a.shirt} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M84 168 Q100 184 116 168" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path {...accent} d="M100 210 C86 201 85 191 92 189 C96 188 99 191 100 194 C101 191 104 188 108 189 C115 191 114 201 100 210 Z" fill={a.accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </g>
      )}
      {is('outfit', 'moletom') && (
        <g>
          <path {...accent} d="M58 178 C56 148 144 148 142 178 C124 170 76 170 58 178 Z" fill={a.accent} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path {...shirt} d="M34 224 C36 186 62 170 100 170 C138 170 164 186 166 224 Z" fill={a.shirt} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path {...accent} d="M78 204 L122 204 L126 224 L74 224 Z" fill={a.accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M92 176 L90 196 M108 176 L110 196" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="90" cy="198" r="3" fill={INK} /><circle cx="110" cy="198" r="3" fill={INK} />
        </g>
      )}

      {/* orelhas e cabeça */}
      <circle {...skin} cx="52" cy="116" r="11" fill={a.skin} stroke={INK} strokeWidth="5" />
      <circle {...skin} cx="148" cy="116" r="11" fill={a.skin} stroke={INK} strokeWidth="5" />
      {head === 'm' ? (
        <path {...skin} d="M52 106 C52 64 148 64 148 106 C148 146 128 160 100 160 C72 160 52 146 52 106 Z" fill={a.skin} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      ) : (
        <ellipse {...skin} cx="100" cy="112" rx="50" ry="47" fill={a.skin} stroke={INK} strokeWidth="5" />
      )}

      {/* cabelo da frente */}
      {is('hairStyle', 'franja') && (
        <g {...hair} fill={a.hair} stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M48 118 C40 66 82 44 120 52 C148 58 162 84 152 120 C148 104 140 92 128 86 C116 100 88 104 66 92 C58 100 52 108 48 118 Z" />
          <path d="M50 104 C46 124 48 140 56 152 C58 134 58 120 62 108 Z" strokeWidth="4" />
        </g>
      )}
      {is('hairStyle', 'topete') && (
        <g {...hair} fill={a.hair} stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M48 112 C40 70 66 46 100 46 C136 46 160 70 152 112 C148 98 142 90 134 86 C128 96 116 98 108 90 C102 98 88 98 82 90 C74 98 62 98 56 94 C52 100 50 106 48 112 Z" />
          <path d="M92 50 C98 30 122 26 134 38 C120 38 110 44 104 56 Z" />
          <path d="M52 98 L52 124 L59 119 L59 96 Z" strokeWidth="4" />
          <path d="M148 98 L148 124 L141 119 L141 96 Z" strokeWidth="4" />
        </g>
      )}
      {is('hairStyle', 'curto') && (
        <g {...hair}>
          <path d="M48 112 C42 68 70 50 102 50 C136 50 160 70 152 112 C146 94 128 80 100 80 C84 80 72 86 64 94 C58 98 52 104 48 112 Z" fill={a.hair} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M98 54 C92 64 82 72 68 80" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {is('hairStyle', 'longo') && (
        <path {...hair} d="M48 122 C40 68 72 46 100 46 C128 46 160 68 152 122 C146 98 128 82 104 80 L100 92 L96 80 C72 82 54 98 48 122 Z" fill={a.hair} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      )}
      {is('hairStyle', 'cacheado') && (
        <g {...hair} fill={a.hair} stroke={INK} strokeWidth="4">
          <circle cx="58" cy="90" r="11" /><circle cx="68" cy="74" r="14" /><circle cx="86" cy="66" r="15" />
          <circle cx="106" cy="63" r="15" /><circle cx="125" cy="68" r="14" /><circle cx="140" cy="82" r="12" />
        </g>
      )}
      {is('hairStyle', 'coque') && (
        <path {...hair} d="M50 112 C46 70 72 54 100 54 C128 54 154 70 150 112 C144 90 124 76 100 76 C76 76 56 90 50 112 Z" fill={a.hair} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      )}
      {is('hairStyle', 'careca') && (
        <path d="M74 82 Q86 72 100 74" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      )}

      <Eyes type={a.eyes} />

      {/* bochechas e nariz */}
      <ellipse cx="70" cy="131" rx="9" ry="5.5" fill="#F48FAE" opacity="0.7" />
      <ellipse cx="130" cy="131" rx="9" ry="5.5" fill="#F48FAE" opacity="0.7" />
      <path d="M99 121 Q103 125 98 127" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />

      <Mouth type={a.mouth} />
      <Accessory type={a.acc} color={a.hat} paint={hat} />
    </svg>
  );
}

const BROWS = 'M74 99 Q82 94 90 98 M110 98 Q118 94 126 99';

function Pupils({ left = true, right = true }) {
  return (
    <>
      {left && <><ellipse cx="82" cy="115" rx="6" ry="8" fill={INK} /><circle cx="84" cy="112" r="2.3" fill="#FFFFFF" /></>}
      {right && <><ellipse cx="118" cy="115" rx="6" ry="8" fill={INK} /><circle cx="120" cy="112" r="2.3" fill="#FFFFFF" /></>}
    </>
  );
}

function Eyes({ type }) {
  const brow = (d = BROWS) => <path d={d} fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />;
  switch (type) {
    case 'cilios':
      return (<g>{brow()}<Pupils /><path d="M76 109 L70 105 M77 113 L70 112 M124 109 L130 105 M123 113 L130 112" stroke={INK} strokeWidth="3" strokeLinecap="round" /></g>);
    case 'feliz':
      return (<g fill="none" stroke={INK} strokeLinecap="round">
        <path d="M74 96 Q82 90 90 95 M110 95 Q118 90 126 96" strokeWidth="3.5" />
        <path d="M74 119 Q82 106 90 119 M110 119 Q118 106 126 119" strokeWidth="5" /></g>);
    case 'piscando':
      return (<g>{brow('M74 99 Q82 94 90 98 M110 96 Q118 92 126 97')}<Pupils right={false} />
        <path d="M110 114 Q118 122 126 114" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" /></g>);
    case 'apaixonado':
      return (<g>{brow('M74 97 Q82 92 90 96 M110 96 Q118 92 126 97')}
        <path d="M82 124 C71 116 70 108 76 105 C79 104 81 106 82 108 C83 106 85 104 88 105 C94 108 93 116 82 124 Z" fill="#E0457B" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M118 124 C107 116 106 108 112 105 C115 104 117 106 118 108 C119 106 121 104 124 105 C130 108 129 116 118 124 Z" fill="#E0457B" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /></g>);
    case 'sono':
      return (<g>{brow('M74 103 L90 104 M110 104 L126 103')}
        <path d="M74 114 Q82 124 90 114 Z M110 114 Q118 124 126 114 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" /></g>);
    case 'surpreso':
      return (<g>{brow('M73 94 Q82 86 91 93 M109 93 Q118 86 127 94')}
        <circle cx="82" cy="114" r="9" fill="#FFFFFF" stroke={INK} strokeWidth="4" /><circle cx="118" cy="114" r="9" fill="#FFFFFF" stroke={INK} strokeWidth="4" />
        <circle cx="82" cy="114" r="3.5" fill={INK} /><circle cx="118" cy="114" r="3.5" fill={INK} /></g>);
    default:
      return (<g>{brow()}<Pupils /></g>);
  }
}

function Mouth({ type }) {
  switch (type) {
    case 'lado':
      return <path d="M86 133 Q102 147 116 130 M116 130 L119 127" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
    case 'lingua':
      return (<g><path d="M88 134 Q100 144 112 134" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M97 139 Q98 152 105 150 Q109 146 105 139 Z" fill="#F26B91" stroke={INK} strokeWidth="3" strokeLinejoin="round" /></g>);
    case 'o':
      return <ellipse cx="100" cy="139" rx="6" ry="8" fill={INK} />;
    case 'neutra':
      return <path d="M90 138 L110 138" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
    case 'gato':
      return <path d="M88 134 Q94 141 100 134 Q106 141 112 134" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />;
    case 'dentes':
      return (<g><path d="M86 132 Q100 154 114 132 Z" fill="#FFFFFF" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M88 136 L112 136 M100 133 L100 141" stroke={INK} strokeWidth="2" /></g>);
    default:
      return (<g><path d="M88 134 Q100 149 112 134 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M94 141 Q100 138 106 141 Q100 146 94 141 Z" fill="#F26B91" /></g>);
  }
}

function Accessory({ type, color, paint }) {
  switch (type) {
    case 'boina':
      return (<g {...paint}>
        <path d="M50 80 C46 40 148 30 158 74 C128 66 84 66 50 80 Z" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M44 82 C84 68 134 68 164 78 C150 92 70 96 44 82 Z" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M80 52 L84 68 M104 46 L104 64 M128 50 L124 66" stroke={INK} strokeWidth="4" strokeLinecap="round" /></g>);
    case 'bone':
      return (<g {...paint}>
        <path d="M150 86 C164 84 180 90 184 100 C166 102 154 98 146 92 Z" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M50 88 C46 48 154 48 150 88 C120 78 80 78 50 88 Z" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M70 73 C90 67 112 67 132 73" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="55" r="4.5" fill={INK} /></g>);
    case 'gorro':
      return (<g {...paint}>
        <path d="M52 90 C48 44 152 44 148 90 Z" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M46 96 C70 84 130 84 154 96 L152 82 C128 70 72 70 48 82 Z" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="100" cy="40" r="10" fill={color} stroke={INK} strokeWidth="4" /></g>);
    case 'laco':
      return (<g {...paint} fill={color} stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M74 64 L52 50 L54 80 Z" /><path d="M74 64 L96 50 L94 80 Z" /><circle cx="74" cy="65" r="7" /></g>);
    case 'oculos':
      return (<g {...paint} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round">
        <circle cx="82" cy="115" r="14" /><circle cx="118" cy="115" r="14" />
        <path d="M96 113 Q100 109 104 113 M68 112 L55 108 M132 112 L145 108" /></g>);
    case 'flor':
      return (<g {...paint}>
        <g fill={color} stroke={INK} strokeWidth="3">
          <circle cx="146" cy="74" r="8" /><circle cx="157" cy="82" r="8" /><circle cx="153" cy="95" r="8" />
          <circle cx="139" cy="95" r="8" /><circle cx="135" cy="82" r="8" /></g>
        <circle cx="146" cy="85" r="6" fill="#F7D046" stroke={INK} strokeWidth="3" /></g>);
    default:
      return null;
  }
}
