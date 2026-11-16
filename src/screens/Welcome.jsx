export default function Welcome({ go }) {
  return (
    <div className="screen narrow center col gap-16" style={{ padding: 32 }}>
      <div className="logo" style={{ fontSize: 82 }}>DRAWN<br />LOVE</div>
      <p style={{ margin: 0, color: 'var(--magenta)', fontSize: 15, fontWeight: 500 }}>Toda conexão começa com um traço.</p>
      <div className="col gap-12" style={{ width: '100%', marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => go('create')}>Criar perfil</button>
        <button className="btn btn-secondary" onClick={() => go('login')}>Entrar</button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--roxo)' }}>18+ · Sem fotos até a conexão ser real</p>
    </div>
  );
}
