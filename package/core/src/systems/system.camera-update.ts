import { CameraEntity } from '@package/core/entity/entity.camera';
import type { IDiContainer } from '@package/core/util/di-container';
import type { ISystem } from '@package/ecs';

export const createCameraUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const camera = entityStore.first(CameraEntity);

  return {
    name: () => 'camera-update-system',
    update: (delta: number) => {
      camera?.update(delta);
    },
  };
};
