import { Music } from './Icons.jsx';

// Monta as seções do perfil (estilo "Tô procurando", "Sobre mim"...).
// Um campo com valor null não aparece (ex.: orientação escondida).
export default function ProfileSections({ p, empty = '', afterBio = null }) {
  const rows = (list) => list.filter(([, v]) => v !== null);
  const val = (v) => v || empty;

  return (
    <>
      <Section title="Tô procurando"><div style={{ fontSize: 18, fontWeight: 700 }}>{val(p.looking)}</div></Section>
      <Section title="Sobre mim"><p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{val(p.bio)}</p></Section>
      {afterBio}
      <Rows title="Informações básicas" empty={empty}
        items={rows([['Gênero', p.gender], ['Pronomes', p.pronouns], ['Orientação', p.orient], ['Distância', p.dist], ['Estuda em', p.school]])} />
      <Rows title="Mais sobre mim" empty={empty}
        items={[['Linguagem do amor', p.love], ['Signo', p.sign], ['Formação', p.form]]} />
      <Rows title="Estilo de vida" empty={empty}
        items={[['Bebida', p.drink], ['Você fuma?', p.smoke], ['Pets', p.pets], ['Atividade física', p.act]]} />
      <Section title="Interesses">
        <div className="row wrap gap-6">
          {(p.tags && p.tags.length ? p.tags : [empty]).map((t) => (
            <span key={t} style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--roxo)', padding: '6px 12px', borderRadius: 999 }}>{t}</span>
          ))}
        </div>
      </Section>
      <Section title="Minha música">
        <div className="row gap-12">
          <div style={{ width: 52, height: 52, flex: 'none', borderRadius: 12, background: 'var(--azul)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music /></div>
          <div className="col">
            <div style={{ fontSize: 15, fontWeight: 700 }}>{val(p.song)}</div>
            <div style={{ fontSize: 13, color: 'var(--cinza)' }}>{p.artist || ''}</div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="card col gap-8">
      <div className="card-title">{title}</div>
      {children}
    </div>
  );
}

function Rows({ title, items, empty }) {
  return (
    <Section title={title}>
      <div className="col">
        {items.map(([label, value], i) => (
          <div key={label} className="col" style={{ gap: 2, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(115,90,150,0.15)' }}>
            <div style={{ fontSize: 12, color: 'var(--cinza)' }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: value ? 'var(--tinta)' : 'var(--cinza-claro)' }}>{value || empty}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
