import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Tela em branco para desenhar com traço livre (dedo ou mouse).
// Pelo ref dá para chamar undo(), clear() e toDataURL().
const FreeCanvas = forwardRef(function FreeCanvas({ color, brush, locked }, ref) {
  const canvasRef = useRef(null);
  const strokes = useRef([]);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  const redraw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, c.width, c.height);
    strokes.current.forEach((st) => {
      ctx.strokeStyle = st.color; ctx.lineWidth = st.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      st.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      if (st.pts.length === 1) ctx.lineTo(st.pts[0][0] + 0.1, st.pts[0][1]);
      ctx.stroke();
    });
  };

  useEffect(() => {
    const c = canvasRef.current;
    c.width = c.clientWidth * 2; c.height = c.clientHeight * 2;
    redraw();
  }, []);

  useImperativeHandle(ref, () => ({
    undo: () => { strokes.current.pop(); redraw(); setEmpty(strokes.current.length === 0); },
    clear: () => { strokes.current = []; redraw(); setEmpty(true); },
    // Imagem pequena em JPEG para caber no banco de dados
    toDataURL: () => {
      const src = canvasRef.current, out = document.createElement('canvas');
      const scale = 320 / src.width;
      out.width = 320; out.height = Math.round(src.height * scale);
      out.getContext('2d').drawImage(src, 0, 0, out.width, out.height);
      return out.toDataURL('image/jpeg', 0.7);
    },
  }));

  const pos = (e) => {
    const c = canvasRef.current, r = c.getBoundingClientRect();
    return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height];
  };
  const down = (e) => {
    if (locked) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    strokes.current.push({ color, w: brush * 2, pts: [pos(e)] });
    redraw(); setEmpty(false);
  };
  const move = (e) => {
    if (!drawing.current || locked) return;
    const st = strokes.current[strokes.current.length - 1];
    st.pts.push(pos(e));
    const n = st.pts.length, ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = st.color; ctx.lineWidth = st.w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...st.pts[n - 2]); ctx.lineTo(...st.pts[n - 1]); ctx.stroke();
  };
  const up = () => { drawing.current = false; };

  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#fff', borderRadius: 24, border: '3px dashed var(--roxo)', overflow: 'hidden' }}>
      <canvas ref={canvasRef} aria-label="Área de desenho livre"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', cursor: 'crosshair' }} />
      {empty && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: 'var(--cinza-claro)', fontSize: 14, fontWeight: 600, textAlign: 'center', padding: 24 }}>
          Desenhe aqui com traço livre, usando o dedo ou o mouse
        </div>
      )}
    </div>
  );
});

export default FreeCanvas;
