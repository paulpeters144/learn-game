import { BackgroundEntity } from '@package/core/entity/entity.background';
import { CameraEntity } from '@package/core/entity/entity.camera';
import { DonkeyEntity } from '@package/core/entity/entity.donkey';
import type { IScene } from '@package/core/scenes/scene-engine';
import { createCameraUpdateSystem } from '@package/core/systems';
import type { IDiContainer } from '@package/core/util/di-container';
import { tweenManager } from '@package/core/util/tween';

interface Question {
  text: string;
  options: [string, string];
  correctIndex: number;
}

const questions: Question[] = [
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
];

export const simpleScene = (di: IDiContainer): IScene => {
  const appRef = di.appRef();
  const assetLoader = di.assetLoader();
  const entityStore = di.entityStore();
  const gameConstants = di.gameConstants();
  const gameRef = di.gameRef();
  const systemAgg = di.systemAgg();

  let currentQuestionIndex = 0;
  let donkeyEntity: DonkeyEntity | null = null;
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
      // Correct!
      isTransitioning = true;
      if (feedback) {
        feedback.innerText = 'Correct!';
        feedback.className = 'feedback-box feedback-correct';
      }

      currentQuestionIndex++;
      const progress = currentQuestionIndex / questions.length;

      if (donkeyEntity) {
        donkeyEntity.setProgress(progress);
      }

      setTimeout(() => {
        updateUI();
      }, 1500);
    } else {
      // Wrong!
      if (feedback) {
        feedback.innerText = "The donkey yells: 'What have I done to you?!'";
        feedback.className = 'feedback-box feedback-wrong';
      }

      if (donkeyEntity) {
        donkeyEntity.shake();
      }
    }
  };

  const winGame = () => {
    const uiLayer = document.getElementById('ui-layer');
    const victoryScreen = document.getElementById('victory-screen');

    if (uiLayer) uiLayer.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'flex';
  };

  const setupEvents = () => {
    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');

    // Remove existing event listeners safely
    if (btnA) {
      const newBtnA = btnA.cloneNode(true) as HTMLElement;
      btnA.parentNode?.replaceChild(newBtnA, btnA);
      newBtnA.addEventListener('click', () => handleAnswer(0));
    }

    if (btnB) {
      const newBtnB = btnB.cloneNode(true) as HTMLElement;
      btnB.parentNode?.replaceChild(newBtnB, btnB);
      newBtnB.addEventListener('click', () => handleAnswer(1));
    }
  };

  return {
    load: async () => {
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
        { x: 200, y: 120 },
        { x: 270, y: 140 },
        { x: 330, y: 135 },
        { x: 375, y: 150 },
        { x: 350, y: 195 },
        { x: 280, y: 220 },
        { x: 220, y: 245 },
        { x: 250, y: 275 },
        { x: 340, y: 285 },
        { x: 440, y: 290 },
      ];

      const donkeySprite = assetLoader.createSprite('balaam');
      donkeyEntity = new DonkeyEntity(donkeySprite, journeyPath);

      entityStore.add(camera);
      entityStore.add(background);
      entityStore.add(donkeyEntity);

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

    dispose: () => {},
  };
};
