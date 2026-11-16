import Avatar from '../components/Avatar.jsx';
import SentDrawing from '../components/SentDrawing.jsx';

// Aparece para quem aprovou o redesenho.
export default function Match({ partner, sent, onChat, onContinue }) {
  return (
    <div className="screen center col gap-16" style={{ background: 'var(--roxo)', color: 'var(--creme)', padding: 32 }}>
      <div className="display" style={{ fontSize: 58, lineHeight: 1 }}>É UM MATCH!</div>
      <div className="row gap-12">
        <SentDrawing sent={sent} label={'Você por ' + partner.name} light />
        <div className="col center gap-6">
          <div style={{ width: 130, height: 150, borderRadius: 22, border: '3px solid var(--creme)', background: 'var(--rosa)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
            <Avatar a={partner.av} width={124} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Autorretrato de {partner.name}</span>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.45, maxWidth: 360 }}>Você aprovou o traço de {partner.name}. Agora é conversar de verdade por 15 dias para abrir a galeria.</p>
      <div className="col gap-12" style={{ width: '100%', maxWidth: 420 }}>
        <button className="btn" style={{ background: 'var(--creme)', color: 'var(--magenta)' }} onClick={onChat}>Começar a conversa</button>
        <button className="btn" style={{ background: 'transparent', color: 'var(--creme)', border: '2px solid var(--creme)', minHeight: 48 }} onClick={onContinue}>Continuar descobrindo</button>
      </div>
    </div>
  );
}
