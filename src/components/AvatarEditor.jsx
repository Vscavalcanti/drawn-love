import { useState } from 'react';
import Avatar from './Avatar.jsx';
import { COLORS, SKINS, STYLE_TABS, EDITOR_TABS } from '../data/avatarOptions.js';

// Abas de edição: cores, pele, cabelo, olhos, boca, roupa e acessório.
// "value" é o personagem; "onChange" recebe o personagem atualizado;
// "color"/"setColor" é a cor escolhida para pintar; "locked" trava quando o tempo acaba.
export default function AvatarEditor({ value, onChange, color, setColor, locked }) {
  const [tab, setTab] = useState('cores');
  const set = (key, v) => { if (!locked) onChange({ ...value, [key]: v }); };
  const paint = (part) => set(part, color);
  const style = STYLE_TABS[tab];

  return (
    <>
      <div className="tabs">
        {EDITOR_TABS.map(([id, label]) => (
          <button key={id} className={'pill' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div className="editor-panel">
        {tab === 'cores' && (
          <div className="col gap-10">
            <div style={{ fontSize: 12, color: 'var(--cinza)' }}>Escolha a cor e toque no personagem ou numa parte abaixo.</div>
            <ColorPicker color={color} setColor={setColor} />
            <div className="row wrap gap-6">
              {[['hair', 'cabelo'], ['shirt', 'roupa'], ['accent', 'detalhe'], ['hat', 'acessório']].map(([part, label]) => (
                <button key={part} className="pill" onClick={() => paint(part)}>Pintar {label}</button>
              ))}
            </div>
          </div>
        )}

        {tab === 'pele' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {SKINS.map((s) => (
              <button key={s.hex} aria-label={'Pele ' + s.label} onClick={() => set('skin', s.hex)}
                className={'swatch' + (value.skin === s.hex ? ' on' : '')} style={{ background: s.hex }} />
            ))}
          </div>
        )}

        {style && (
          <div className="opt-grid">
            {style.options.map(([id, label]) => (
              <button key={id} aria-label={label} className={'opt' + (value[style.key] === id ? ' on' : '')} onClick={() => set(style.key, id)}>
                <div className="opt-thumb"><div style={{ top: style.offset }}><Avatar a={{ ...value, [style.key]: id }} width={120} /></div></div>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function ColorPicker({ color, setColor }) {
  return (
    <div className="swatches">
      {COLORS.map((c) => (
        <button key={c.hex} aria-label={'Cor ' + c.label} onClick={() => setColor(c.hex)}
          className={'swatch' + (color === c.hex ? ' on' : '')} style={{ background: c.hex }} />
      ))}
    </div>
  );
}
