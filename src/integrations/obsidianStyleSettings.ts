/**
 * Shared Obsidian Style Settings metadata.
 *
 * The Style Settings community plugin parses @settings comments from themes and
 * snippets, then writes the configured CSS variables/classes onto body.
 */

export const obsidianStyleSettingsBlock = `/* @settings

name: Apathy Theme
id: apathy-theme
settings:
  -
    id: publish-note
    title: Obsidian Publish note
    description: "Publish sites do not run community plugins. Configure these settings in Obsidian, then copy any resulting custom CSS variables or classes into your Publish custom CSS when needed."
    type: info-text
    markdown: true
  -
    id: typography
    title: Typography
    type: heading
    level: 2
    collapsed: true
  -
    id: font-text-size
    title: Text size
    type: variable-number-slider
    default: 16
    min: 12
    max: 24
    step: 1
    format: px
  -
    id: font-small
    title: Small text size
    type: variable-number-slider
    default: 13
    min: 10
    max: 18
    step: 1
    format: px
  -
    id: layout
    title: Layout
    type: heading
    level: 2
    collapsed: true
  -
    id: apathy-hide-title
    title: Hide page title
    description: Hide the rendered page title in Obsidian and Obsidian Publish.
    type: class-toggle
  -
    id: image-radius
    title: Image radius
    type: variable-number-slider
    default: 8
    min: 0
    max: 24
    step: 1
    format: px
  -
    id: callouts
    title: Callouts
    type: heading
    level: 2
    collapsed: true
  -
    id: callout-radius
    title: Callout radius
    type: variable-number-slider
    default: 8
    min: 0
    max: 24
    step: 1
    format: px
  -
    id: callout-border-width
    title: Callout border width
    type: variable-number-slider
    default: 1
    min: 0
    max: 4
    step: 1
    format: px
  -
    id: cards
    title: Cards
    type: heading
    level: 2
    collapsed: true
  -
    id: cards-min-width
    title: Card minimum width
    type: variable-number-slider
    default: 180
    min: 120
    max: 360
    step: 10
    format: px
  -
    id: cards-padding
    title: Card padding
    type: variable-number-slider
    default: 1.2
    min: 0.5
    max: 3
    step: 0.1
    format: em
  -
    id: cards-image-height
    title: Card image height
    type: variable-number-slider
    default: 400
    min: 120
    max: 720
    step: 20
    format: px
  -
    id: cards-image-fit
    title: Card image fit
    type: variable-select
    default: contain
    options:
      -
        label: Contain
        value: contain
      -
        label: Cover
        value: cover
      -
        label: Fill
        value: fill
  -
    id: image-grid
    title: Image grid
    type: heading
    level: 2
    collapsed: true
  -
    id: img-grid-gap
    title: Image grid gap
    type: variable-number-slider
    default: 0.5
    min: 0
    max: 2
    step: 0.05
    format: rem
  -
    id: img-grid-fit
    title: Image grid fit
    type: variable-select
    default: cover
    options:
      -
        label: Cover
        value: cover
      -
        label: Contain
        value: contain
      -
        label: Fill
        value: fill

*/`;

export const obsidianAppStyleSettingsCss = `.apathy-hide-title .inline-title {
  display: none;
}`;

export const obsidianPublishStyleSettingsCss = `.apathy-hide-title .page-header {
  display: none;
}`;
