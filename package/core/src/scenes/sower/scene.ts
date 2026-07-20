import { BackgroundEntity } from '@package/core/entity/entity.background';
import { CameraEntity } from '@package/core/entity/entity.camera';
import { VegEntity } from '@package/core/entity/entity.veg';
import { WaterEntity } from '@package/core/entity/entity.water';
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
    text: 'What did the farmer go out to do?',
    options: ['Plant seeds', 'Harvest wheat'],
    correctIndex: 0,
  },
  {
    text: 'What happened to the seeds that fell on the path?',
    options: ['Birds ate them', 'They grew tall'],
    correctIndex: 0,
  },
  {
    text: 'What happened to the seeds on rocky ground?',
    options: ['Sprang up but withered', 'Never sprouted'],
    correctIndex: 0,
  },
  {
    text: 'Why did the rocky ground plants wither?',
    options: ['No deep roots', 'Too much water'],
    correctIndex: 0,
  },
  {
    text: 'What happened to the seeds among thorns?',
    options: ['Thorns choked them', 'They grew strong'],
    correctIndex: 0,
  },
  {
    text: 'What happened to the seeds on good soil?',
    options: ['Produced a great crop', 'Birds ate them'],
    correctIndex: 0,
  },
  {
    text: 'What does the seed represent in the parable?',
    options: ["God's Word", 'Money'],
    correctIndex: 0,
  },
  {
    text: 'What does the path represent?',
    options: ["Those who don't understand", 'Those who obey'],
    correctIndex: 0,
  },
  {
    text: 'What do the thorns represent?',
    options: ['Worries and wealth', 'Friends and family'],
    correctIndex: 0,
  },
  {
    text: 'What does the good soil represent?',
    options: ['Those who hear and obey', 'Those who are rich'],
    correctIndex: 0,
  },
];

const vegAssetNames = ['veg1', 'veg2', 'veg3', 'veg4', 'veg5', 'veg6', 'veg7', 'veg8', 'veg9', 'veg10'] as const;

export const sowerScene = (di: IDiContainer): IScene => {
  const appRef = di.appRef();
  const assetLoader = di.assetLoader();
  const entityStore = di.entityStore();
  const gameConstants = di.gameConstants();
  const gameRef = di.gameRef();
  const systemAgg = di.systemAgg();

  let currentQuestionIndex = 0;
  let vegEntity: VegEntity | null = null;
  let waterEntity: WaterEntity | null = null;
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
    if (isTransitioning) return;

    const q = questions[currentQuestionIndex];
    const feedback = document.getElementById('feedback-text');

    if (index === q.correctIndex) {
      isTransitioning = true;
      if (feedback) {
        feedback.innerText = 'Correct! Watering the seed...';
        feedback.className = 'feedback-box feedback-correct';
      }

      currentQuestionIndex++;

      if (waterEntity && vegEntity) {
        waterEntity.pour({ x: 320, y: 280 });
        setTimeout(() => {
          vegEntity?.growToStage(currentQuestionIndex);
        }, 500);
      }

      setTimeout(() => {
        updateUI();
      }, 1500);
    } else {
      if (feedback) {
        feedback.innerText = 'Not quite! Try again.';
        feedback.className = 'feedback-box feedback-wrong';
      }

      if (vegEntity) {
        vegEntity.wilt();
      }
    }
  };

  const winGame = () => {
    const uiLayer = document.getElementById('ui-layer');
    const victoryScreen = document.getElementById('victory-screen');
    const victorySubtext = document.getElementById('victory-subtext');

    if (victorySubtext) {
      victorySubtext.innerText = 'The seed fell on good soil and produced a crop!';
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
      newBtnA.addEventListener('pointerdown', () => handleAnswer(0));
    }

    if (btnB) {
      const newBtnB = btnB.cloneNode(true) as HTMLElement;
      btnB.parentNode?.replaceChild(newBtnB, btnB);
      newBtnB.addEventListener('pointerdown', () => handleAnswer(1));
    }
  };

  return {
    load: async () => {
      const camera = new CameraEntity({ appRef, gameRef, gameConstants });

      await assetLoader.preload('vegBg', ...vegAssetNames);

      // Background
      const bgSprite = assetLoader.createSprite('vegBg');
      bgSprite.scale.set(
        gameConstants.virtualGameWidth / bgSprite.texture.width,
        gameConstants.virtualGameHeight / bgSprite.texture.height,
      );

      const background = new BackgroundEntity({
        width: gameConstants.virtualGameWidth,
        height: gameConstants.virtualGameHeight,
      });
      background.ctr.addChild(bgSprite);

      // Veg entity — positioned on the dirt field area of the background
      const vegTextures = vegAssetNames.map((name) => assetLoader.getTexture(name));
      vegEntity = new VegEntity(vegTextures, { x: 320, y: 300, scale: 0.5 });

      // Water entity
      waterEntity = new WaterEntity();

      entityStore.add(camera);
      entityStore.add(background);
      entityStore.add(vegEntity);
      entityStore.add(waterEntity);

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
