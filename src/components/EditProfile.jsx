import { useState } from 'react';
import { OPTS } from '../data/profileOptions.js';
import { birthInfo } from '../utils/birth.js';
import { Field, Text, Single, Multi, BioCounter, MIN_BIO } from '../screens/CreateProfile.jsx';

// Edição do próprio perfil. Trabalha numa cópia ("draft") e só grava ao tocar em Salvar.
// A data de nascimento não muda aqui (ela garante os 18+ e calcula idade e signo).
export default function EditProfile({ ans, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => ({ ...ans }));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => { setDraft((d) => ({ ...d, [k]: v })); setErr(''); };
  const bi = birthInfo(draft.birth);

  const validate = () => {
    if (!(draft.name || '').trim()) return 'Diga como quer ser chamada(o/e).';
    if (!draft.gender) return 'Escolha uma opção de gênero (pode ser "Prefiro não dizer").';
    if (!(draft.seek || []).length) return 'Diga quem você quer conhecer.';
    if (!draft.looking) return 'Conte o que você está procurando.';
    const n = (draft.bio || '').trim().length;
    if (n < MIN_BIO) return `Sua autodescrição tem ${n} caracteres. Escreva pelo menos ${MIN_BIO} (faltam ${MIN_BIO - n}).`;
    if (!(draft.interests || []).length) return 'Escolha pelo menos um interesse.';
    return '';
  };
  const save = async () => {
    const e = validate();
    if (e) return setErr(e);
    setBusy(true);
    try { await onSave({ ...draft, name: draft.name.trim() }); } catch (er) { setErr(er.message); setBusy(false); }
  };

  return (
    <div className="col gap-12 edit-profile">
      <Box title="Básico">
        <Text id="name" label="Nome ou apelido" max={40} ans={draft} set={set} />
        {bi && <Field label="Idade e signo"><div className="info">{bi.age} anos · {bi.sign} <span style={{ color: 'var(--cinza)' }}>(pela data de nascimento)</span></div></Field>}
      </Box>
      <Box title="Tô procurando">
        <Single id="looking" label="O que você procura" ans={draft} set={set} opts={OPTS.looking} />
      </Box>
      <Box title="Sobre mim">
        <Field label="Autodescrição" hint={'mínimo de ' + MIN_BIO + ' caracteres'} id="bio">
          <textarea id="bio" className="input" style={{ height: 170 }} maxLength={2000} value={draft.bio || ''}
            onChange={(e) => set('bio', e.target.value)} aria-describedby="bio-count" />
          <BioCounter text={draft.bio} />
        </Field>
      </Box>
      <Box title="Informações básicas">
        <Single id="gender" label="Gênero" ans={draft} set={set} opts={OPTS.gender} />
        {draft.gender === 'Prefiro descrever' && <Text id="genderCustom" label="Como você descreve seu gênero?" ans={draft} set={set} />}
        <Single id="pronouns" label="Pronomes" hint="opcional" ans={draft} set={set} opts={OPTS.pronouns} />
        <Single id="orient" label="Orientação sexual" hint="opcional" ans={draft} set={set} opts={OPTS.orient} />
        <Field label="Orientação no perfil">
          <button className={'toggle' + (draft.showOri !== false ? ' on' : '')} aria-pressed={draft.showOri !== false}
            onClick={() => set('showOri', draft.showOri === false)}>
            <span className="track"><span className="knob" /></span>
            <span style={{ fontSize: 14 }}>{draft.showOri !== false ? 'Mostrar no meu perfil' : 'Escondida do meu perfil'}</span>
          </button>
        </Field>
        <Field label="Status online">
          <button className={'toggle' + (draft.showOnline !== false ? ' on' : '')} aria-pressed={draft.showOnline !== false}
            onClick={() => set('showOnline', draft.showOnline === false)}>
            <span className="track"><span className="knob" /></span>
            <span style={{ fontSize: 14 }}>{draft.showOnline !== false ? 'Mostrar quando estou online' : 'Ninguém vê quando estou online'}</span>
          </button>
        </Field>
        <Multi id="seek" label="Quero conhecer" hint="pode marcar mais de um" ans={draft} set={set} opts={OPTS.seek} />
        <Text id="school" label="Onde estuda ou estudou" hint="opcional" ph="Ex.: UNIT PE" ans={draft} set={set} />
      </Box>
      <Box title="Mais sobre mim">
        <Single id="love" label="Linguagem do amor" hint="opcional" ans={draft} set={set} opts={OPTS.love} />
        <Single id="form" label="Formação" hint="opcional" ans={draft} set={set} opts={OPTS.form} />
      </Box>
      <Box title="Estilo de vida">
        <Single id="drink" label="Bebida" hint="opcional" ans={draft} set={set} opts={OPTS.drink} />
        <Single id="smoke" label="Você fuma?" hint="opcional" ans={draft} set={set} opts={OPTS.smoke} />
        <Multi id="pets" label="Pets" hint="opcional" ans={draft} set={set} opts={OPTS.pets} />
        <Single id="act" label="Atividade física" hint="opcional" ans={draft} set={set} opts={OPTS.act} />
      </Box>
      <Box title="Interesses e música">
        <Multi id="interests" label="Interesses" hint="até 5" max={5} ans={draft} set={set} opts={OPTS.interests} />
        <Text id="song" label="Minha música" hint="opcional" ph="Música e artista" ans={draft} set={set} />
      </Box>

      <div className="edit-actions">
        {err && <div role="alert" className="error">{err}</div>}
        <div className="row gap-8">
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'}</button>
        </div>
      </div>
    </div>
  );
}

function Box({ title, children }) {
  return (
    <div className="card col" style={{ gap: 18 }}>
      <div className="card-title">{title}</div>
      {children}
    </div>
  );
}
