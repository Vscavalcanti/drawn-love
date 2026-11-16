// Tudo que pode ser escolhido no editor de personagem.

export const BASES = {
  f: { head: 'f', hair: '#7A4A3A', shirt: '#FFFFFF', accent: '#A0643F', hat: '#A0643F', skin: '#FFFFFF',
    hairStyle: 'franja', eyes: 'cilios', mouth: 'aberto', outfit: 'avental', acc: 'boina' },
  m: { head: 'm', hair: '#2B2B2B', shirt: '#FFFFFF', accent: '#3E6BAA', hat: '#C93A73', skin: '#FFFFFF',
    hairStyle: 'topete', eyes: 'normal', mouth: 'lado', outfit: 'jaqueta', acc: 'bone' },
};

// Base em branco usada no redesenho "Com a base"
export const blankBase = (head) => ({
  ...BASES[head], hair: '#FFFFFF', shirt: '#FFFFFF', accent: '#FFFFFF', hat: '#FFFFFF', skin: '#FFFFFF', acc: 'nenhum',
});

export const COLORS = [
  ['#2B2B2B', 'Preto'], ['#5A5560', 'Grafite'], ['#BDB6C4', 'Cinza'], ['#FFFFFF', 'Branco'], ['#4A2C22', 'Castanho escuro'],
  ['#7A4A3A', 'Castanho'], ['#A0643F', 'Caramelo'], ['#C2552D', 'Ruivo'], ['#F08A3C', 'Laranja'], ['#E8B04B', 'Dourado'],
  ['#F3D98B', 'Loiro claro'], ['#F7D046', 'Amarelo'], ['#A8D25A', 'Verde-limão'], ['#3E9B6A', 'Verde'], ['#22624A', 'Verde-escuro'],
  ['#3CB4B4', 'Turquesa'], ['#7BA3D6', 'Azul claro'], ['#3E6BAA', 'Azul'], ['#22335E', 'Azul-marinho'], ['#B9A3E0', 'Lilás'],
  ['#735A96', 'Roxo'], ['#F7B8CC', 'Rosa claro'], ['#F26B91', 'Rosa'], ['#C93A73', 'Magenta'], ['#D9363E', 'Vermelho'],
  ['#7A1F3D', 'Vinho'], ['#F6D3B8', 'Bege'],
].map(([hex, label]) => ({ hex, label }));

export const SKINS = [
  ['#FFFFFF', 'Branco cartoon'], ['#FBE3D2', 'Muito clara'], ['#F6D3B8', 'Clara'], ['#E8B48F', 'Clara média'], ['#D9A07A', 'Média'],
  ['#B97A52', 'Morena'], ['#8E5638', 'Morena escura'], ['#6B4330', 'Escura'], ['#4A2C20', 'Muito escura'],
].map(([hex, label]) => ({ hex, label }));

// chave do personagem, deslocamento da miniatura (para mostrar a parte certa), opções
export const STYLE_TABS = {
  cabelo: { key: 'hairStyle', offset: -14, options: [['franja', 'Franja e rabo'], ['topete', 'Topete'], ['curto', 'Curto'], ['longo', 'Longo'], ['cacheado', 'Cacheado'], ['coque', 'Coque'], ['careca', 'Careca']] },
  olhos: { key: 'eyes', offset: -38, options: [['normal', 'Normal'], ['cilios', 'Cílios'], ['feliz', 'Feliz'], ['piscando', 'Piscando'], ['apaixonado', 'Apaixonado'], ['sono', 'Sonolento'], ['surpreso', 'Surpreso']] },
  boca: { key: 'mouth', offset: -52, options: [['aberto', 'Sorrisão'], ['lado', 'De lado'], ['lingua', 'Língua'], ['o', 'Surpresa'], ['neutra', 'Neutra'], ['gato', 'Gatinho'], ['dentes', 'Dentes']] },
  roupa: { key: 'outfit', offset: -86, options: [['avental', 'Avental'], ['jaqueta', 'Jaqueta'], ['camiseta', 'Camiseta'], ['moletom', 'Moletom']] },
  acessorio: { key: 'acc', offset: -14, options: [['nenhum', 'Nenhum'], ['boina', 'Boina'], ['bone', 'Boné'], ['gorro', 'Gorro'], ['laco', 'Laço'], ['oculos', 'Óculos'], ['flor', 'Flor']] },
};

export const EDITOR_TABS = [['cores', 'Cores'], ['pele', 'Pele'], ['cabelo', 'Cabelo'], ['olhos', 'Olhos'], ['boca', 'Boca'], ['roupa', 'Roupa'], ['acessorio', 'Acessório']];
