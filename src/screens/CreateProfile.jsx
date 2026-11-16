import { useState } from 'react';
import { Back } from '../components/Icons.jsx';
import Avatar from '../components/Avatar.jsx';
import { BASES } from '../data/avatarOptions.js';
import { birthInfo } from '../utils/birth.js';
import { emailError, passwordError, passwordRules } from '../utils/validate.js';
import PasswordField, { PasswordChecklist } from '../components/PasswordField.jsx';

// Cadastro em 5 etapas. "ans" guarda todas as respostas; "head" é a base escolhida (f = boina, m = boné).
// A senha fica separada de "ans" para nunca ir para o banco de dados junto com o perfil.
// startStep = 2 quando a conta já existe (e-mail confirmado) e falta terminar o perfil.
export default function CreateProfile({ ans, setAns, password, setPassword, head, setHead, go, startStep = 1, onCreateAccount, onFinish, onLogout }) {
  const [step, setStep] = useState(startStep);
  const [minStep, setMinStep] = useState(startStep); // depois de criar a conta não dá para voltar à etapa 1
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const set = (k, v) => { setAns({ ...ans, [k]: v }); setErr(''); };
  const bi = birthInfo(ans.birth);

  const STEPS = [
    {
      title: 'Sua conta', sub: 'O Drawn Love é só para maiores de 18 anos. Seus dados de acesso ficam protegidos.',
      body: (
        <>
          <Text id="email" label="E-mail" type="email" ph="voce@email.com" ans={ans} set={set} />
          {ans.email && emailError(ans.email) && <div style={{ fontSize: 12, fontWeight: 600, color: '#A51F55', marginTop: -12 }}>{emailError(ans.email)}</div>}
          <PasswordField id="password" label="Crie uma senha" value={password} placeholder="Mínimo de 8 caracteres"
            onChange={(v) => { setPassword(v); setErr(''); }} />
          <PasswordChecklist rules={passwordRules(password)} />
          <PasswordField id="confirm" label="Repita a senha" value={confirm} placeholder="Digite a senha de novo"
            onChange={(v) => { setConfirm(v); setErr(''); }} />
          {confirm && confirm !== password && <div style={{ fontSize: 12, fontWeight: 600, color: '#A51F55', marginTop: -12 }}>As senhas não são iguais.</div>}
          <Text id="name" label="Como quer ser chamada(o/e)" ph="Seu nome ou apelido" ans={ans} set={set} />
          <Text id="birth" label="Data de nascimento" type="date" ans={ans} set={set} />
          {bi && (
            <Field label="Calculado pela sua data"><div className="info">{bi.age} anos · Signo: {bi.sign}</div></Field>
          )}
        </>
      ),
      validate: () => {
        const eErr = emailError(ans.email);
        if (eErr) return eErr;
        const pErr = passwordError(password, confirm);
        if (pErr) return pErr;
        if (!(ans.name || '').trim()) return 'Diga como quer ser chamada(o/e).';
        if (!bi) return 'Informe sua data de nascimento.';
        if (bi.age < 18) return 'O Drawn Love é só para maiores de 18 anos.';
        return '';
      },
    },
    {
      title: 'Quem você é', sub: 'Isso define quem vê você e quem aparece pra você. Você decide o que fica visível no perfil.',
      body: (
        <>
          <Single id="gender" label="Gênero" ans={ans} set={set}
            opts={['Mulher', 'Homem', 'Mulher trans', 'Homem trans', 'Não-binário', 'Gênero fluido', 'Agênero', 'Prefiro descrever', 'Prefiro não dizer']} />
          {ans.gender === 'Prefiro descrever' && (
            <Text id="genderCustom" label="Como você descreve seu gênero?" ph="Escreva do seu jeito" ans={ans} set={set} />
          )}
          <Single id="pronouns" label="Pronomes" hint="opcional" ans={ans} set={set}
            opts={['Ela/dela', 'Ele/dele', 'Elu/delu', 'Qualquer pronome', 'Prefiro não dizer']} />
          <Single id="orient" label="Orientação sexual" hint="opcional" ans={ans} set={set}
            opts={['Hétero', 'Gay', 'Lésbica', 'Bissexual', 'Pansexual', 'Assexual', 'Demissexual', 'Queer', 'Ainda descobrindo', 'Prefiro não dizer']} />
          <Field label="Orientação no perfil">
            <button className={'toggle' + (ans.showOri !== false ? ' on' : '')} aria-pressed={ans.showOri !== false}
              onClick={() => set('showOri', ans.showOri === false)}>
              <span className="track"><span className="knob" /></span>
              <span style={{ fontSize: 14 }}>{ans.showOri !== false ? 'Mostrar no meu perfil' : 'Escondida do meu perfil'}</span>
            </button>
          </Field>
          <Multi id="seek" label="Quero conhecer" hint="pode marcar mais de um" ans={ans} set={set}
            opts={['Mulheres', 'Homens', 'Pessoas não-binárias', 'Todo mundo']} />
        </>
      ),
      validate: () => {
        if (!ans.gender) return 'Escolha uma opção de gênero (pode ser "Prefiro não dizer").';
        if (!(ans.seek || []).length) return 'Diga quem você quer conhecer.';
        return '';
      },
    },
    {
      title: 'Seu perfil', sub: 'Tudo aqui aparece para quem abrir o seu perfil. Fale da sua personalidade, não da aparência.',
      body: (
        <>
          <Single id="looking" label="Tô procurando" ans={ans} set={set}
            opts={['Relacionamento sério', 'Algo sério, mas vamos ver...', 'Algo casual', 'Amizade primeiro', 'Ainda não sei']} />
          <Field label="Sobre mim" hint={'mínimo de ' + MIN_BIO + ' caracteres'} id="bio">
            <textarea id="bio" className="input" style={{ height: 150 }} value={ans.bio || ''} onChange={(e) => set('bio', e.target.value)}
              aria-describedby="bio-count"
              placeholder="O que te faz rir, o que você defende, como é o seu domingo perfeito, o que te deixa animada(o/e)... Fale da sua personalidade, não da aparência." />
            <BioCounter text={ans.bio} />
          </Field>
          <Text id="school" label="Onde estuda ou estudou" hint="opcional" ph="Ex.: UNIT PE" ans={ans} set={set} />
          <Single id="form" label="Formação" hint="opcional" ans={ans} set={set}
            opts={['Ensino médio', 'Fazendo faculdade', 'Graduado(a)', 'Pós-graduação']} />
        </>
      ),
      validate: () => {
        if (!ans.looking) return 'Conte o que você está procurando.';
        const n = (ans.bio || '').trim().length;
        if (n < MIN_BIO) return `Sua autodescrição tem ${n} caracteres. Escreva pelo menos ${MIN_BIO} (faltam ${MIN_BIO - n}).`;
        return '';
      },
    },
    {
      title: 'Mais sobre você', sub: 'Tudo aqui é opcional. Pule o que não quiser responder. Seu signo já foi calculado pela data de nascimento.',
      body: (
        <>
          <Single id="love" label="Linguagem do amor" hint="opcional" ans={ans} set={set}
            opts={['Palavras de afirmação', 'Tempo de qualidade', 'Presentes', 'Atos de serviço', 'Toque físico']} />
          <Single id="drink" label="Bebida" hint="opcional" ans={ans} set={set} opts={['Não bebo', 'Socialmente', 'Bebo com moderação']} />
          <Single id="smoke" label="Você fuma?" hint="opcional" ans={ans} set={set} opts={['Não fumo', 'Às vezes', 'Fumo']} />
          <Multi id="pets" label="Pets" hint="opcional" ans={ans} set={set} opts={['Cachorro', 'Gato', 'Outros', 'Nenhum']} />
          <Single id="act" label="Atividade física" hint="opcional" ans={ans} set={set} opts={['Todo dia', 'Às vezes', 'Quase nunca']} />
        </>
      ),
      validate: () => '',
    },
    {
      title: 'Gostos e personagem', sub: 'Por último, escolha a base que você vai personalizar em 1 minuto.',
      body: (
        <>
          <Multi id="interests" label="Interesses" hint="até 5" max={5} ans={ans} set={set}
            opts={['Música', 'Cinema', 'Leitura', 'Games', 'Praia', 'Trilhas', 'Cozinhar', 'Dança', 'Arte', 'Esportes', 'Fotografia', 'Viagens', 'Animes', 'Piquenique', 'Café', 'Séries']} />
          <Text id="song" label="Minha música" hint="opcional" ph="Música e artista" ans={ans} set={set} />
          <Field label="Personagem base" hint="qualquer pessoa pode escolher qualquer base">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['f', 'Base com boina'], ['m', 'Base com boné']].map(([h, label]) => (
                <button key={h} onClick={() => setHead(h)}
                  style={{ borderRadius: 18, border: '3px solid ' + (head === h ? 'var(--magenta)' : 'rgba(115,90,150,0.25)'),
                    background: head === h ? 'rgba(242,107,145,0.15)' : '#fff', color: head === h ? 'var(--magenta)' : 'var(--roxo)',
                    fontSize: 13, fontWeight: 700, padding: '8px 6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Avatar a={BASES[h]} width={110} />{label}
                </button>
              ))}
            </div>
          </Field>
        </>
      ),
      validate: () => ((ans.interests || []).length ? '' : 'Escolha pelo menos um interesse.'),
    },
  ];

  const [busy, setBusy] = useState(false);
  const st = STEPS[step - 1];
  const back = () => {
    setErr('');
    if (step > minStep) setStep(step - 1);
    else if (minStep > 1) onLogout(); // conta já criada: voltar = sair
    else go('welcome');
  };
  const next = async () => {
    const e = st.validate();
    if (e) return setErr(e);
    setBusy(true);
    try {
      // Etapa 1 cria a conta (e confere se o e-mail já existe); a 5 salva o perfil completo
      if (step === 1) {
        const verified = await onCreateAccount();
        setPassword(''); setConfirm('');
        if (verified) { setMinStep(2); setStep(2); } // sem verificação pendente (modo local): segue direto
      }
      else if (step < 5) setStep(step + 1);
      else await onFinish();
    } catch (er) { setErr(er.message); }
    setBusy(false);
  };

  return (
    <div className="screen narrow">
      <div className="col gap-12" style={{ padding: '20px 20px 10px' }}>
        <div className="row gap-12">
          <button className="icon-btn" aria-label="Voltar" onClick={back}><Back /></button>
          <div className="step-tag" style={{ color: 'var(--azul)' }}>1 · CRIE · ETAPA {step} DE 5</div>
        </div>
        <div className="progress">{[1, 2, 3, 4, 5].map((i) => <div key={i} className={i <= step ? 'on' : ''} />)}</div>
        <h1 className="h1">{st.title}</h1>
        <p className="sub">{st.sub}</p>
      </div>
      <div className="scroll col" style={{ padding: '6px 20px 16px', gap: 20 }}>
        {st.body}
        {err && <div role="alert" className="error">{err}</div>}
      </div>
      <div style={{ padding: '12px 20px 20px', borderTop: '2px solid rgba(115,90,150,0.12)' }}>
        <button className="btn btn-primary" onClick={next} disabled={busy}>{busy ? (step === 1 ? 'Criando sua conta...' : 'Salvando...') : step === 1 ? 'Criar conta' : step === 5 ? 'Continuar para o desenho' : 'Continuar'}</button>
      </div>
    </div>
  );
}

export const MIN_BIO = 200;

// Contador da autodescrição: mostra quanto falta até o mínimo
function BioCounter({ text }) {
  const n = (text || '').trim().length;
  const ok = n >= MIN_BIO;
  return (
    <div id="bio-count" className="row between" style={{ marginTop: -2, gap: 10 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(115,90,150,0.15)', overflow: 'hidden' }}>
        <div style={{ width: Math.min(100, (n / MIN_BIO) * 100) + '%', height: '100%', background: ok ? '#1F7A4D' : 'var(--magenta)', transition: 'width .2s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: ok ? '#1F7A4D' : 'var(--cinza)' }}>
        {ok ? `${n} caracteres ✓` : `${n}/${MIN_BIO} · faltam ${MIN_BIO - n}`}
      </span>
    </div>
  );
}

function Field({ label, hint, id, children }) {
  return (
    <div className="col gap-8">
      <label className="label" htmlFor={id}>{label}{hint && <span> · {hint}</span>}</label>
      {children}
    </div>
  );
}

function Text({ id, label, hint, type = 'text', ph, ans, set }) {
  return (
    <Field label={label} hint={hint} id={id}>
      <input id={id} className="input" type={type} value={ans[id] || ''} placeholder={ph} onChange={(e) => set(id, e.target.value)} />
    </Field>
  );
}

function Single({ id, label, hint, opts, ans, set }) {
  return (
    <Field label={label} hint={hint}>
      <div className="row wrap gap-8">
        {opts.map((o) => {
          const on = ans[id] === o;
          return <button key={o} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => set(id, on ? '' : o)}>{o}</button>;
        })}
      </div>
    </Field>
  );
}

function Multi({ id, label, hint, opts, max, ans, set }) {
  const arr = ans[id] || [];
  return (
    <Field label={label} hint={hint}>
      <div className="row wrap gap-8">
        {opts.map((o) => {
          const on = arr.includes(o);
          const toggle = () => {
            if (on) set(id, arr.filter((x) => x !== o));
            else if (!max || arr.length < max) set(id, [...arr, o]);
          };
          return <button key={o} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={toggle}>{o}</button>;
        })}
      </div>
    </Field>
  );
}
