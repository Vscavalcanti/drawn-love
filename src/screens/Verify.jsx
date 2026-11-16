import { useEffect, useState } from 'react';

// Confirmação de e-mail: a pessoa abre o link que o Firebase mandou e volta aqui.
export default function Verify({ email, onCheck, onResend, onLogout }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(30); // espera antes de poder reenviar

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  // Confere sozinho a cada 5 segundos, caso a pessoa confirme em outra aba
  useEffect(() => {
    const t = setInterval(() => { onCheck().catch(() => {}); }, 5000);
    return () => clearInterval(t);
  }, [onCheck]);

  const check = async () => {
    setBusy(true); setMsg(null);
    try {
      const ok = await onCheck();
      if (!ok) setMsg({ type: 'error', text: 'Ainda não aparece como confirmado. Abra o link do e-mail e tente de novo.' });
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setBusy(false);
  };
  const resend = async () => {
    try { await onResend(); setWait(60); setMsg({ type: 'info', text: 'Enviamos um novo link.' }); }
    catch (e) { setMsg({ type: 'error', text: e.message }); }
  };

  return (
    <div className="screen narrow center col gap-16" style={{ padding: 32 }}>
      <div className="display" style={{ fontSize: 40, lineHeight: 1, color: 'var(--magenta)' }}>CONFIRME SEU E-MAIL</div>
      <p className="sub" style={{ fontSize: 15, maxWidth: 360 }}>
        Enviamos um link para <strong style={{ color: 'var(--tinta)' }}>{email}</strong>. Abra o e-mail, clique no link e volte aqui.
        Se não achar, olhe a caixa de spam.
      </p>
      {msg && <div role="alert" className={msg.type === 'error' ? 'error' : 'info'} style={{ fontSize: 13, width: '100%' }}>{msg.text}</div>}
      <div className="col gap-12" style={{ width: '100%' }}>
        <button className="btn btn-primary" onClick={check} disabled={busy}>{busy ? 'Conferindo...' : 'Já confirmei'}</button>
        <button className="btn btn-secondary" onClick={resend} disabled={wait > 0}>{wait > 0 ? `Reenviar e-mail (${wait}s)` : 'Reenviar e-mail'}</button>
        <button className="btn-link" style={{ minHeight: 44 }} onClick={onLogout}>Usar outro e-mail</button>
      </div>
    </div>
  );
}
