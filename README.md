
<div align="center">
  <h1>apathy</h1>
  A sophisticated dark theme with vibrant, neon-like syntax highlighting.<br /> Excellent contrast and readability while maintaining a visually striking aesthetic.
  <br /><br />
  <a href="https://vscode.dev/editor/theme/coopermaruyama.apathy-theme">Live Demo</a>
  <br /><br />
  <img width="1054" height="699" alt="minted" src="https://github.com/user-attachments/assets/c0fe7102-033c-448a-96c9-4162a6eb724f" />
</div>


<div align="center">
  
</div>
<br />

## Variants


<details open>
  <summary><h2>theory</h2></summary>
  <div align="center"><img width="1072" height="709" alt="theory" src="https://github.com/user-attachments/assets/f0137389-c1b2-41f5-8724-751f5511b298"/></div>
</details>

<br />

<details open>
  <summary><h2>minted</h2></summary>
  <div align="center"><img width="1054" height="699" alt="minted" src="https://github.com/user-attachments/assets/c0fe7102-033c-448a-96c9-4162a6eb724f" /></div>
</details>

<br />

<details open>
  <summary><h2>ocean</h2></summary>
  <div align="center"><img width="1081" height="709" alt="ocean" src="https://github.com/user-attachments/assets/5c12d4a5-36e6-415e-a256-7f220a9d1bf6" /></div>
</details>

<br />




## ⚙️ Recommended Settings

To get the same look as the screenshots, do the following:

1. Get the Monaspace font [here](https://monaspace.githubnext.com/)
2. Use the following settings in VS Code:

```json
{
    "window.titleBarStyle": "custom",
    "workbench.colorTheme": "Apathetic Ocean",
    "editor.fontFamily": "'Monaspace Neon', monospace",
    "editor.fontLigatures": "'calt', 'ss01', 'ss02', 'ss03', 'ss05', 'ss06', 'ss07', 'ss08', 'ss09', 'liga'",
    "editor.fontSize": 11,
    "editor.fontVariations": "\"wght\" 200, \"wdth\" 100",
    "editor.fontWeight": "200",
    "editor.inlineSuggest.fontFamily": "'Monaspace Krypton', monospace",
    "editor.lineHeight": 1.6,
    "editor.minimap.enabled": false,
    "editor.rulers": [
        80
    ],
    "workbench.editor.showIcons": false,
    "workbench.fontAliasing": "antialiased",
    "workbench.panel.showLabels": false,
    "workbench.secondarySideBar.showLabels": false,
}
```

## ✨ Features

- **Deep Dark Background**: Rich purple-black background (`#0F0D1A`) that's easy on the eyes
- **Vibrant Syntax Highlighting**: Carefully chosen colors that provide excellent contrast
- **Language-Specific Optimizations**: Enhanced highlighting for JavaScript, TypeScript, Python, CSS, JSON, and more
- **Comprehensive UI Theming**: Full VS Code interface theming including sidebars, panels, and status bar
- **Git Integration**: Clear colors for git decorations and diff highlighting
- **Accessibility**: High contrast ratios for better readability

## 🎨 Color Palette

Here are some key colors from the Apathy theme palette:

| Name          |                                                            Sample                                                            |    Hex    |
| ------------- | :--------------------------------------------------------------------------------------------------------------------------: | :-------: |
| Background    | <span style="display:inline-block;width:24px;height:24px;background:#0F0D1A;border-radius:4px;border:1px solid #333"></span> | `#0F0D1A` |
| Foreground    | <span style="display:inline-block;width:24px;height:24px;background:#E6E6F1;border-radius:4px;border:1px solid #333"></span> | `#E6E6F1` |
| Accent Purple | <span style="display:inline-block;width:24px;height:24px;background:#A277FF;border-radius:4px;border:1px solid #333"></span> | `#A277FF` |
| Neon Blue     | <span style="display:inline-block;width:24px;height:24px;background:#61FFCA;border-radius:4px;border:1px solid #333"></span> | `#61FFCA` |
| Soft Yellow   | <span style="display:inline-block;width:24px;height:24px;background:#FFCA85;border-radius:4px;border:1px solid #333"></span> | `#FFCA85` |
| Vibrant Pink  | <span style="display:inline-block;width:24px;height:24px;background:#FF6767;border-radius:4px;border:1px solid #333"></span> | `#FF6767` |
| Muted Cyan    | <span style="display:inline-block;width:24px;height:24px;background:#21BFC2;border-radius:4px;border:1px solid #333"></span> | `#21BFC2` |
| Soft Gray     | <span style="display:inline-block;width:24px;height:24px;background:#6D6D7C;border-radius:4px;border:1px solid #333"></span> | `#6D6D7C` |

> _Colors shown above are representative samples from the theme's JSON file._

## 🚀 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Apathy Theme"
4. Click Install
5. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
6. Type "Color Theme" and select "Preferences: Color Theme"
7. Choose "Apathy" from the list

### From Source

1. Clone this repository
2. Copy the folder to your VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions`
   - **macOS**: `~/.vscode/extensions`
   - **Linux**: `~/.vscode/extensions`
3. Restart VS Code
4. Select the theme as described above

## 🛠 Supported Languages

Apathy theme includes optimized highlighting for:

- JavaScript/TypeScript
- Python
- CSS/SCSS/Less
- HTML
- JSON
- Markdown
- Git
- And many more...

## 🎯 Design Philosophy

Apathy was designed with these principles in mind:

1. **Readability First**: Every color choice prioritizes code readability
2. **Semantic Highlighting**: Similar language constructs use consistent colors
3. **Visual Hierarchy**: Important elements stand out while maintaining harmony
4. **Eye Comfort**: Dark background reduces eye strain during long coding sessions
5. **Aesthetic Appeal**: Beautiful colors that make coding enjoyable

## 🔧 Customization

If you want to customize the theme, you can:

1. Open VS Code settings (`Ctrl+,` / `Cmd+,`)
2. Search for "workbench.colorCustomizations"
3. Add your custom colors:

```json
{
  "workbench.colorCustomizations": {
    "[Apathy]": {
      "editor.background": "#your-color-here"
    }
  }
}
```

## 🐛 Issues & Feedback

Found a bug or have a suggestion? Please open an issue on [GitHub](https://github.com/coopermaruyama/apathy-theme/issues).

## 📝 License

This theme is licensed under the [MIT License](LICENSE).

## 🙏 Credits

Originally created for Atom by Cooper Maruyama. Ported to VS Code with love and attention to detail.

## 🌟 Show Your Support

If you enjoy using Apathy, consider:

- ⭐ Starring the project on GitHub
- 📝 Leaving a review on the VS Code Marketplace
- 🐛 Reporting issues or suggesting improvements
- 📢 Sharing with other developers

---

_Happy coding with Apathy! 💜_
