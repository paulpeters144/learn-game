import { menuScene } from '@package/core/scenes/menu/scene';
import { createDiContainer } from '@package/core/util/di-container';

export const createEngine = async (props: { canvas: HTMLCanvasElement }) => {
  const { canvas } = props;
  const di = createDiContainer();

  try {
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    await di.appRef().init({
      backgroundColor: '#000000',
      resolution: 1,
      autoDensity: true,
      antialias: true,
      canvas: canvas,
    });

    di.soundManager();

    const sceneEngine = di.sceneEngine();

    sceneEngine.next(() => menuScene(di));
  } catch (error) {
    console.error(error);
  }

  return {
    constants: () => di.gameConstants(),
    appRef: () => di.appRef(),
  };
};
