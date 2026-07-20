import type { IScene } from '@package/core/scenes/scene-engine';
import { simpleScene } from '@package/core/scenes/simple/scene';
import { sowerScene } from '@package/core/scenes/sower/scene';
import type { IDiContainer } from '@package/core/util/di-container';

export const menuScene = (di: IDiContainer): IScene => {
  const setupMenuEvents = () => {
    const btnBalaam = document.getElementById('btn-balaam');
    const btnSower = document.getElementById('btn-sower');

    if (btnBalaam) {
      const newBtn = btnBalaam.cloneNode(true) as HTMLElement;
      btnBalaam.parentNode?.replaceChild(newBtn, btnBalaam);
      newBtn.addEventListener('pointerdown', () => {
        hideAllUI();
        di.sceneEngine().next(() => simpleScene(di));
      });
    }

    if (btnSower) {
      const newBtn = btnSower.cloneNode(true) as HTMLElement;
      btnSower.parentNode?.replaceChild(newBtn, btnSower);
      newBtn.addEventListener('pointerdown', () => {
        hideAllUI();
        di.sceneEngine().next(() => sowerScene(di));
      });
    }
  };

  const hideAllUI = () => {
    const menuLayer = document.getElementById('menu-layer');
    const uiLayer = document.getElementById('ui-layer');
    const victoryScreen = document.getElementById('victory-screen');
    if (menuLayer) menuLayer.style.display = 'none';
    if (uiLayer) uiLayer.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'none';
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
