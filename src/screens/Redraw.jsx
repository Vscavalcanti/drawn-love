import { useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import AvatarEditor, { ColorPicker } from '../components/AvatarEditor.jsx';
import FreeCanvas from '../components/FreeCanvas.jsx';
import useCountdown from '../components/useCountdown.js';
import { blankBase } from '../data/avatarOptions.js';
import useIsDesktop from '../components/useIsDesktop.js';

// 4 · REDESENHE E CONECTE: para dar match, a pessoa redesenha o outro
// com traço livre ou pintando a base. Tempo: 30 segundos.
export default function Redraw({ partner, onSend }) {
  const [mode, setMode] = useState('livre');
  const [color, setColor] = useState('#2B2B2B');
  const [brush, setBrush] = useState(6);
  const [rd, setRd] = useState(() => blankBase(partner.head));
  const canvas = useRef(null);
  const timer = useCountdown(30, partner.id);
  const desktop = useIsDesktop();

  const send = () => {
    if (mode === 'livre') onSend({ mode, image: canvas.current?.toDataURL() });
    else onSend({ mode, avatar: rd });
  };

  return (
    <div className="screen col gap-10" style={{ padding: '18px 20px 22px' }}>
      <div className="row between">
        <div className="step-tag" style={{ color: 'var(--roxo)' }}>4 · REDESENHE E CONECTE</div>
        <div className={'timer' + (timer.low ? ' low' : '')}>{timer.label}</div>
      </div>
      <div className="work">
      <div className="col-a">
      <div className="row gap-12">
        <div className="portrait" style={{ width: 84, height: 84, borderRadius: 18 }}><Avatar a={partner.av} width={78} /></div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--magenta)' }}>Redesenhe {partner.name}</strong> do seu jeito. Ela(e) decide se você captou a essência.
        </p>
      </div>
      <div className="segment">
        <button className={mode === 'livre' ? 'on' : ''} onClick={() => setMode('livre')}>Traço livre</button>
        <button className={mode === 'base' ? 'on' : ''} onClick={() => setMode('base')}>Com a base</button>
      </div>

      {/* A tela de desenho fica sempre montada (só escondida) para não perder o traço ao trocar de modo */}
      <div style={{ display: mode === 'livre' ? 'flex' : 'none', flex: 1, minHeight: 0 }}>
        <FreeCanvas ref={canvas} color={color} brush={brush} locked={timer.done} />
      </div>
      {mode === 'base' && (
        <div style={{ flex: 1, minHeight: 0, background: '#fff', borderRadius: 24, border: '3px dashed var(--roxo)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
          <Avatar a={rd} width={desktop ? 340 : 200} onPaint={(part) => !timer.done && setRd({ ...rd, [part]: color })} />
        </div>
      )}
      </div>

      <div className="col-b">
      {mode === 'livre' ? (
        <>
          <ColorPicker color={color} setColor={setColor} />
          <div className="row wrap gap-6">
            {[[3, 'Fino'], [6, 'Médio'], [12, 'Grosso']].map(([w, label]) => (
              <button key={w} className={'pill' + (brush === w ? ' on' : '')} onClick={() => setBrush(w)}>{label}</button>
            ))}
            <button className="pill dashed" onClick={() => canvas.current.undo()}>Desfazer</button>
            <button className="pill dashed" onClick={() => canvas.current.clear()}>Limpar</button>
          </div>
        </>
      ) : (
        <AvatarEditor value={rd} onChange={setRd} color={color} setColor={setColor} locked={timer.done} />
      )}

      <button className="btn btn-primary" onClick={send}>Enviar meu traço</button>
      </div>
      </div>
    </div>
  );
}
