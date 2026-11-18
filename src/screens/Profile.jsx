import { useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import ProfileSections from '../components/ProfileSections.jsx';
import EditProfile from '../components/EditProfile.jsx';
import PortraitGallery from '../components/PortraitGallery.jsx';

export default function Profile({ uid, me, profile, ans, onSave, onRedraw, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const topRef = useRef(null);
  const toTop = () => topRef.current?.scrollTo?.({ top: 0 });

  const save = async (next) => {
    await onSave(next);
    setEditing(false); setSaved(true); toTop();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div ref={topRef} className="screen scroll" style={{ padding: '18px 16px 24px' }}>
      <div className="cols">
        <div className="col-a">
          <h1 className="h1" style={{ fontSize: 30 }}>{editing ? 'Editar perfil' : 'Meu perfil'}</h1>
          <div className="portrait" style={{ height: 'min(50vh, 340px)', paddingTop: 16 }}><Avatar a={me} fit /></div>
          <div className="row gap-8" style={{ alignItems: 'baseline', padding: '2px 4px' }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{profile.name}</span>
            <span style={{ fontSize: 24, fontWeight: 500, color: 'var(--cinza)' }}>{profile.age}</span>
          </div>
          {saved && <div role="status" className="saved-note">Perfil atualizado ✓</div>}
          {!editing && <button className="btn btn-primary" onClick={() => { setEditing(true); setSaved(false); }}>Editar perfil</button>}
          <button className="btn btn-secondary desktop-only" style={{ borderColor: 'var(--magenta)', color: 'var(--magenta)' }} onClick={onRedraw}>Redesenhar meu autorretrato</button>
        </div>
        <div className="col-b">
          {editing ? (
            <EditProfile ans={ans} onSave={save} onCancel={() => { setEditing(false); toTop(); }} />
          ) : (
            <>
              <ProfileSections p={profile} empty="Não preenchido" afterBio={uid && <PortraitGallery owner={uid} editable />} />
              <button className="btn btn-secondary mobile-only" style={{ borderColor: 'var(--magenta)', color: 'var(--magenta)' }} onClick={onRedraw}>Redesenhar meu autorretrato</button>
              <button className="btn btn-secondary" onClick={onLogout}>Sair da conta</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
