import { useEffect, useState } from 'react';

// Cronômetro regressivo em segundos. Reinicia quando "key" muda.
// Só começa a contar quando "running" for true (depois do aviso de "Começar").
export default function useCountdown(seconds, key, running = true) {
  const [time, setTime] = useState(seconds);
  useEffect(() => { setTime(seconds); }, [seconds, key]);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTime((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running, seconds, key]);
  const label = Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0');
  return { time, label, done: running && time === 0, low: running && time <= 10 };
}
