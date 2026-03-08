import apathy from "./apathy";
import apatheticOcean from "./apatheticOcean";
import apathyExperimental from "./apathyExperimental";
import minted from "./minted";
import mintedTheory from "./mintedTheory";
import slate from "./slate";
import type { ThemeDefinition } from './types';
import { Color } from '@/core/color';

type ThemeDefinitionExtended = ThemeDefinition<Color>;

function  deepMap<T>(obj: T, callback: (value: any) => any) {
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      obj[key] = deepMap(obj[key], callback);
    }
    return obj;
  }
  return callback(obj);
}

export function extendTheme(theme: ThemeDefinition): ThemeDefinitionExtended {
  deepMap(theme, (value) => {
    if (typeof value === 'string') {
      return new Color(value);
    }
    return value;
  });
  deepMap(theme.ui, (value) => {
    if (typeof value === 'string') {
      return new Color(value);
    }
    return value;
  });
  return theme as ThemeDefinitionExtended;
}

export const themes: Record<string, ThemeDefinition> = {
  "Apathy": apathy,
  "Apathetic Ocean": apatheticOcean,
  "Apathy Experimental": apathyExperimental,
  "Minted": minted,
  "Minted Theory": mintedTheory,
  "Slate": slate,
}