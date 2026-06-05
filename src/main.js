import { LogicPathGame } from './game.js';

const game = new LogicPathGame({
  canvas: document.querySelector('#gameCanvas'),
  referenceList: document.querySelector('#referenceList'),
  levelBadge: document.querySelector('#levelBadge'),
  message: document.querySelector('#message'),
  controls: {
    prev: document.querySelector('#prevLevel'),
    restart: document.querySelector('#restartLevel'),
    next: document.querySelector('#nextLevel'),
  },
});

game.start();
