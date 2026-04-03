import { Color } from "./color";



export interface WithState<T> {
  default: T;
  hovered: T;
  active: T;
  selected: T;
  disabled: T;
}

export interface ElementStyle<T = WithState<Color>> {
  background: T;
  foreground: T;
  border: T;
}


export class StatefulColor {
  value: Color;
  accent: Color;
  base?: Color;
  states?: Partial<WithState<Color>>;

  constructor(
    value: Color,
    accent: Color,
    base = new Color("#000000"),
    stateColors?: Partial<WithState<Color>>
  ) {
    this.value = value;
    this.accent = accent;
    this.base = base;
    this.states = stateColors;
  }

  hovered(): Color {
    return this.states?.hovered || this.value.lighter(0.1);
  }

  active(): Color {
    return this.states?.active || this.value.mix(this.accent, 0.2);
  }

  selected(): Color {
    return this.states?.selected || this.value.mix(this.accent, 0.3).lighter(0.1);
  }

  disabled(): Color {
    return this.states?.disabled || this.value.desaturate(0.5).transparent(0.5);
  }
}

export class Element {
  background: Color;
  foreground: Color;
  border: Color;
  states?: Partial<ElementStyle<Partial<WithState<Color>>>>;

  constructor(
    defaultStyle: ElementStyle<Color>,
    states?: Partial<ElementStyle<Partial<WithState<Color>>>>
  ) {
    const hovered = states?.background?.hovered || defaultStyle.background.lighter(0.1);
    this.background = defaultStyle.background;
    this.foreground = defaultStyle.foreground;
    this.border = defaultStyle.border;
    this.states = states;
  }


}