import { useState } from 'react';
import { Back } from '../components/Icons.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { emailError } from '../utils/validate.js';

export default function Login({ go, onLogin, onReset }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null); // { type: 'error' | 'info', text }
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const eErr = emailError(email);
    if (eErr) return setMsg({ type: 'error', text: eErr });
    if (!password) return setMsg({ type: 'error', text: 'Digite sua senha.' });
    setBusy(true); setMsg(null);
    try { await onLogin(email, password); } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setBusy(false);
  };
  const reset = async () => {
    if (emailError(email)) return setMsg({ type: 'error', text: 'Digite seu e-mail acima primeiro.' });
    try { await onReset(email); setMsg({ type: 'info', text: 'Enviamos um link para redefinir sua senha.' }); }
    catch (e) { setMsg({ type: 'error', text: e.message }); }
  };

  return (
    <div className="screen narrow pad col gap-16">
      <button className="icon-btn" aria-label="Voltar" onClick={() => go('welcome')}><Back /></button>
      <div className="logo" style={{ fontSize: 40, alignSelf: 'flex-start', margin: '8px 0 12px' }}>DRAWN LOVE</div>
      <h1 className="h1" style={{ color: 'var(--tinta)', fontSize: 30 }}>Que bom te ver de novo</h1>
      <div className="col gap-6">
        <label className="label" htmlFor="lemail">E-mail</label>
        <input id="lemail" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
      </div>
      <PasswordField id="lsenha" label="Senha" value={password} onChange={setPassword} onEnter={submit}
        autoComplete="current-password" placeholder="Sua senha" />
      <button className="btn-link" style={{ alignSelf: 'flex-end', minHeight: 44, fontSize: 13 }} onClick={reset}>Esqueci minha senha</button>
      {msg && <div role="alert" className={msg.type === 'error' ? 'error' : 'info'} style={{ fontSize: 13 }}>{msg.text}</div>}
      <div className="grow" />
      <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
      <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: 'var(--cinza)' }}>
        Ainda não tem conta? <button className="btn-link" onClick={() => go('create')}>Criar perfil</button>
      </p>
    </div>
  );
}
