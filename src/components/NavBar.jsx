import Logo from './Logo.jsx';
import { Pencil, Chat, User } from './Icons.jsx';

export default function NavBar({ screen, go, badge = 0 }) {
  const item = (id, label, Icon, count = 0) => (
    <button className={screen === id || (id === 'chats' && screen === 'chat') ? 'on' : ''} onClick={() => go(id)} style={{ position: 'relative' }}>
      <Icon />{label}
      {count > 0 && <span className="badge" aria-label={count + ' novos'}>{count}</span>}
    </button>
  );
  return (
    <nav className="nav">
      <div className="nav-logo"><Logo size={56} nameSize={15} /></div>
      {item('discover', 'Descubra', Pencil)}
      {item('chats', 'Conversas', Chat, badge)}
      {item('profile', 'Perfil', User)}
    </nav>
  );
}
