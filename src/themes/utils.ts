import { Color, type ColorLike, toHex } from '../core/color';

export function lighten(color: ColorLike, amount: number): Color {
  return new Color(toHex(color)).lighter(amount);
}

export function darken(color: ColorLike, amount: number): Color {
  return new Color(toHex(color)).darker(amount);
}

export function transparentize(color: ColorLike, amount: number): Color {
  return new Color(toHex(color)).alpha(1 - amount);
}

export function mix(color1: ColorLike, color2: ColorLike, amount: number = 0.5): Color {
  return new Color(toHex(color1)).mix(new Color(toHex(color2)), amount);
}

export function accent(color: ColorLike, color2: ColorLike, _lighten: number = 0.1, _mix: number = 0.1): Color {
  return new Color(toHex(color)).accent(new Color(toHex(color2)), _mix, _lighten);
}

export function lighter(color: ColorLike): Color {
  return lighten(color, 0.2);
}

export function darker(color: ColorLike): Color {
  return darken(color, 0.2);
}

export function l10(color: ColorLike): Color {
  return lighten(color, 0.1);
}

export function l20(color: ColorLike): Color {
  return lighten(color, 0.2);
}

export function d10(color: ColorLike): Color {
  return darken(color, 0.1);
}

export function d20(color: ColorLike): Color {
  return darken(color, 0.2);
}

export function alpha10(color: ColorLike): Color {
  return transparentize(color, 0.1);
}

export function alpha20(color: ColorLike): Color {
  return transparentize(color, 0.2);
}

export function alpha50(color: ColorLike): Color {
  return transparentize(color, 0.5);
}