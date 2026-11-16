import Avatar from '../components/Avatar.jsx';
import SentDrawing from '../components/SentDrawing.jsx';

// Depois de enviar o redesenho: agora a outra pessoa decide.
export default function Sent({ partner, sent, onContinue }) {
  return (
    <div className="screen narrow center col gap-16" style={{ padding: 32 }}>
      <div className="display" style={{ fontSize: 44, lineHeight: 1, color: 'var(--magenta)' }}>TRAÇO ENVIADO!</div>
      <div className="row gap-12">
        <SentDrawing sent={sent} label="Seu traço" />
        <div className="col center gap-6">
          <div className="portrait" style={{ width: 130, height: 150, borderRadius: 22 }}><Avatar a={partner.av} width={124} /></div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Autorretrato de {partner.name}</span>
        </div>
      </div>
      <p className="sub" style={{ fontSize: 15, maxWidth: 340 }}>
        Agora {partner.name} vai ver o seu desenho e decidir se você captou a essência. Se aprovar, a conversa aparece em <strong>Conversas</strong>.
      </p>
      <button className="btn btn-primary" onClick={onContinue}>Continuar descobrindo</button>
    </div>
  );
}
