import { useCallback, useEffect, useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import Login from './screens/Login.jsx';
import CreateProfile from './screens/CreateProfile.jsx';
import Draw from './screens/Draw.jsx';
import Discover from './screens/Discover.jsx';
import Redraw from './screens/Redraw.jsx';
import Sent from './screens/Sent.jsx';
import Match from './screens/Match.jsx';
import Chats from './screens/Chats.jsx';
import Chat from './screens/Chat.jsx';
import Profile from './screens/Profile.jsx';
import Verify from './screens/Verify.jsx';
import { normalizeEmail } from './utils/validate.js';
import NavBar from './components/NavBar.jsx';
import useIsDesktop from './components/useIsDesktop.js';
import { BASES } from './data/avatarOptions.js';
import {
  auth, usingFirebase, publicProfile, saveProfile, saveAvatar, loadMe, loadDiscover, markSeen,
  sendLike, watchIncoming, answerLike, watchMatches,
} from './services/api.js';

// Estado geral do app e troca de telas.
export default function App() {
  const desktop = useIsDesktop();
  const [screen, setScreen] = useState('loading');
  const [uid, setUid] = useState(null);
  const [email, setEmail] = useState('');
  const [createStart, setCreateStart] = useState(1);
  const [ans, setAns] = useState({ showOri: true });
  const [password, setPassword] = useState('');
  const [head, setHeadState] = useState('f');
  const [me, setMe] = useState(BASES.f);
  const [seen, setSeen] = useState([]);
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [partner, setPartner] = useState(null);   // pessoa sendo redesenhada
  const [sent, setSent] = useState(null);         // último redesenho enviado
  const [matchView, setMatchView] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [notice, setNotice] = useState('');

  const setHead = (h) => { setHeadState(h); setMe(BASES[h]); };
  const fail = (e) => setNotice(e.message || String(e));

  // Depois do login: confere o e-mail, carrega o perfil e decide para onde ir
  const enter = useCallback(async (s) => {
    setUid(s.uid); setEmail(s.email);
    if (!s.verified) { setScreen('verify'); return; }
    const { pub, ans: savedAns, seen: savedSeen } = await loadMe(s.uid);
    if (savedAns) setAns({ ...savedAns, email: s.email });
    if (pub?.head) setHeadState(pub.head);
    if (pub?.me) setMe(pub.me);
    setSeen(savedSeen);
    if (pub?.ready) setScreen('discover');
    else if (pub?.profileDone) setScreen('draw');
    else { setCreateStart(2); setScreen('create'); }
  }, []);

  useEffect(() => {
    auth.restore().then((s) => (s ? enter(s) : setScreen('welcome'))).catch((e) => { fail(e); setScreen('welcome'); });
  }, [enter]);

  // Tempo real: redesenhos recebidos e conversas
  useEffect(() => {
    if (!uid) return undefined;
    const off1 = watchIncoming(uid, setIncoming, fail);
    const off2 = watchMatches(uid, setMatches, fail);
    return () => { off1(); off2(); };
  }, [uid]);

  // Busca pessoas sempre que abre o Descubra
  const refreshPeople = useCallback(async () => {
    if (!uid) return;
    setLoadingPeople(true);
    try { setPeople(await loadDiscover(uid, ans.seek, seen)); } catch (e) { fail(e); }
    setLoadingPeople(false);
  }, [uid, ans.seek, seen]);
  useEffect(() => { if (screen === 'discover') refreshPeople(); }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const myProfile = publicProfile(ans);
  const meInfo = { uid, name: myProfile.name, av: me };
  const person = people[0];
  const activeMatch = matches.find((m) => m.id === activeId);

  /* ------------------------------ ações ------------------------------ */

  // Etapa 1 do cadastro: cria a conta (o Firebase recusa e-mail repetido) e manda o link de confirmação.
  // Devolve true se já pode seguir (modo local); senão vai para a tela de confirmar e-mail.
  const createAccount = async () => {
    const s = await auth.signUp(normalizeEmail(ans.email), password);
    setUid(s.uid); setEmail(s.email);
    await saveProfile(s.uid, ans, head);
    if (!s.verified) { setCreateStart(2); setScreen('verify'); }
    return s.verified;
  };
  const checkVerified = useCallback(async () => {
    const ok = await auth.checkVerified();
    if (ok) await enter({ uid, email, verified: true });
    return ok;
  }, [uid, email, enter]);
  const finishSignup = async () => {
    await saveProfile(uid, ans, head, true);
    setScreen('draw');
  };
  const login = async (mail, pass) => enter(await auth.signIn(normalizeEmail(mail), pass));
  const logout = async () => {
    await auth.signOut();
    setUid(null); setEmail(''); setCreateStart(1); setAns({ showOri: true }); setMe(BASES.f); setHeadState('f'); setSeen([]);
    setPeople([]); setIncoming([]); setMatches([]); setActiveId(null);
    setScreen('welcome');
  };
  const saveDrawing = async () => {
    try { await saveAvatar(uid, me); setScreen('discover'); } catch (e) { fail(e); }
  };
  const pass = async () => {
    const next = [...seen, person.id];
    setSeen(next); setPeople(people.slice(1));
    markSeen(uid, person.id, seen).catch(fail);
  };
  const like = () => {
    setPartner({ id: person.id, name: person.profile?.name, av: person.me, head: person.me?.head || person.head || 'f' });
    setScreen('redraw');
  };
  const sendRedraw = async (drawing) => {
    try {
      await sendLike(meInfo, partner, drawing);
      setSent(drawing);
      setPeople(people.filter((p) => p.id !== partner.id));
      setScreen('sent');
    } catch (e) { fail(e); }
  };
  const answer = async (likeDoc, accept) => {
    try {
      const id = await answerLike(meInfo, likeDoc, accept);
      if (accept) {
        setActiveId(id);
        setMatchView({ partner: { name: likeDoc.fromName, av: likeDoc.fromAv }, sent: likeDoc.sent });
        setScreen('match');
      }
    } catch (e) { fail(e); }
  };
  const openChat = (id) => { setActiveId(id); setScreen('chat'); };

  /* ------------------------------ telas ------------------------------ */

  const chatsList = (
    <Chats uid={uid} incoming={incoming} matches={matches} activeId={desktop ? activeId : null}
      onOpen={openChat} onAnswer={answer} />
  );
  const chatView = activeMatch && (
    <Chat key={activeMatch.id} match={activeMatch} uid={uid} myName={myProfile.name} back={() => setScreen('chats')} />
  );

  let content;
  switch (screen) {
    case 'loading': content = <div className="screen center"><div className="logo" style={{ fontSize: 48 }}>DRAWN LOVE</div></div>; break;
    case 'welcome': content = <Welcome go={setScreen} />; break;
    case 'login': content = <Login go={setScreen} onLogin={login} onReset={auth.resetPassword} />; break;
    case 'create': content = (
      <CreateProfile key={'create-' + createStart} ans={ans} setAns={setAns} password={password} setPassword={setPassword}
        head={head} setHead={setHead} go={setScreen} startStep={createStart}
        onCreateAccount={createAccount} onFinish={finishSignup} onLogout={logout} />
    ); break;
    case 'verify': content = (
      <Verify email={email} onCheck={checkVerified} onResend={auth.sendVerification} onLogout={logout} />
    ); break;
    case 'draw': content = <Draw me={me} setMe={setMe} onDone={saveDrawing} />; break;
    case 'discover': content = (
      <Discover key={person?.id || 'vazio'} person={person} loading={loadingPeople && !person}
        onPass={pass} onLike={like} onRefresh={refreshPeople} />
    ); break;
    case 'redraw': content = partner && <Redraw key={partner.id} partner={partner} onSend={sendRedraw} />; break;
    case 'sent': content = <Sent partner={partner} sent={sent} onContinue={() => setScreen('discover')} />; break;
    case 'match': content = matchView && (
      <Match partner={matchView.partner} sent={matchView.sent} onChat={() => setScreen('chat')} onContinue={() => setScreen('discover')} />
    ); break;
    case 'chats':
    case 'chat':
      if (desktop) {
        content = (
          <div className="split">
            {chatsList}
            {chatView || <div className="screen center"><p className="sub">Escolha uma conversa.</p></div>}
          </div>
        );
      } else content = screen === 'chat' && chatView ? chatView : chatsList;
      break;
    case 'profile': content = <Profile me={me} profile={myProfile} onRedraw={() => setScreen('draw')} onLogout={logout} />; break;
    default: content = null;
  }

  const showNav = ['discover', 'chats', 'profile'].includes(screen) || (screen === 'chat' && desktop);

  return (
    <div className="phone">
      {content}
      {showNav && <NavBar screen={screen} go={setScreen} badge={incoming.length} />}
      {!usingFirebase && screen === 'welcome' && (
        <div className="local-banner">Modo local: os dados ficam só neste navegador. Configure o Firebase para o teste com várias pessoas.</div>
      )}
      {notice && (
        <div role="alert" className="toast" onClick={() => setNotice('')}>{notice} <span style={{ opacity: 0.7 }}>(toque para fechar)</span></div>
      )}
    </div>
  );
}
