// Regras do Drawn Love sobre o armazenamento (store.js).
//
// Coleções:
//   users/{uid}       perfil público: profile, head, me, seekGenders, ready
//   private/{uid}     só a própria pessoa lê: ans (respostas do cadastro), seen (quem já passou)
//   likes/{de_para}   redesenho enviado: from, to, fromName, fromAv, sent, status (pending|accepted|declined)
//   matches/{a_b}     users [a, b], names, avs, days { 'AAAA-MM-DD': { uid: true } }, demoUnlocked
//   matches/{id}/messages/{auto}   from, text, at

import { auth, data } from './store.js';
import { birthInfo } from '../utils/birth.js';
import { preparePhoto } from '../utils/image.js';
import { usingFirebase as fbOn } from './store.js';

export { auth, usingFirebase, preload } from './store.js';

/* ------------------------------- Perfil ------------------------------- */

const GENDER_GROUP = {
  Mulher: 'Mulheres', 'Mulher trans': 'Mulheres',
  Homem: 'Homens', 'Homem trans': 'Homens',
  'Não-binário': 'Pessoas não-binárias', 'Gênero fluido': 'Pessoas não-binárias', Agênero: 'Pessoas não-binárias',
};

// Transforma as respostas do cadastro no perfil que os outros veem.
export function publicProfile(ans) {
  const bi = birthInfo(ans.birth);
  const hide = (v) => (v === 'Prefiro não dizer' ? null : v || '');
  return {
    name: (ans.name || '').trim() || 'Sem nome',
    age: bi ? bi.age : '',
    gender: ans.gender === 'Prefiro descrever' ? ans.genderCustom || '' : hide(ans.gender),
    pronouns: hide(ans.pronouns),
    orient: ans.showOri === false ? null : hide(ans.orient),
    dist: null,
    looking: ans.looking || '', bio: (ans.bio || '').trim(), school: ans.school || '',
    love: ans.love || '', sign: bi ? bi.sign : '', form: ans.form || '',
    drink: ans.drink || '', smoke: ans.smoke || '', pets: (ans.pets || []).join(', '), act: ans.act || '',
    tags: ans.interests || [], song: ans.song || '',
    group: GENDER_GROUP[ans.gender] || 'Outro', // usado no filtro "Quero conhecer"
  };
}

// done = true quando a pessoa termina as 5 etapas do cadastro
export async function saveProfile(uid, ans, head, done = false) {
  const { email, ...rest } = ans; // e-mail fica só no login, não no perfil
  // as duas gravações ao mesmo tempo
  await Promise.all([
    data.set('private/' + uid, { ans: rest }),
    data.set('users/' + uid, {
      profile: publicProfile(ans), head, seek: ans.seek || [], updatedAt: Date.now(), ...(done ? { profileDone: true } : {}),
    }),
  ]);
}

export const saveAvatar = (uid, me) => data.set('users/' + uid, { me, ready: true, updatedAt: Date.now() });

export async function loadMe(uid) {
  const [pub, priv] = await Promise.all([data.get('users/' + uid), data.get('private/' + uid)]);
  return { pub, ans: priv?.ans || null, seen: priv?.seen || [] };
}

/* ------------------------------- Descubra ------------------------------ */

// Pessoas para mostrar: já desenharam o personagem, não sou eu,
// não passei nem curti antes, e combinam com o "Quero conhecer".
export async function loadDiscover(uid, seek, seen) {
  const [users, myLikes] = await Promise.all([data.query('users'), data.query('likes', ['from', '==', uid])]);
  const skip = new Set([uid, ...seen, ...myLikes.map((l) => l.to)]);
  const all = !seek?.length || seek.includes('Todo mundo');
  return users
    .filter((u) => u.ready && u.me && !skip.has(u.id))
    .filter((u) => all || u.profile?.group === 'Outro' || seek.includes(u.profile?.group))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function markSeen(uid, otherId, seen) {
  await data.set('private/' + uid, { seen: [...new Set([...seen, otherId])] });
}

/* ------------------------- Redesenho e match -------------------------- */

const pairId = (a, b) => [a, b].sort().join('_');

export async function sendLike(me, other, sent) {
  await data.set('likes/' + me.uid + '_' + other.id, {
    from: me.uid, to: other.id, fromName: me.name, fromAv: me.av, sent, status: 'pending', at: Date.now(),
  }, false);
}

// Redesenhos recebidos esperando minha resposta
export const watchIncoming = (uid, cb, onError) =>
  data.watch('likes', ['to', '==', uid], (list) => cb(list.filter((l) => l.status === 'pending').sort((a, b) => a.at - b.at)), onError);

export async function answerLike(me, like, accept) {
  await data.set('likes/' + like.id, { status: accept ? 'accepted' : 'declined' });
  if (!accept) return null;
  const id = pairId(me.uid, like.from);
  await data.set('matches/' + id, {
    users: [me.uid, like.from].sort(),
    names: { [me.uid]: me.name, [like.from]: like.fromName },
    avs: { [me.uid]: me.av, [like.from]: like.fromAv },
    sent: like.sent, sentBy: like.from, createdAt: Date.now(),
    // sem "days" aqui: se o match já existir (as duas pessoas se redesenharam), a sequência não é apagada
  });
  return id;
}

export const watchMatches = (uid, cb, onError) =>
  data.watch('matches', ['users', 'array-contains', uid], (list) =>
    cb(list.sort((a, b) => (b.last?.at || b.createdAt) - (a.last?.at || a.createdAt))), onError);

/* -------------------------------- Chat -------------------------------- */

export const MIN_CHARS = 25; // regra provisória no lugar da IA: mensagem com 25+ caracteres valida o dia
export const today = () => new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD no fuso do aparelho

export const watchMessages = (matchId, cb) =>
  data.watch('matches/' + matchId + '/messages', null, (list) => cb(list.sort((a, b) => a.at - b.at)));

export async function sendMessage(matchId, uid, text, { system = false } = {}) {
  const at = Date.now();
  await data.add('matches/' + matchId + '/messages', system ? { from: uid, text, at, kind: 'system' } : { from: uid, text, at });
  const patch = { last: { from: uid, text, at } };
  if (!system && text.length >= MIN_CHARS) patch.days = { [today()]: { [uid]: true } };
  await data.set('matches/' + matchId, patch);
}

// Só para teste/apresentação: finge que as duas pessoas conversaram nos últimos N dias (até hoje).
// Os dias antes disso ficam marcados como "não contou", então a sequência dá exatamente N. N = 0 zera.
export function simulateStreak(match, n) {
  const key = (x) => x.toLocaleDateString('en-CA');
  const mark = (v) => Object.fromEntries(match.users.map((u) => [u, v]));
  const days = {};
  const d = new Date();
  for (let i = 0; i < n; i++) { days[key(d)] = mark(true); d.setDate(d.getDate() - 1); }
  // dois dias "não contou": com N = 0, hoje e ontem ficam vazios e a sequência zera de verdade
  days[key(d)] = mark(false); d.setDate(d.getDate() - 1); days[key(d)] = mark(false);
  return data.set('matches/' + match.id, { days, demoUnlocked: false });
}

// Sequência: dias seguidos em que AS DUAS pessoas mandaram mensagem de verdade.
// Conta para trás a partir de hoje (ou de ontem, se hoje ainda está em andamento).
export function streakInfo(match, uid) {
  const days = match.days || {};
  const both = (key) => match.users.every((u) => days[key]?.[u]);
  const d = new Date();
  const key = (x) => x.toLocaleDateString('en-CA');
  const todayKey = key(d);
  let streak = 0;
  if (!both(todayKey)) d.setDate(d.getDate() - 1);
  while (both(key(d))) { streak++; d.setDate(d.getDate() - 1); }
  const hadBefore = Object.keys(days).some((k) => both(k));
  const other = match.users.find((u) => u !== uid);
  let state = 'pendente';
  if (both(todayKey)) state = 'ok';
  else if (days[todayKey]?.[uid]) state = 'espera';
  else if (streak === 0 && hadBefore) state = 'zerou';
  return { streak, state, unlocked: streak >= 15 || match.demoUnlocked, otherName: match.names?.[other] || '' };
}

/* ------------------------------- Galeria ------------------------------- */
// As fotos ficam no próprio Firestore (funciona no plano grátis, sem Storage):
//   matches/{id}/photos/{foto}     from, thumb (miniatura ~20 KB), w, h, at   -> carrega na grade
//   matches/{id}/photoData/{foto}  from, data (foto comprimida, até ~700 KB)  -> só quando abre a foto

export const MAX_PHOTOS_EACH = 12;

export const watchPhotos = (matchId, cb, onError) =>
  data.watch('matches/' + matchId + '/photos', null, (list) => cb(list.sort((a, b) => a.at - b.at)), onError);

export async function uploadPhoto(matchId, uid, file) {
  // No modo local o navegador guarda pouco (~5 MB), então a foto fica menor.
  const opts = fbOn ? {} : { maxSide: 640, maxBytes: 150000 };
  const p = await preparePhoto(file, opts);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await data.set('matches/' + matchId + '/photoData/' + id, { from: uid, data: p.full }, false);
  await data.set('matches/' + matchId + '/photos/' + id, { from: uid, thumb: p.thumb, w: p.w, h: p.h, at: Date.now() }, false);
}

export async function loadPhoto(matchId, photoId) {
  const d = await data.get('matches/' + matchId + '/photoData/' + photoId);
  return d?.data || null;
}

export async function deletePhoto(matchId, photoId) {
  await data.remove('matches/' + matchId + '/photos/' + photoId);
  await data.remove('matches/' + matchId + '/photoData/' + photoId);
}

/* -------------------------------- Jogos -------------------------------- */
//   matches/{id}/games/{jogo}   type, createdBy, status ('playing' | 'won' | 'lost' | 'draw' | 'ended'),
//                               turn (de quem é a vez), state (dados do jogo), at, updatedAt

export const watchGames = (matchId, cb, onError) =>
  data.watch('matches/' + matchId + '/games', null, (list) => cb(list.sort((a, b) => b.at - a.at)), onError);

export async function createGame(matchId, uid, type, turn, state, label, fixedId) {
  const id = fixedId || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await data.set('matches/' + matchId + '/games/' + id, {
    type, createdBy: uid, status: 'playing', turn, state, at: Date.now(), updatedAt: Date.now(),
  }, false);
  // aviso no chat (não conta para a sequência de 15 dias)
  if (label) await sendMessage(matchId, uid, `Começou um jogo: ${label}. Vem jogar na aba Jogos!`, { system: true });
  return id;
}

export const getGame = (matchId, gameId) => data.get('matches/' + matchId + '/games/' + gameId);

export const updateGame = (matchId, gameId, patch) =>
  data.set('matches/' + matchId + '/games/' + gameId, { ...patch, updatedAt: Date.now() });

export const otherOf = (match, uid) => match.users.find((u) => u !== uid);
