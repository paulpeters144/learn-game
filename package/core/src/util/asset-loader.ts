import balaam_url from '@package/assets/images/balaam-donkey.png';
import journey_bg_url from '@package/assets/images/journey-background.png';
import sheep_url from '@package/assets/images/sheppard/sheep.png';
import shepard_url from '@package/assets/images/sheppard/shepard.png';
import shepard_bg_url from '@package/assets/images/sheppard/shepard-bg.png';
import veg_1_url from '@package/assets/images/sower/veg-1.png';
import veg_2_url from '@package/assets/images/sower/veg-2.png';
import veg_3_url from '@package/assets/images/sower/veg-3.png';
import veg_4_url from '@package/assets/images/sower/veg-4.png';
import veg_5_url from '@package/assets/images/sower/veg-5.png';
import veg_6_url from '@package/assets/images/sower/veg-6.png';
import veg_7_url from '@package/assets/images/sower/veg-7.png';
import veg_8_url from '@package/assets/images/sower/veg-8.png';
import veg_9_url from '@package/assets/images/sower/veg-9.png';
import veg_10_url from '@package/assets/images/sower/veg-10.png';
import veg_bg_url from '@package/assets/images/sower/veg-bg.png';
import * as PIXI from 'pixi.js';

const assetMap = {
  balaam: balaam_url,
  journeyBg: journey_bg_url,
  vegBg: veg_bg_url,
  veg1: veg_1_url,
  veg2: veg_2_url,
  veg3: veg_3_url,
  veg4: veg_4_url,
  veg5: veg_5_url,
  veg6: veg_6_url,
  veg7: veg_7_url,
  veg8: veg_8_url,
  veg9: veg_9_url,
  veg10: veg_10_url,
  shepard: shepard_url,
  shepardBg: shepard_bg_url,
  sheep: sheep_url,
};

export const assetFilePath = [
  'balaam',
  'journeyBg',
  'vegBg',
  'veg1',
  'veg2',
  'veg3',
  'veg4',
  'veg5',
  'veg6',
  'veg7',
  'veg8',
  'veg9',
  'veg10',
  'shepard',
  'shepardBg',
  'sheep',
] as const;
export type AssetName = (typeof assetFilePath)[number];

const assertNoMissingAssetName = () => {
  for (const mapKey in assetMap) {
    const name = mapKey as AssetName;
    if (!assetFilePath.includes(name)) {
      throw new Error(`"${name}" is not a valid AssetName`);
    }
  }
};

export interface IAssetLoader {
  createSprite: (name: AssetName) => PIXI.Sprite;
  preload: (...names: AssetName[]) => Promise<void>;
  getTexture: (name: AssetName) => PIXI.Texture;
}

export const createAssetLoader = (): IAssetLoader => {
  const textures: Record<string, PIXI.Texture> = {};
  assertNoMissingAssetName();

  return {
    createSprite: (name: AssetName) => {
      const texture = textures[name];
      if (!texture) throw new Error(`asset was not preloaded: "${name}"`);
      const result = new PIXI.Sprite(texture);
      return result;
    },
    getTexture: (name: AssetName) => {
      const result = textures[name];
      if (!result) throw new Error(`asset was not preloaded: "${name}"`);
      return textures[name];
    },
    preload: async (...assetNames: AssetName[]) => {
      PIXI.Assets.reset();
      for (const key of assetNames) {
        const path = assetMap[key];
        PIXI.Assets.add({ alias: key, src: path });
      }
      const assets = await PIXI.Assets.load(assetNames);
      for (const key of Object.keys(assets)) {
        if (!assets[key]) continue;
        textures[key] = assets[key];
        textures[key].source.scaleMode = 'nearest';
      }
    },
  };
};
