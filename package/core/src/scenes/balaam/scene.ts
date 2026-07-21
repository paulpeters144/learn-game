import { BackgroundEntity } from '@package/core/entity/entity.background';
import { CameraEntity } from '@package/core/entity/entity.camera';
import { DonkeyEntity } from '@package/core/entity/entity.donkey';
import type { IScene } from '@package/core/scenes/scene-engine';
import { createCameraUpdateSystem } from '@package/core/systems';
import type { IDiContainer } from '@package/core/util/di-container';
import { shuffle } from '@package/core/util/shuffle';
import { tweenManager } from '@package/core/util/tween';
import { type Container, Graphics } from 'pixi.js';

interface Question {
  text: string;
  options: [string, string];
  correctIndex: number;
}

let questions: Question[] = [
  {
    text: 'Who was Balaam?',
    options: ['A farmer', 'A prophet'],
    correctIndex: 1,
  },
  {
    text: 'What animal did Balaam ride?',
    options: ['A camel', 'A donkey'],
    correctIndex: 1,
  },
  {
    text: "Who wanted Balaam to curse God's people?",
    options: ['King Balak', 'King David'],
    correctIndex: 0,
  },
  {
    text: 'Who stood in the road to stop Balaam?',
    options: ['An Angel', 'A lion'],
    correctIndex: 0,
  },
  {
    text: 'Could Balaam see the angel at first?',
    options: ['No', 'Yes'],
    correctIndex: 0,
  },
  {
    text: 'Did the donkey see the angel?',
    options: ['Yes', 'No'],
    correctIndex: 0,
  },
  {
    text: 'How many times did the donkey turn away?',
    options: ['Two times', 'Three times'],
    correctIndex: 1,
  },
  {
    text: 'What did Balaam do when the donkey stopped?',
    options: ['Hit the donkey', 'Fed the donkey'],
    correctIndex: 0,
  },
  {
    text: 'What miracle happened to the donkey?',
    options: ['It grew wings', 'It started talking'],
    correctIndex: 1,
  },
  {
    text: "Did Balaam finally curse or bless God's people?",
    options: ['Blessed them', 'Cursed them'],
    correctIndex: 0,
  },
  {
    text: 'Where was Balaam going?',
    options: ['To the Plains of Moab', 'To Egypt'],
    correctIndex: 0,
  },
  {
    text: 'What did the angel have in its hand?',
    options: ['A sword', 'A staff'],
    correctIndex: 0,
  },
  {
    text: 'Why did the donkey lie down?',
    options: ['It was tired', 'It saw the angel'],
    correctIndex: 1,
  },
  {
    text: 'What did God open to let Balaam see?',
    options: ['His eyes', 'His ears'],
    correctIndex: 0,
  },
  {
    text: 'How many times did Balaam hit the donkey?',
    options: ['Three times', 'Once'],
    correctIndex: 0,
  },
  {
    text: 'What did the donkey say to Balaam?',
    options: ['Why did you hit me?', 'Where are we going?'],
    correctIndex: 0,
  },
  {
    text: 'Did God allow Balaam to go with the men?',
    options: ['Yes, but with conditions', 'No, never'],
    correctIndex: 0,
  },
  {
    text: 'What did Balaam do when he saw the angel?',
    options: ['Ran away', 'Bowed down'],
    correctIndex: 1,
  },
];

function debugDrawWaypoints(path: { x: number; y: number }[], parent: Container): Graphics {
  const g = new Graphics();
  for (const point of path) {
    g.circle(point.x, point.y, 6);
    g.fill({ color: 0xff0000 });
  }
  parent.addChild(g);
  return g;
}

export const balaamScene = (di: IDiContainer): IScene => {
  const appRef = di.appRef();
  const assetLoader = di.assetLoader();
  const entityStore = di.entityStore();
  const eventBus = di.eventBus();
  const gameConstants = di.gameConstants();
  const gameRef = di.gameRef();
  const systemAgg = di.systemAgg();

  let currentQuestionIndex = 0;
  let donkeyEntity: DonkeyEntity | null = null;
  let waypointGraphics: Graphics | null = null;
  let isTransitioning = false;

  const updateUI = () => {
    if (currentQuestionIndex >= questions.length) {
      winGame();
      return;
    }

    const q = questions[currentQuestionIndex];

    const qText = document.getElementById('question-text');
    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');
    const feedback = document.getElementById('feedback-text');

    if (qText) qText.innerText = q.text;
    if (btnA) btnA.innerText = q.options[0];
    if (btnB) btnB.innerText = q.options[1];
    if (feedback) {
      feedback.innerText = '';
      feedback.className = 'feedback-box';
    }

    isTransitioning = false;
  };

  const handleAnswer = (index: number) => {
    console.log('handleAnswer called', index, 'current q:', currentQuestionIndex);
    if (isTransitioning) return;

    const q = questions[currentQuestionIndex];
    const feedback = document.getElementById('feedback-text');

    if (index === q.correctIndex) {
      isTransitioning = true;
      if (feedback) {
        feedback.innerText = 'Correct!';
        feedback.className = 'feedback-box feedback-correct';
      }

      currentQuestionIndex++;
      const progress = currentQuestionIndex / questions.length;

      eventBus.fire('sfx:play', { id: 'correct' });

      if (donkeyEntity) {
        donkeyEntity.setProgress(progress);
        eventBus.fire('sfx:play', { id: 'walk' });
      }

      setTimeout(() => {
        updateUI();
      }, 1500);
    } else {
      eventBus.fire('sfx:play', { id: 'wrong' });
      eventBus.fire('sfx:play', { id: 'bray' });

      if (donkeyEntity) {
        donkeyEntity.shake();
      }
    }
  };

  const winGame = () => {
    const uiLayer = document.getElementById('ui-layer');
    const victoryScreen = document.getElementById('victory-screen');
    const victorySubtext = document.getElementById('victory-subtext');

    eventBus.fire('sfx:play', { id: 'victory' });

    if (victorySubtext) {
      victorySubtext.innerText = 'You made it to the Plains of Moab!';
    }
    if (uiLayer) uiLayer.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'flex';
  };

  const setupEvents = () => {
    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');

    if (btnA) {
      const newBtnA = btnA.cloneNode(true) as HTMLElement;
      btnA.parentNode?.replaceChild(newBtnA, btnA);
      newBtnA.addEventListener('pointerdown', () => {
        eventBus.fire('sfx:play', { id: 'click' });
        handleAnswer(0);
      });
    }

    if (btnB) {
      const newBtnB = btnB.cloneNode(true) as HTMLElement;
      btnB.parentNode?.replaceChild(newBtnB, btnB);
      newBtnB.addEventListener('pointerdown', () => {
        eventBus.fire('sfx:play', { id: 'click' });
        handleAnswer(1);
      });
    }
  };

  return {
    load: async () => {
      questions = shuffle(questions);

      const camera = new CameraEntity({ appRef, gameRef, gameConstants });

      await assetLoader.preload('journeyBg', 'balaam');

      // Create background and scale to fit virtual screen
      const bgSprite = assetLoader.createSprite('journeyBg');
      // Scale to fit 640x360
      bgSprite.scale.set(
        gameConstants.virtualGameWidth / bgSprite.texture.width,
        gameConstants.virtualGameHeight / bgSprite.texture.height,
      );

      // Use existing BackgroundEntity but with the sprite as the container
      const background = new BackgroundEntity({
        width: gameConstants.virtualGameWidth,
        height: gameConstants.virtualGameHeight,
      });
      // Replace the default graphics with our background sprite
      background.ctr.addChild(bgSprite);

      const journeyPath = [
        { x: 140, y: 100 },
        { x: 190, y: 115 },
        { x: 230, y: 115 },
        { x: 265, y: 125 },
        { x: 285, y: 150 },
        { x: 300, y: 165 },
        { x: 280, y: 190 },
        { x: 250, y: 200 },
        { x: 225, y: 215 },
        { x: 215, y: 245 },
        { x: 235, y: 265 },
        { x: 260, y: 275 },
        { x: 285, y: 280 },
        { x: 310, y: 285 },
        { x: 335, y: 290 },
        { x: 355, y: 290 },
        { x: 390, y: 290 },
        { x: 425, y: 290 },
      ];

      const donkeySprite = assetLoader.createSprite('balaam');
      donkeyEntity = new DonkeyEntity(donkeySprite, journeyPath);

      entityStore.add(camera);
      entityStore.add(background);
      entityStore.add(donkeyEntity);

      waypointGraphics = debugDrawWaypoints(journeyPath, gameRef);

      // Only need the camera update system
      systemAgg.add(createCameraUpdateSystem(di));

      // Show UI overlay
      const uiLayer = document.getElementById('ui-layer');
      if (uiLayer) {
        uiLayer.style.display = 'flex';
      }

      setupEvents();
      updateUI();
    },

    update: (delta: number) => {
      systemAgg.update(delta);
      tweenManager.update(performance.now());
    },

    dispose: () => {
      if (waypointGraphics && gameRef) {
        waypointGraphics.destroy();
        waypointGraphics = null;
      }
    },
  };
};
