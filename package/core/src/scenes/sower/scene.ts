import { BackgroundEntity } from '@package/core/entity/entity.background';
import { CameraEntity } from '@package/core/entity/entity.camera';
import { VegEntity } from '@package/core/entity/entity.veg';
import { WaterEntity } from '@package/core/entity/entity.water';
import type { IScene } from '@package/core/scenes/scene-engine';
import { createCameraUpdateSystem } from '@package/core/systems';
import type { IDiContainer } from '@package/core/util/di-container';
import { shuffle } from '@package/core/util/shuffle';
import { tweenManager } from '@package/core/util/tween';

interface Question {
  text: string;
  options: [string, string];
  correctIndex: number;
}

let questions: Question[] = [
  {
    text: 'What was the farmer dropping on the ground?',
    options: ['Seeds', 'Candy'],
    correctIndex: 0,
  },
  {
    text: "What do the seeds represent in Jesus' story?",
    options: ["God's Word", 'Rocks'],
    correctIndex: 0,
  },
  {
    text: 'What is the dirt or soil supposed to be like in the story?',
    options: ['Our hearts', 'Our shoes'],
    correctIndex: 0,
  },
  {
    text: 'What happened to the seeds that fell on the hard path?',
    options: ['Birds ate them', 'Fish ate them'],
    correctIndex: 0,
  },
  {
    text: "Why couldn't the seeds grow on the rocky ground?",
    options: ['There were too many bugs', "The soil wasn't deep enough for roots"],
    correctIndex: 1,
  },
  {
    text: "What dried up the plants on the rocky ground when they didn't have deep roots?",
    options: ['The hot sun', 'Cold snow'],
    correctIndex: 0,
  },
  {
    text: 'What kind of weeds choked the seeds?',
    options: ['Pretty flowers', 'Prickly thorns'],
    correctIndex: 1,
  },
  {
    text: 'What kind of soil helped the seeds grow big and strong?',
    options: ['Good, soft rich dirt', 'Hard, rocky dirt'],
    correctIndex: 0,
  },
  {
    text: "What should we do when we hear God's Word?",
    options: ['Listen with a good heart', 'Cover our ears'],
    correctIndex: 0,
  },
  {
    text: 'Which seed was the happiest and produced a big harvest?',
    options: ['The seed on the path', 'The seed in the good soil'],
    correctIndex: 1,
  },
  {
    text: 'If our heart is like good soil, what kind of actions will grow in us?',
    options: ['Kindness and love', 'Yelling and pushing'],
    correctIndex: 0,
  },
  {
    text: 'Who told this parable?',
    options: ['Jesus', 'A disciple'],
    correctIndex: 0,
  },
];

const vegAssetNames = ['veg1', 'veg2', 'veg3', 'veg4', 'veg5', 'veg6', 'veg7', 'veg8', 'veg9', 'veg10'] as const;

export const sowerScene = (di: IDiContainer): IScene => {
  const appRef = di.appRef();
  const assetLoader = di.assetLoader();
  const entityStore = di.entityStore();
  const eventBus = di.eventBus();
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

      eventBus.fire('sfx:play', { id: 'correct' });

      if (waterEntity && vegEntity) {
        waterEntity.pour({ x: 320, y: 260 });
        eventBus.fire('sfx:play', { id: 'water' });
        setTimeout(() => {
          vegEntity?.growToStage(currentQuestionIndex);
          eventBus.fire('sfx:play', { id: 'grow' });
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

      eventBus.fire('sfx:play', { id: 'wrong' });

      if (vegEntity) {
        vegEntity.wilt();
        eventBus.fire('sfx:play', { id: 'wilt' });
      }
    }
  };

  const winGame = () => {
    const uiLayer = document.getElementById('ui-layer');
    const victoryScreen = document.getElementById('victory-screen');
    const victorySubtext = document.getElementById('victory-subtext');

    eventBus.fire('sfx:play', { id: 'victory' });

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
      vegEntity = new VegEntity(vegTextures, { x: 320, y: 280, scale: 0.5 });

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
