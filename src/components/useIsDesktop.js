import { useEffect, useState } from 'react';

// true quando a tela tem 900px ou mais (mesmo ponto de quebra do CSS)
const QUERY = '(min-width: 900px)';

export default function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}
