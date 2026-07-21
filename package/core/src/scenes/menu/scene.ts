import { balaamScene } from '@package/core/scenes/balaam/scene';
import { lostSheepScene } from '@package/core/scenes/lost-sheep/scene';
import type { IScene } from '@package/core/scenes/scene-engine';
import { sowerScene } from '@package/core/scenes/sower/scene';
import type { IDiContainer } from '@package/core/util/di-container';

export const menuScene = (di: IDiContainer): IScene => {
  const setupMenuEvents = () => {
    const btnBalaam = document.getElementById('btn-balaam');
    const btnSower = document.getElementById('btn-sower');
    const btnLostSheep = document.getElementById('btn-lost-sheep');

    if (btnBalaam) {
      const newBtn = btnBalaam.cloneNode(true) as HTMLElement;
      btnBalaam.parentNode?.replaceChild(newBtn, btnBalaam);
      newBtn.addEventListener('pointerdown', () => {
        di.eventBus().fire('sfx:play', { id: 'click' });
        hideAllUI();
        di.sceneEngine().next(() => balaamScene(di));
      });
    }

    if (btnSower) {
      const newBtn = btnSower.cloneNode(true) as HTMLElement;
      btnSower.parentNode?.replaceChild(newBtn, btnSower);
      newBtn.addEventListener('pointerdown', () => {
        di.eventBus().fire('sfx:play', { id: 'click' });
        hideAllUI();
        di.sceneEngine().next(() => sowerScene(di));
      });
    }

    if (btnLostSheep) {
      const newBtn = btnLostSheep.cloneNode(true) as HTMLElement;
      btnLostSheep.parentNode?.replaceChild(newBtn, btnLostSheep);
      newBtn.addEventListener('pointerdown', () => {
        di.eventBus().fire('sfx:play', { id: 'click' });
        hideAllUI();
        di.sceneEngine().next(() => lostSheepScene(di));
      });
    }
  };

  const hideAllUI = () => {
    const menuLayer = document.getElementById('menu-layer');
    const uiLayer = document.getElementById('ui-layer');
    const victoryScreen = document.getElementById('victory-screen');
    const sheepCounter = document.getElementById('sheep-counter');
    if (menuLayer) menuLayer.style.display = 'none';
    if (uiLayer) uiLayer.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'none';
    if (sheepCounter) sheepCounter.style.display = 'none';
  };

  return {
    load: async () => {
      hideAllUI();

      const menuLayer = document.getElementById('menu-layer');
      if (menuLayer) {
        menuLayer.style.display = 'flex';
      }

      setupMenuEvents();
    },

    update: () => {},

    dispose: () => {
      hideAllUI();
    },
  };
};
