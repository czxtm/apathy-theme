# Apathy Theme for Obsidian

Generated Obsidian CSS themes derived from the Apathy theme family.

## Obsidian App Snippets

1. Pick one generated CSS file from this directory.
2. Copy it into your Obsidian vault's `.obsidian/snippets/` folder.
3. Enable it in `Settings -> Appearance -> CSS snippets`.
4. If you use [obsidian-modular-css-layout](https://github.com/efemkay/obsidian-modular-css-layout), enable those layout snippets too.

These snippets map the Apathy theme colors onto common Obsidian CSS variables and callout colors so layout snippets inherit the theme cleanly.

The generated snippets include [Style Settings](https://github.com/obsidian-community/obsidian-style-settings) metadata for typography, callouts, cards, image grids, and title visibility controls.

## Obsidian Publish Themes

Publish-ready themes are generated into `publish/`. Copy the matching CSS file into your Obsidian Publish site's custom CSS.

The Publish themes use `publish/reference.css` as their static layout reference and replace its color system with generated Apathy theme tokens.

Publish CSS also includes the same Style Settings metadata for users who manage these files inside an Obsidian vault before publishing. Obsidian Publish does not run community plugins on the live site, so copy any custom variables or classes you want into your Publish custom CSS.
