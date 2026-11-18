import { useEffect, useState } from 'react';
import Avatar from './Avatar.jsx';
import ProfileSections from './ProfileSections.jsx';
import PortraitGallery from './PortraitGallery.jsx';
import { Back } from './Icons.jsx';
import { watchUser } from '../services/api.js';

// Perfil completo de quem deu match comigo (aberto pelo nome no topo da conversa).
// Inclui os "Desenhos de" (redesenhos que viraram match), que só aparecem depois do match.
export default function PartnerProfile({ uid, name, myName, onClose }) {
  const [u, setU] = useState(undefined);
  useEffect(() => watchUser(uid, (d) => setU(d || null)), [uid]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const p = u?.profile;

  return (
    <div className="partner-profile" role="dialog" aria-modal="true" aria-label={'Perfil de ' + name}>
      <div className="row gap-12" style={{ padding: '16px 16px 10px' }}>
        <button className="icon-btn" aria-label="Voltar para a conversa" onClick={onClose}><Back /></button>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Perfil de {name}</div>
      </div>
      <div className="scroll col gap-12" style={{ padding: '4px 16px 24px' }}>
        {u === undefined && <p className="sub">Carregando perfil…</p>}
        {u === null && <p className="sub">Não consegui abrir esse perfil.</p>}
        {p && (
          <>
            <div className="portrait" style={{ height: 'min(44vh, 320px)', flex: 'none', paddingTop: 16 }}>{u.me && <Avatar a={u.me} fit />}</div>
            <div className="row gap-8" style={{ alignItems: 'baseline', padding: '2px 4px' }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>{p.name}</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: 'var(--cinza)' }}>{p.age}</span>
            </div>
            <ProfileSections p={p} empty="Não informado" afterBio={<PortraitGallery owner={uid} ownerName={p.name} />} />
          </>
        )}
      </div>
    </div>
  );
}
