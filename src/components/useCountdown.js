import { useEffect, useState } from 'react';

// Cronômetro regressivo em segundos. Reinicia quando "key" muda.
export default function useCountdown(seconds, key) {
  const [time, setTime] = useState(seconds);
  useEffect(() => {
    setTime(seconds);
    const id = setInterval(() => setTime((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [seconds, key]);
  const label = Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0');
  return { time, label, done: time === 0, low: time <= 10 };
}
