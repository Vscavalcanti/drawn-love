// Validações de e-mail e senha usadas no cadastro e no login.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export function emailError(email) {
  const e = normalizeEmail(email);
  if (!e) return 'Digite seu e-mail.';
  if (!EMAIL_RE.test(e)) return 'Esse e-mail não parece válido. Confira se tem @ e o domínio (ex.: nome@gmail.com).';
  return '';
}

// Regras da senha, mostradas como checklist enquanto a pessoa digita
export const passwordRules = (p = '') => [
  { label: 'Pelo menos 8 caracteres', ok: p.length >= 8 },
  { label: 'Pelo menos uma letra', ok: /[A-Za-zÀ-ÿ]/.test(p) },
  { label: 'Pelo menos um número', ok: /\d/.test(p) },
  { label: 'Sem espaços', ok: p.length > 0 && !/\s/.test(p) },
];

export function passwordError(p, confirm) {
  const failed = passwordRules(p).find((r) => !r.ok);
  if (failed) return 'A senha precisa ter: ' + failed.label.toLowerCase() + '.';
  if (confirm !== undefined && p !== confirm) return 'As senhas não são iguais.';
  return '';
}
