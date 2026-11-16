// Calcula idade e signo a partir da data de nascimento (formato AAAA-MM-DD).

const SIGNS = [
  [20, 'Capricórnio', 'Aquário'], [19, 'Aquário', 'Peixes'], [21, 'Peixes', 'Áries'], [20, 'Áries', 'Touro'],
  [21, 'Touro', 'Gêmeos'], [21, 'Gêmeos', 'Câncer'], [23, 'Câncer', 'Leão'], [23, 'Leão', 'Virgem'],
  [23, 'Virgem', 'Libra'], [23, 'Libra', 'Escorpião'], [22, 'Escorpião', 'Sagitário'], [22, 'Sagitário', 'Capricórnio'],
];

export function birthInfo(birth) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birth || '');
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) age--;
  const t = SIGNS[mo - 1];
  if (!t || age < 0 || age > 120) return null;
  return { age, sign: d < t[0] ? t[1] : t[2] };
}
