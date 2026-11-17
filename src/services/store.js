// Armazenamento do Drawn Love com duas opções:
//
// 1) Firebase (Authentication + Firestore): usado quando as variáveis VITE_FIREBASE_*
//    existem (arquivo .env no computador ou painel do Netlify). Várias pessoas,
//    em aparelhos diferentes, usando o app ao mesmo tempo.
// 2) Modo local: sem Firebase configurado, guarda tudo no navegador (localStorage).
//    Serve para testar sozinha, criando contas diferentes no mesmo navegador.
//
// As duas opções expõem a mesma interface: auth.* e data.*

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const usingFirebase = Boolean(cfg.apiKey && cfg.projectId);

// Confirmação de e-mail: DESLIGADA durante o teste.
// Para ligar de novo: VITE_REQUIRE_EMAIL_VERIFICATION=true no .env e no Netlify,
// e troque a função verified() no firestore.rules (instruções lá).
export const requireEmailVerification = import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION === 'true';

/* =============================== Firebase =============================== */

let fbPromise = null;
function firebase() {
  if (!fbPromise) {
    fbPromise = Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
      .then(([{ initializeApp }, A, S]) => {
        const app = initializeApp(cfg);
        return { auth: A.getAuth(app), db: S.getFirestore(app), A, S };
      });
  }
  return fbPromise;
}

const FB_ERRORS = {
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/configuration-not-found': 'O login por e-mail ainda não foi ativado no Firebase (Authentication > Método de login > E-mail/senha).',
  'auth/operation-not-allowed': 'O login por e-mail/senha está desativado no Firebase (Authentication > Método de login).',
  'auth/invalid-api-key': 'A chave do Firebase está errada. Confira a variável VITE_FIREBASE_API_KEY.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'A chave do Firebase está errada. Confira a variável VITE_FIREBASE_API_KEY.',
  'auth/unauthorized-domain': 'Este site ainda não foi autorizado no Firebase (veja o README).',
  'permission-denied': 'Sem permissão no banco de dados. Confira as regras do Firestore (veja o README).',
};
const friendly = (e) => new Error(FB_ERRORS[e.code] || e.message || 'Algo deu errado. Tente de novo.');
const guard = async (fn) => { try { return await fn(); } catch (e) { throw friendly(e); } };

// Se o banco não responder (ex.: Firestore ainda não criado), avisa em vez de ficar carregando para sempre.
const SLOW = 15000;
const withTimeout = (promise) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(
    'O banco de dados não respondeu. Confira se o Firestore Database foi criado no Firebase e se a internet está funcionando.',
  )), SLOW)),
]);

// Começa a baixar o Firebase antes da hora, para o "Criar conta" e o "Entrar" ficarem mais rápidos.
export const preload = () => { if (usingFirebase) firebase().catch(() => {}); };

const fbRef = (fb, path) => fb.S.doc(fb.db, ...path.split('/'));
const fbColl = (fb, path) => fb.S.collection(fb.db, ...path.split('/'));
const fbQuery = (fb, path, where) =>
  where ? fb.S.query(fbColl(fb, path), fb.S.where(where[0], where[1], where[2])) : fbColl(fb, path);
const fbList = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// Usuário logado no formato que o app usa
const session = (u) => (u ? { uid: u.uid, email: u.email, verified: !requireEmailVerification || u.emailVerified } : null);

const firebaseBackend = {
  auth: {
    restore: () => guard(async () => {
      const fb = await firebase();
      const user = await new Promise((res) => { const off = fb.A.onAuthStateChanged(fb.auth, (u) => { off(); res(u); }); });
      return session(user);
    }),
    // Cria a conta e já manda o e-mail de confirmação
    signUp: (email, password) => guard(async () => {
      const fb = await firebase();
      fb.auth.languageCode = 'pt';
      const { user } = await fb.A.createUserWithEmailAndPassword(fb.auth, email, password);
      if (requireEmailVerification) await fb.A.sendEmailVerification(user);
      return session(user);
    }),
    signIn: (email, password) => guard(async () => {
      const fb = await firebase();
      return session((await fb.A.signInWithEmailAndPassword(fb.auth, email, password)).user);
    }),
    sendVerification: () => guard(async () => {
      const fb = await firebase();
      fb.auth.languageCode = 'pt';
      await fb.A.sendEmailVerification(fb.auth.currentUser);
    }),
    // Recarrega o usuário para saber se já clicou no link
    checkVerified: () => guard(async () => {
      const fb = await firebase();
      const u = fb.auth.currentUser;
      if (!u) return false;
      await u.reload();
      if (u.emailVerified) await u.getIdToken(true);
      return u.emailVerified;
    }),
    resetPassword: (email) => guard(async () => {
      const fb = await firebase();
      fb.auth.languageCode = 'pt';
      await fb.A.sendPasswordResetEmail(fb.auth, email);
    }),
    signOut: async () => { const fb = await firebase(); await fb.A.signOut(fb.auth); },
  },
  data: {
    get: (path) => guard(async () => { const fb = await firebase(); const s = await withTimeout(fb.S.getDoc(fbRef(fb, path))); return s.exists() ? { id: s.id, ...s.data() } : null; }),
    set: (path, value, merge = true) => guard(async () => { const fb = await firebase(); await withTimeout(fb.S.setDoc(fbRef(fb, path), value, { merge })); }),
    add: (path, value) => guard(async () => { const fb = await firebase(); return (await withTimeout(fb.S.addDoc(fbColl(fb, path), value))).id; }),
    query: (path, where) => guard(async () => { const fb = await firebase(); return fbList(await withTimeout(fb.S.getDocs(fbQuery(fb, path, where)))); }),
    remove: (path) => guard(async () => { const fb = await firebase(); await withTimeout(fb.S.deleteDoc(fbRef(fb, path))); }),
    // Escuta mudanças em tempo real. Devolve uma função para parar de escutar.
    watch(path, where, cb, onError) {
      let off = () => {}, stopped = false;
      firebase().then((fb) => {
        if (stopped) return;
        off = fb.S.onSnapshot(fbQuery(fb, path, where), (snap) => cb(fbList(snap)), (e) => onError?.(friendly(e)));
      });
      return () => { stopped = true; off(); };
    },
    watchDoc(path, cb) {
      let off = () => {}, stopped = false;
      firebase().then((fb) => {
        if (stopped) return;
        off = fb.S.onSnapshot(fbRef(fb, path), (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null));
      });
      return () => { stopped = true; off(); };
    },
  },
};

/* ============================== Modo local ============================== */

const KEY = 'drawnlove:';
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(KEY + k)) ?? d; } catch { return d; } };
const save = (k, v) => {
  try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { throw new Error('O navegador não deixou salvar (armazenamento cheio ou bloqueado).'); }
  window.dispatchEvent(new Event('drawnlove-change'));
};
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const deepMerge = (a, b) => {
  const out = { ...(a || {}) };
  for (const k of Object.keys(b)) out[k] = isObj(b[k]) && isObj(out[k]) ? deepMerge(out[k], b[k]) : b[k];
  return out;
};
const matchWhere = (doc, where) => {
  if (!where) return true;
  const [field, op, value] = where, v = doc[field];
  if (op === '==') return v === value;
  if (op === 'array-contains') return Array.isArray(v) && v.includes(value);
  return false;
};
const docs = () => load('docs', {});
const localList = (path, where) => {
  const all = docs(), prefix = path + '/';
  return Object.keys(all)
    .filter((k) => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
    .map((k) => ({ id: k.slice(prefix.length), ...all[k] }))
    .filter((d) => matchWhere(d, where));
};
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const poll = (read, cb) => {
  let last = '';
  const run = () => { const v = read(); const s = JSON.stringify(v); if (s !== last) { last = s; cb(v); } };
  run();
  window.addEventListener('drawnlove-change', run);
  window.addEventListener('storage', run); // mudanças vindas de outra aba
  return () => { window.removeEventListener('drawnlove-change', run); window.removeEventListener('storage', run); };
};

// No modo local não existe envio de e-mail: a conta já nasce "confirmada".
const localBackend = {
  auth: {
    restore: async () => {
      const s = load('session', null);
      return typeof s === 'string' ? { uid: s, email: '', verified: true } : s; // sessões da versão anterior
    },
    async signUp(email, password) {
      const accounts = load('accounts', {}), key = email.trim().toLowerCase();
      if (accounts[key]) throw new Error('Já existe uma conta com esse e-mail.');
      const uid = 'local-' + Date.now().toString(36);
      accounts[key] = { uid, pass: await sha256(password) };
      const s = { uid, email: key, verified: true };
      save('accounts', accounts); save('session', s);
      return s;
    },
    async signIn(email, password) {
      const key = email.trim().toLowerCase(), acc = load('accounts', {})[key];
      if (!acc || acc.pass !== (await sha256(password))) throw new Error('E-mail ou senha incorretos.');
      const s = { uid: acc.uid, email: key, verified: true };
      save('session', s);
      return s;
    },
    sendVerification: async () => {},
    checkVerified: async () => true,
    resetPassword: async () => { throw new Error('No modo local não dá para recuperar a senha. Crie outra conta.'); },
    signOut: async () => save('session', null),
  },
  data: {
    get: async (path) => { const d = docs()[path]; return d ? { id: path.split('/').pop(), ...d } : null; },
    async set(path, value, merge = true) { const all = docs(); all[path] = merge ? deepMerge(all[path], value) : value; save('docs', all); },
    async add(path, value) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); await this.set(path + '/' + id, value, false); return id; },
    query: async (path, where) => localList(path, where),
    async remove(path) { const all = docs(); delete all[path]; save('docs', all); },
    watch: (path, where, cb) => poll(() => localList(path, where), cb),
    watchDoc: (path, cb) => poll(() => { const d = docs()[path]; return d ? { id: path.split('/').pop(), ...d } : null; }, cb),
  },
};

const backend = usingFirebase ? firebaseBackend : localBackend;
export const auth = backend.auth;
export const data = backend.data;
