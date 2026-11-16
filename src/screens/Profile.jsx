import Avatar from '../components/Avatar.jsx';
import ProfileSections from '../components/ProfileSections.jsx';

export default function Profile({ me, profile, onRedraw, onLogout }) {
  return (
    <div className="screen scroll" style={{ padding: '18px 16px 24px' }}>
      <div className="cols">
        <div className="col-a">
          <h1 className="h1" style={{ fontSize: 30 }}>Meu perfil</h1>
          <div className="portrait" style={{ height: 300 }}><Avatar a={me} width={250} /></div>
          <div className="row gap-8" style={{ alignItems: 'baseline', padding: '2px 4px' }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{profile.name}</span>
            <span style={{ fontSize: 24, fontWeight: 500, color: 'var(--cinza)' }}>{profile.age}</span>
          </div>
          <button className="btn btn-secondary desktop-only" style={{ borderColor: 'var(--magenta)', color: 'var(--magenta)' }} onClick={onRedraw}>Redesenhar meu autorretrato</button>
        </div>
        <div className="col-b">
          <ProfileSections p={profile} empty="Toque para adicionar" />
          <button className="btn btn-secondary mobile-only" style={{ borderColor: 'var(--magenta)', color: 'var(--magenta)' }} onClick={onRedraw}>Redesenhar meu autorretrato</button>
          <button className="btn btn-secondary" onClick={onLogout}>Sair da conta</button>
        </div>
      </div>
    </div>
  );
}
