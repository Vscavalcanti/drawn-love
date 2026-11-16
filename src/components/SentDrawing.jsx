import Avatar from './Avatar.jsx';

// Mostra um redesenho enviado: imagem do traço livre ou o personagem pintado na base.
export default function SentDrawing({ sent, label, width = 130, height = 150, light }) {
  return (
    <div className="col center gap-6">
      <div style={{ width, height, background: '#fff', borderRadius: 22, border: '3px solid ' + (light ? 'var(--creme)' : 'var(--roxo)'), display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
        {sent?.mode === 'livre'
          ? <img src={sent.image} alt="Desenho em traço livre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : sent?.avatar && <Avatar a={sent.avatar} width={width - 6} />}
      </div>
      {label && <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>}
    </div>
  );
}
