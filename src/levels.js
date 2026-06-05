const HOUSES = {
  green: { label: 'Casa Verde', x: 160, y: 526, color: '#7ecb7a' },
  yellow: { label: 'Casa Amarela', x: 373, y: 526, color: '#ffd966' },
  blue: { label: 'Casa Azul', x: 587, y: 526, color: '#8db7ff' },
  red: { label: 'Casa Vermelha', x: 800, y: 526, color: '#ff8d8d' },
};

const START = { x: 480, y: 58 };

function item(emoji, x, y, label) {
  return { emoji, x, y, label: label ?? emoji };
}

function path(id, points, items = [], options = {}) {
  return { id, points, items, ...options };
}

export const houses = HOUSES;
export const startPoint = START;

export const levels = [
  {
    id: 1,
    name: 'Primeiros passos',
    difficulty: 'iniciante',
    target: ['🍎', '⭐'],
    correctHouse: 'green',
    correctPath: 'verde-simples',
    branchFallback: START,
    note: 'Caminho único com curva suave.',
    paths: [
      path('verde-simples', [START, { x: 430, y: 160 }, { x: 300, y: 275 }, { x: HOUSES.green.x, y: 460 }], [item('🍎', 420, 170), item('⭐', 290, 285)]),
      path('beco-curto', [START, { x: 560, y: 168 }, { x: 612, y: 235 }], [item('🧸', 590, 214)], { deadEnd: true }),
    ],
  },
  {
    id: 2,
    name: 'Escolha a fruta',
    difficulty: 'iniciante',
    target: ['🚗', '🍌'],
    correctHouse: 'yellow',
    correctPath: 'amarela-iniciante',
    branchFallback: { x: 480, y: 145 },
    note: 'Primeira bifurcação clara.',
    paths: [
      path('amarela-iniciante', [START, { x: 480, y: 145 }, { x: 420, y: 255 }, { x: HOUSES.yellow.x, y: 460 }], [item('🚗', 482, 147), item('🍌', 418, 259)], { branch: true }),
      path('azul-distrator', [{ x: 480, y: 145 }, { x: 585, y: 260 }, { x: HOUSES.blue.x, y: 460 }], [item('🚲', 575, 250), item('🍌', 590, 370)]),
    ],
  },
  {
    id: 3,
    name: 'Três objetos',
    difficulty: 'iniciante',
    target: ['🐶', '🎈', '🍪'],
    correctHouse: 'red',
    correctPath: 'vermelha-tres',
    branchFallback: { x: 505, y: 160 },
    note: 'Três coletas em sequência.',
    paths: [
      path('vermelha-tres', [START, { x: 505, y: 160 }, { x: 650, y: 245 }, { x: 725, y: 350 }, { x: HOUSES.red.x, y: 460 }], [item('🐶', 505, 160), item('🎈', 650, 245), item('🍪', 725, 350)], { branch: true }),
      path('verde-beco', [{ x: 505, y: 160 }, { x: 345, y: 260 }, { x: 252, y: 330 }], [item('🐱', 350, 258)], { deadEnd: true }),
    ],
  },
  {
    id: 4,
    name: 'Cruzamento visual',
    difficulty: 'iniciante',
    target: ['🌙', '🔑', '🍓'],
    correctHouse: 'blue',
    correctPath: 'azul-cruza',
    branchFallback: { x: 480, y: 175 },
    note: 'Um caminho passa visualmente por outro sem trocar de trilha.',
    paths: [
      path('azul-cruza', [START, { x: 480, y: 175 }, { x: 610, y: 288 }, { x: 585, y: 460 }], [item('🌙', 480, 175), item('🔑', 610, 288), item('🍓', 585, 390)], { crossing: true }),
      path('amarelo-cruza', [{ x: 260, y: 190 }, { x: 690, y: 342 }, { x: HOUSES.yellow.x, y: 460 }], [item('🧩', 560, 296)], { visualOnlyCrossing: true }),
    ],
  },
  {
    id: 5,
    name: 'Beco sem saída',
    difficulty: 'iniciante',
    target: ['🌸', '⚽', '🎵'],
    correctHouse: 'green',
    correctPath: 'verde-beco',
    branchFallback: { x: 455, y: 190 },
    note: 'Distrator termina em beco sem saída.',
    paths: [
      path('verde-beco', [START, { x: 455, y: 190 }, { x: 330, y: 300 }, { x: 225, y: 430 }, { x: HOUSES.green.x, y: 460 }], [item('🌸', 455, 190), item('⚽', 330, 300), item('🎵', 225, 430)], { branch: true }),
      path('beco-flor', [{ x: 455, y: 190 }, { x: 550, y: 290 }, { x: 520, y: 390 }], [item('🌸', 545, 286), item('🧃', 520, 385)], { deadEnd: true }),
    ],
  },
  {
    id: 6,
    name: 'Duas bifurcações',
    difficulty: 'intermediário',
    target: ['🦋', '🍋', '📚'],
    correctHouse: 'yellow',
    correctPath: 'amarelo-duplo',
    branchFallback: { x: 500, y: 260 },
    note: 'Bifurcação inicial e segunda escolha no meio.',
    paths: [
      path('amarelo-duplo', [START, { x: 500, y: 150 }, { x: 500, y: 260 }, { x: 430, y: 365 }, { x: HOUSES.yellow.x, y: 460 }], [item('🦋', 500, 150), item('🍋', 500, 260), item('📚', 430, 365)], { branch: true }),
      path('vermelho-distrator', [{ x: 500, y: 260 }, { x: 660, y: 335 }, { x: HOUSES.red.x, y: 460 }], [item('📦', 660, 335)]),
      path('verde-beco-6', [{ x: 500, y: 150 }, { x: 345, y: 226 }], [item('🦋', 350, 225)], { deadEnd: true }),
    ],
  },
  {
    id: 7,
    name: 'Quatro passos',
    difficulty: 'intermediário',
    target: ['🍇', '🚀', '🐠', '💎'],
    correctHouse: 'red',
    correctPath: 'vermelho-quatro',
    branchFallback: { x: 585, y: 250 },
    note: 'Sequência mais longa.',
    paths: [
      path('vermelho-quatro', [START, { x: 522, y: 135 }, { x: 585, y: 250 }, { x: 670, y: 345 }, { x: 790, y: 455 }], [item('🍇', 522, 135), item('🚀', 585, 250), item('🐠', 670, 345), item('💎', 790, 455)], { branch: true }),
      path('azul-desvio-7', [{ x: 585, y: 250 }, { x: 570, y: 405 }, { x: HOUSES.blue.x, y: 460 }], [item('🐠', 570, 405)]),
    ],
  },
  {
    id: 8,
    name: 'Encruzilhada',
    difficulty: 'intermediário',
    target: ['🥕', '🧲', '🪁', '🍯'],
    correctHouse: 'green',
    correctPath: 'verde-encruzilhada',
    branchFallback: { x: 480, y: 245 },
    note: 'Quatro direções partem do centro.',
    paths: [
      path('verde-encruzilhada', [START, { x: 480, y: 245 }, { x: 380, y: 305 }, { x: 260, y: 390 }, { x: HOUSES.green.x, y: 460 }], [item('🥕', 480, 245), item('🧲', 380, 305), item('🪁', 260, 390), item('🍯', 178, 448)], { intersection: true }),
      path('norte-beco-8', [{ x: 480, y: 245 }, { x: 480, y: 155 }], [item('🥁', 480, 170)], { deadEnd: true }),
      path('leste-beco-8', [{ x: 480, y: 245 }, { x: 680, y: 295 }], [item('🧲', 615, 280)], { deadEnd: true }),
      path('sul-azul-8', [{ x: 480, y: 245 }, { x: HOUSES.blue.x, y: 460 }], [item('🧃', 530, 335)]),
    ],
  },
  {
    id: 9,
    name: 'Objeto repetido',
    difficulty: 'intermediário',
    target: ['⭐', '🍎', '⭐', '🎁'],
    correctHouse: 'blue',
    correctPath: 'azul-repetido',
    branchFallback: { x: 525, y: 220 },
    note: 'A estrela aparece duas vezes na ordem alvo.',
    paths: [
      path('azul-repetido', [START, { x: 455, y: 145 }, { x: 525, y: 220 }, { x: 610, y: 320 }, { x: HOUSES.blue.x, y: 460 }], [item('⭐', 455, 145), item('🍎', 525, 220), item('⭐', 610, 320), item('🎁', 588, 438)], { branch: true }),
      path('vermelho-erro-9', [{ x: 525, y: 220 }, { x: 720, y: 300 }, { x: HOUSES.red.x, y: 460 }], [item('⭐', 720, 300), item('🍎', 780, 420)]),
    ],
  },
  {
    id: 10,
    name: 'Cruzamento duplo',
    difficulty: 'intermediário',
    target: ['🧠', '🔔', '🌟', '🧁'],
    correctHouse: 'yellow',
    correctPath: 'amarelo-cruzamento-duplo',
    branchFallback: { x: 480, y: 210 },
    note: 'Dois cruzamentos visuais com itens distratores.',
    paths: [
      path('amarelo-cruzamento-duplo', [START, { x: 480, y: 210 }, { x: 370, y: 300 }, { x: 430, y: 390 }, { x: HOUSES.yellow.x, y: 460 }], [item('🧠', 480, 210), item('🔔', 370, 300), item('🌟', 430, 390), item('🧁', 375, 445)], { crossing: true }),
      path('visual-vermelho-10', [{ x: 250, y: 255 }, { x: 710, y: 350 }, { x: HOUSES.red.x, y: 460 }], [item('🧠', 650, 337)], { visualOnlyCrossing: true }),
      path('visual-azul-10', [{ x: 620, y: 155 }, { x: 505, y: 335 }, { x: HOUSES.blue.x, y: 460 }], [item('🌂', 542, 292)], { visualOnlyCrossing: true }),
    ],
  },
  {
    id: 11,
    name: 'Sequência avançada',
    difficulty: 'avançado',
    target: ['🦊', '🍄', '🧭', '🎲', '🍒'],
    correctHouse: 'red',
    correctPath: 'vermelho-avancado',
    branchFallback: { x: 600, y: 260 },
    note: 'Cinco objetos e retorno para bifurcação no erro.',
    paths: [
      path('vermelho-avancado', [START, { x: 520, y: 130 }, { x: 600, y: 260 }, { x: 560, y: 345 }, { x: 690, y: 405 }, { x: HOUSES.red.x, y: 460 }], [item('🦊', 520, 130), item('🍄', 600, 260), item('🧭', 560, 345), item('🎲', 690, 405), item('🍒', 780, 445)], { branch: true }),
      path('verde-beco-11', [{ x: 600, y: 260 }, { x: 350, y: 360 }], [item('🧭', 450, 320)], { deadEnd: true }),
    ],
  },
  {
    id: 12,
    name: 'Labirinto em S',
    difficulty: 'avançado',
    target: ['🥁', '🦁', '🔮', '🍉', '✉️'],
    correctHouse: 'green',
    correctPath: 'verde-s',
    branchFallback: { x: 410, y: 315 },
    note: 'Curvas próximas e beco sem saída lateral.',
    paths: [
      path('verde-s', [START, { x: 560, y: 145 }, { x: 420, y: 230 }, { x: 410, y: 315 }, { x: 300, y: 380 }, { x: HOUSES.green.x, y: 460 }], [item('🥁', 560, 145), item('🦁', 420, 230), item('🔮', 410, 315), item('🍉', 300, 380), item('✉️', 170, 450)], { branch: true }),
      path('amarelo-atalho-12', [{ x: 410, y: 315 }, { x: 410, y: 455 }], [item('🍉', 410, 400)]),
      path('beco-12', [{ x: 420, y: 230 }, { x: 650, y: 230 }, { x: 710, y: 180 }], [item('🪀', 650, 230)], { deadEnd: true }),
    ],
  },
  {
    id: 13,
    name: 'Encruzilhadas encadeadas',
    difficulty: 'avançado',
    target: ['🐢', '⚙️', '🍍', '🛸', '🎻'],
    correctHouse: 'yellow',
    correctPath: 'amarelo-encadeado',
    branchFallback: { x: 515, y: 335 },
    note: 'Duas encruzilhadas com distratores repetidos.',
    paths: [
      path('amarelo-encadeado', [START, { x: 480, y: 170 }, { x: 360, y: 255 }, { x: 515, y: 335 }, { x: 430, y: 410 }, { x: HOUSES.yellow.x, y: 460 }], [item('🐢', 480, 170), item('⚙️', 360, 255), item('🍍', 515, 335), item('🛸', 430, 410), item('🎻', 372, 450)], { intersection: true }),
      path('azul-distrator-13', [{ x: 515, y: 335 }, { x: HOUSES.blue.x, y: 460 }], [item('🛸', 570, 425)]),
      path('red-beco-13', [{ x: 360, y: 255 }, { x: 700, y: 255 }, { x: 815, y: 330 }], [item('⚙️', 610, 255), item('🍍', 740, 286)], { deadEnd: true }),
    ],
  },
  {
    id: 14,
    name: 'Rota longa com falso final',
    difficulty: 'avançado',
    target: ['🧃', '🪐', '🐙', '🍀', '📦', '🎯'],
    correctHouse: 'red',
    correctPath: 'vermelho-longo',
    branchFallback: { x: 670, y: 320 },
    note: 'Inclui uma casa final tentadora antes do fim correto.',
    paths: [
      path('vermelho-longo', [START, { x: 520, y: 120 }, { x: 390, y: 210 }, { x: 510, y: 285 }, { x: 670, y: 320 }, { x: 720, y: 405 }, { x: HOUSES.red.x, y: 460 }], [item('🧃', 520, 120), item('🪐', 390, 210), item('🐙', 510, 285), item('🍀', 670, 320), item('📦', 720, 405), item('🎯', 795, 455)], { branch: true }),
      path('azul-falso-final-14', [{ x: 670, y: 320 }, { x: HOUSES.blue.x, y: 460 }], [item('📦', 615, 400)]),
      path('verde-beco-14', [{ x: 390, y: 210 }, { x: 255, y: 300 }], [item('🪐', 255, 300)], { deadEnd: true }),
    ],
  },
  {
    id: 15,
    name: 'Desafio da Casa Azul',
    difficulty: 'avançado',
    target: ['🌈', '🔒', '🦉', '🍕', '🧩', '💡'],
    correctHouse: 'blue',
    correctPath: 'azul-final',
    branchFallback: { x: 565, y: 365 },
    note: 'Último nível: destino final obrigatório na Casa Azul.',
    paths: [
      path('azul-final', [START, { x: 455, y: 135 }, { x: 610, y: 205 }, { x: 450, y: 285 }, { x: 565, y: 365 }, { x: 610, y: 430 }, { x: HOUSES.blue.x, y: 460 }], [item('🌈', 455, 135), item('🔒', 610, 205), item('🦉', 450, 285), item('🍕', 565, 365), item('🧩', 610, 430), item('💡', 590, 455)], { crossing: true, intersection: true }),
      path('vermelho-final-15', [{ x: 565, y: 365 }, { x: HOUSES.red.x, y: 460 }], [item('🧩', 690, 410), item('💡', 785, 455)]),
      path('amarelo-beco-15', [{ x: 450, y: 285 }, { x: 300, y: 360 }, { x: 340, y: 420 }], [item('🍕', 330, 345)], { deadEnd: true }),
      path('verde-cruzamento-15', [{ x: 250, y: 210 }, { x: 705, y: 335 }, { x: HOUSES.green.x, y: 460 }], [item('🔒', 650, 320)], { visualOnlyCrossing: true }),
    ],
  },
];
