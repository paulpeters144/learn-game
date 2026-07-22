import { BackgroundEntity } from '@package/core/entity/entity.background';
import { CameraEntity } from '@package/core/entity/entity.camera';
import { SheepEntity } from '@package/core/entity/entity.sheep';
import { ShepherdEntity } from '@package/core/entity/entity.shepherd';
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
    text: 'Who came to hear Jesus?',
    options: ['Grumpy leaders', 'Tax collectors'],
    correctIndex: 1,
  },
  {
    text: 'How many sheep did the man have?',
    options: ['Ten sheep', 'One hundred sheep'],
    correctIndex: 1,
  },
  {
    text: 'How many sheep got lost?',
    options: ['Ten sheep', 'One sheep'],
    correctIndex: 1,
  },
  {
    text: 'Where did the man leave the ninety-nine?',
    options: ['A locked barn', 'The open field'],
    correctIndex: 1,
  },
  {
    text: 'Did the shepherd care about the sheep?',
    options: ['No', 'Yes'],
    correctIndex: 1,
  },
  {
    text: 'Did the man give up looking?',
    options: ['Yes he quit', 'No, he searched'],
    correctIndex: 1,
  },
  {
    text: 'How did he carry the found sheep?',
    options: ['In a wagon', 'On his shoulders'],
    correctIndex: 1,
  },
  {
    text: 'How did the man feel when he found his sheep?',
    options: ['Very mad', 'Very happy'],
    correctIndex: 1,
  },
  {
    text: 'Where did he take the sheep?',
    options: ['The dark woods', 'Back home'],
    correctIndex: 1,
  },
  {
    text: 'Who did the man call together?',
    options: ['Friends and neighbors', 'Nobody at all'],
    correctIndex: 0,
  },
  {
    text: 'What did he say to his friends?',
    options: ['Rejoice with me', 'Please go away'],
    correctIndex: 0,
  },
  {
    text: 'How many sheep did NOT need help?',
    options: ['Ninety-nine', 'Only five'],
    correctIndex: 0,
  },
  {
    text: 'What happens in heaven when someone comes back to God?',
    options: ['There is joy', 'Nothing at all'],
    correctIndex: 0,
  },
  {
    text: 'Who is the shepherd like?',
    options: ['God', 'A bad king'],
    correctIndex: 0,
  },
  {
    text: 'Who is the lost sheep like?',
    options: ['A lost sinner', 'Perfect people'],
    correctIndex: 0,
  },
  {
    text: 'Who was grumpy at Jesus?',
    options: ['The grumpy leaders', 'The tax collectors'],
    correctIndex: 0,
  },
  {
    text: 'Why did Jesus tell this story?',
    options: ['God loves us', 'To scare people'],
    correctIndex: 0,
  },
  {
    text: 'Is God happy when we come back to him?',
    options: ['Yes, very happy', 'No, not really'],
    correctIndex: 0,
  },
];

const TOTAL_SHEEP = 18;

const herdPositions = [
  { x: 60, y: 230 },
  { x: 100, y: 210 },
  { x: 140, y: 240 },
  { x: 80, y: 260 },
  { x: 160, y: 220 },
  { x: 50, y: 270 },
  { x: 120, y: 250 },
  { x: 170, y: 260 },
  { x: 90, y: 290 },
  { x: 150, y: 280 },
  { x: 70, y: 250 },
  { x: 130, y: 270 },
  { x: 110, y: 230 },
  { x: 40, y: 250 },
  { x: 180, y: 300 },
  { x: 100, y: 300 },
  { x: 190, y: 250 },
  { x: 160, y: 310 },
];

export const lostSheepScene = (di: IDiContainer): IScene => {
  const appRef = di.appRef();
  const assetLoader = di.assetLoader();
  const entityStore = di.entityStore();
  const eventBus = di.eventBus();
  const gameConstants = di.gameConstants();
  const gameRef = di.gameRef();
  const systemAgg = di.systemAgg();

  let currentQuestionIndex = 0;
  let sheepFound = 0;
  let shepherdEntity: ShepherdEntity | null = null;
  let isTransitioning = false;

  const updateSheepCounter = () => {
    const counter = document.getElementById('sheep-counter');
    if (counter) {
      const remaining = TOTAL_SHEEP - sheepFound;
      counter.innerText = remaining > 0 ? `Sheep to find: ${remaining}` : 'All sheep found!';
    }
  };

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

    updateSheepCounter();
    isTransitioning = false;
  };

  const handleAnswer = (index: number) => {
    if (isTransitioning) return;

    const q = questions[currentQuestionIndex];
    const feedback = document.getElementById('feedback-text');

    if (index === q.correctIndex) {
      isTransitioning = true;
      if (feedback) {
        feedback.innerText = 'Correct! The shepherd is searching...';
        feedback.className = 'feedback-box feedback-correct';
      }

      eventBus.fire('sfx:play', { id: 'correct' });

      if (shepherdEntity) {
        // Walk off screen to find the sheep
        shepherdEntity.walkOffScreen(() => {
          eventBus.fire('sfx:play', { id: 'walk' });

          // Pick up a sheep and walk back
          const carriedSheep = assetLoader.createSprite('sheep');
          shepherdEntity?.setCarriedSheep(carriedSheep);

          shepherdEntity?.walkBack(() => {
            eventBus.fire('sfx:play', { id: 'baa' });

            // Remove the carried sheep from shepherd
            shepherdEntity?.removeCarriedSheep();

            // Place sheep in the herd
            const sheepSprite = assetLoader.createSprite('sheep');
            const pos = herdPositions[sheepFound];
            const sheep = new SheepEntity(sheepSprite, pos.x, pos.y);
            entityStore.add(sheep);

            const allSheep = entityStore.getAll(SheepEntity);
            for (const s of allSheep) {
              s.ctr.zIndex = s.ctr.y;
            }
            gameRef.sortChildren();

            sheepFound++;
            updateSheepCounter();

            if (feedback) {
              feedback.innerText = 'The sheep is safe!';
            }

            setTimeout(() => {
              currentQuestionIndex++;
              if (sheepFound >= TOTAL_SHEEP) {
                winGame();
              } else {
                updateUI();
              }
            }, 800);
          });
        });
      }
    } else {
      eventBus.fire('sfx:play', { id: 'wrong' });

      if (feedback) {
        feedback.innerText = 'Not quite! Try again.';
        feedback.className = 'feedback-box feedback-wrong';
      }

      if (shepherdEntity) {
        shepherdEntity.shake();
      }
    }
  };

  const winGame = () => {
    const uiLayer = document.getElementById('ui-layer');
    const victoryScreen = document.getElementById('victory-screen');
    const victorySubtext = document.getElementById('victory-subtext');
    const sheepCounter = document.getElementById('sheep-counter');

    eventBus.fire('sfx:play', { id: 'victory' });

    if (victorySubtext) {
      victorySubtext.innerText = 'The shepherd rejoiced — every sheep is home!';
    }
    if (uiLayer) uiLayer.style.display = 'none';
    if (sheepCounter) sheepCounter.style.display = 'none';
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

      await assetLoader.preload('shepardBg', 'shepard', 'sheep');

      // Background
      const bgSprite = assetLoader.createSprite('shepardBg');
      bgSprite.scale.set(
        gameConstants.virtualGameWidth / bgSprite.texture.width,
        gameConstants.virtualGameHeight / bgSprite.texture.height,
      );

      const background = new BackgroundEntity({
        width: gameConstants.virtualGameWidth,
        height: gameConstants.virtualGameHeight,
      });
      background.ctr.addChild(bgSprite);

      // Shepherd — positioned right of center
      const shepardSprite = assetLoader.createSprite('shepard');
      shepherdEntity = new ShepherdEntity(shepardSprite, 420, 240);

      entityStore.add(camera);
      entityStore.add(background);
      entityStore.add(shepherdEntity);

      systemAgg.add(createCameraUpdateSystem(di));

      gameRef.sortableChildren = true;

      // Show UI overlay
      const uiLayer = document.getElementById('ui-layer');
      if (uiLayer) {
        uiLayer.style.display = 'flex';
      }

      // Show sheep counter
      const sheepCounter = document.getElementById('sheep-counter');
      if (sheepCounter) {
        sheepCounter.style.display = 'block';
      }

      setupEvents();
      updateUI();
    },

    update: (delta: number) => {
      systemAgg.update(delta);
      tweenManager.update(performance.now());
    },

    dispose: () => {
      // Hide sheep counter when leaving the scene
      const sheepCounter = document.getElementById('sheep-counter');
      if (sheepCounter) {
        sheepCounter.style.display = 'none';
      }
    },
  };
};
