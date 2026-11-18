import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import AvatarEditor from '../components/AvatarEditor.jsx';
import useCountdown from '../components/useCountdown.js';
import { Clock } from '../components/Icons.jsx';
import useIsDesktop from '../components/useIsDesktop.js';
import { TimeIntro, TimeToast } from '../components/TimeAlert.jsx';

const SECONDS = 60;

// 2 · DESENHE: personaliza o próprio autorretrato em 1 minuto.
export default function Draw({ me, setMe, onDone }) {
  const [color, setColor] = useState('#C93A73');
  const [started, setStarted] = useState(false);
  const timer = useCountdown(SECONDS, 'draw', started);
  const desktop = useIsDesktop();
  const paint = (part) => { if (started && !timer.done) setMe({ ...me, [part]: color }); };

  return (
    <div className="screen col gap-12" style={{ padding: '20px 20px 24px', position: 'relative' }}>
      {!started && (
        <TimeIntro seconds={SECONDS} title="Hora do seu autorretrato" onStart={() => setStarted(true)}>
          <p>Você tem <strong>1 minuto</strong> para deixar o personagem com a sua cara.</p>
          <ul>
            <li>Escolha uma cor e toque nas partes do desenho para pintar.</li>
            <li>Use as abas para trocar rosto, cabelo, olhos, boca, roupa e acessório.</li>
            <li>Quando o tempo acabar, o desenho trava e é só salvar.</li>
          </ul>
        </TimeIntro>
      )}
      <TimeToast timer={timer} total={SECONDS} />
      <div className="row between">
        <div className="step-tag" style={{ color: 'var(--magenta)' }}>2 · DESENHE</div>
        <div className={'timer' + (timer.low ? ' low' : '')}><Clock />{timer.label}</div>
      </div>
      <div className="work">
        <div className="col-a">
          <div className="portrait" style={{ flex: 1, minHeight: 160, paddingTop: 12 }}>
            <Avatar a={me} fit onPaint={paint} />
          </div>
        </div>
        <div className="col-b">
          <AvatarEditor value={me} onChange={setMe} color={color} setColor={setColor} locked={!started || timer.done} />
          <button className="btn btn-primary" onClick={onDone}>{timer.done ? 'Tempo esgotado · salvar traço' : 'Pronto, salvar meu traço'}</button>
        </div>
      </div>
    </div>
  );
}
