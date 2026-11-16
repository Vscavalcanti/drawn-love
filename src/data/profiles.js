// Perfis de exemplo para o pré-teste. No app real eles virão do banco de dados (Firebase).

export const PROFILES = [
  {
    id: 'lia', name: 'Lia', age: 25, head: 'f',
    gender: 'Mulher', pronouns: 'Ela/dela', orient: 'Bissexual',
    bio: 'Leio poesia no ônibus e sei de cor as falas de um filme que ninguém viu. Procuro alguém pra dividir silêncios bons.',
    tags: ['Poesia', 'Cinema antigo', 'Café', 'Piquenique'],
    looking: 'Algo sério, mas vamos ver...', dist: 'a 4 km daqui', school: 'UFPE', love: 'Tempo de qualidade', sign: 'Peixes', form: 'Fazendo faculdade',
    drink: 'Bebo com moderação', smoke: 'Não fumo', pets: 'Gato', act: 'Às vezes', song: 'Tarde Lenta', artist: 'Os Ventiladores',
    av: { head: 'f', hair: '#2B2B2B', shirt: '#735A96', accent: '#F26B91', hat: '#3E6BAA', skin: '#F6D3B8', hairStyle: 'longo', eyes: 'feliz', mouth: 'aberto', outfit: 'camiseta', acc: 'boina' },
  },
  {
    id: 'caio', name: 'Caio', age: 27, head: 'm',
    gender: 'Homem', pronouns: 'Ele/dele', orient: 'Hétero',
    bio: 'Cozinho mal, danço pior, mas conto boas histórias. Meu domingo ideal tem feira, violão e zero pressa.',
    tags: ['Música', 'Feira', 'Histórias', 'Praia'],
    looking: 'Relacionamento sério', dist: 'a 9 km daqui', school: 'UNIT PE', love: 'Palavras de afirmação', sign: 'Leão', form: 'Graduado',
    drink: 'Socialmente', smoke: 'Não fumo', pets: 'Cachorro', act: 'Todo dia', song: 'Maré Alta', artist: 'Coqueiral Elétrico',
    av: { head: 'm', hair: '#2B2B2B', shirt: '#F7D046', accent: '#3E6BAA', hat: '#C93A73', skin: '#8E5638', hairStyle: 'cacheado', eyes: 'normal', mouth: 'dentes', outfit: 'moletom', acc: 'nenhum' },
  },
  {
    id: 'bia', name: 'Bia', age: 23, head: 'f',
    gender: 'Mulher', pronouns: 'Ela/dela', orient: 'Lésbica',
    bio: 'Estudante de biologia, colecionadora de plantas que quase morrem. Rio alto em lugares silenciosos.',
    tags: ['Plantas', 'Trilhas', 'Podcasts', 'Experimentar coisas novas'],
    looking: 'Amizade primeiro, depois a gente vê', dist: 'a 11 km daqui', school: 'UFRPE', love: 'Presentes', sign: 'Escorpião', form: 'Fazendo faculdade',
    drink: 'Não bebo', smoke: 'Não fumo', pets: 'Plantas contam?', act: 'Às vezes', song: 'Fim de Feira', artist: 'Banda Girassol',
    av: { head: 'f', hair: '#C2552D', shirt: '#3E9B6A', accent: '#F3D98B', hat: '#F7B8CC', skin: '#FBE3D2', hairStyle: 'coque', eyes: 'apaixonado', mouth: 'gato', outfit: 'avental', acc: 'flor' },
  },
  {
    id: 'davi', name: 'Davi', age: 26, head: 'm',
    gender: 'Não-binário', pronouns: 'Elu/delu', orient: null, // null = escolheu esconder
    bio: 'Professor de história que ainda se empolga com mapa antigo. Faço o melhor café da rua e ouço mais do que falo.',
    tags: ['História', 'Café', 'Bicicleta', 'Jogos de tabuleiro'],
    looking: 'Algo sério', dist: 'a 6 km daqui', school: 'UFPE', love: 'Atos de serviço', sign: 'Capricórnio', form: 'Graduado',
    drink: 'Socialmente', smoke: 'Não fumo', pets: 'Nenhum (por enquanto)', act: 'Às vezes', song: 'Ladeira Azul', artist: 'Frevo de Bolso',
    av: { head: 'm', hair: '#7A4A3A', shirt: '#B9A3E0', accent: '#22335E', hat: '#2B2B2B', skin: '#D9A07A', hairStyle: 'curto', eyes: 'piscando', mouth: 'lado', outfit: 'jaqueta', acc: 'oculos' },
  },
];

export const START_MESSAGES = [
  { from: 'them', text: 'Você acertou a cor do meu chapéu. Como adivinhou?' },
  { from: 'me', text: 'Chute de quem também usaria um chapéu desses num domingo de chuva.' },
  { from: 'them', text: 'Domingo de chuva pede filme antigo. Qual o seu preferido?' },
];
