import { useEffect, useRef, useState } from 'react';
import { Clock } from './Icons.jsx';

const fmt = (s) => (s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} min e ${s % 60} s` : s === 60 ? '1 minuto' : `${s / 60} minutos`) : `${s} segundos`);

// Aviso antes de começar: quanto tempo tem e o que fazer. O cronômetro só anda depois de "Começar".
export function TimeIntro({ seconds, title, children, onStart, accent = 'var(--magenta)' }) {
  const btn = useRef(null);
  useEffect(() => { btn.current?.focus(); }, []);
  return (
    <div className="time-intro-backdrop">
      <div className="time-intro" role="dialog" aria-modal="true" aria-labelledby="time-intro-title">
        <div className="time-intro-clock" style={{ color: accent }}><Clock size={30} /><span>{fmt(seconds)}</span></div>
        <h2 id="time-intro-title" className="time-intro-title">{title}</h2>
        <div className="time-intro-body">{children}</div>
        <button ref={btn} className="btn btn-primary" onClick={onStart}>Começar · {fmt(seconds)}</button>
      </div>
    </div>
  );
}

// Avisos durante o tempo: na metade, aos 10 segundos e quando acaba.
export function TimeToast({ timer, total }) {
  const [msg, setMsg] = useState('');
  const shown = useRef(new Set());
  useEffect(() => {
    const t = timer.time;
    const say = (k, m) => { if (!shown.current.has(k)) { shown.current.add(k); setMsg(m); } };
    if (timer.done) say('fim', 'Tempo esgotado! Agora é só salvar.');
    else if (t === 10 && total > 10) say('10', 'Faltam 10 segundos!');
    else if (total >= 60 && t === Math.floor(total / 2)) say('meio', `Metade do tempo: falta ${fmt(t)}.`);
  }, [timer.time, timer.done, total]);
  useEffect(() => {
    if (!msg || msg.startsWith('Tempo esgotado')) return undefined;
    const id = setTimeout(() => setMsg(''), 2600);
    return () => clearTimeout(id);
  }, [msg]);
  if (!msg) return null;
  return <div className={'time-toast' + (timer.done ? ' end' : '')} role="alert">{msg}</div>;
}
