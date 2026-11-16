import { useState } from 'react';

// Campo de senha com botão de mostrar/esconder.
export default function PasswordField({ id, label, value, onChange, placeholder, autoComplete = 'new-password', onEnter }) {
  const [show, setShow] = useState(false);
  return (
    <div className="col gap-8">
      <label className="label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input id={id} className="input" type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value}
          placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
          style={{ paddingRight: 84 }} />
        <button type="button" onClick={() => setShow(!show)} aria-pressed={show}
          style={{ position: 'absolute', right: 6, top: 6, height: 38, padding: '0 12px', borderRadius: 10, border: 'none', background: 'rgba(115,90,150,0.1)', color: 'var(--roxo)', fontSize: 12, fontWeight: 700 }}>
          {show ? 'Esconder' : 'Mostrar'}
        </button>
      </div>
    </div>
  );
}

// Lista das regras da senha com ✓ verde / ✗ cinza
export function PasswordChecklist({ rules }) {
  return (
    <ul style={{ listStyle: 'none', margin: '-8px 0 0', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
      {rules.map((r) => (
        <li key={r.label} style={{ fontSize: 12, fontWeight: 600, color: r.ok ? '#1F7A4D' : 'var(--cinza-claro)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 999, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', background: r.ok ? '#1F7A4D' : 'rgba(115,90,150,0.25)' }}>{r.ok ? '✓' : ''}</span>
          {r.label}<span className="sr-only">{r.ok ? ' (ok)' : ' (faltando)'}</span>
        </li>
      ))}
    </ul>
  );
}
