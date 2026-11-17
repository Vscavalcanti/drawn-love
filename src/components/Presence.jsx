import { useEffect, useState } from 'react';
import { watchUser, presenceInfo } from '../services/api.js';

// Relógio que anda a cada 30 s, para "Online" virar "Visto há 3 min" sem precisar de nova gravação.
function useNow(ms = 30000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

// Última vez que a pessoa estava com o app aberto (users/{uid}.lastSeen), em tempo real.
export function usePresence(uid) {
  const [lastSeen, setLastSeen] = useState(0);
  const now = useNow();
  useEffect(() => (uid ? watchUser(uid, (u) => setLastSeen(u?.lastSeen || 0)) : undefined), [uid]);
  return presenceInfo(lastSeen, now);
}

// Bolinha verde sobre a foto (só aparece quando está online)
export function PresenceDot({ uid, size = 14 }) {
  const p = usePresence(uid);
  if (!p.online) return null;
  return <span className="presence-dot" style={{ width: size, height: size }} role="img" aria-label="Online" />;
}

// Texto embaixo do nome: "Online" ou "Visto há 5 min"
export function PresenceText({ uid }) {
  const p = usePresence(uid);
  if (!p.text) return null;
  return <div className={'presence-text' + (p.online ? ' on' : '')}>{p.online && <span className="presence-mini" aria-hidden="true" />}{p.text}</div>;
}
