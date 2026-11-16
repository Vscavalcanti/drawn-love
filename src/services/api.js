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

export async function sendMessage(matchId, uid, text) {
  const at = Date.now();
  await data.add('matches/' + matchId + '/messages', { from: uid, text, at });
  const patch = { last: { from: uid, text, at } };
  if (text.length >= MIN_CHARS) patch.days = { [today()]: { [uid]: true } };
  await data.set('matches/' + matchId, patch);
}

export const unlockDemo = (matchId) => data.set('matches/' + matchId, { demoUnlocked: true });

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
