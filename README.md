# GameInfo Generator

GameInfo Generator is a browser-based editor for Deadlock's `gameinfo.gi` files. Start with a community preset, upload a `.gi` or `.json` file, or paste a `GIDocument` as JSON.

[Open GameInfo Generator](https://halviet.github.io/gameinfo-generator/)

- Search, add, edit, and delete ConVars, including their values, types, and comments.
- Toggle mods support from Config options.
- Rename drafts and reopen them in the same browser. Edits are saved locally in IndexedDB.
- Preview and copy the generated `gameinfo.gi`, or download the config as `.gi` or JSON.

The app uses `s2-gameinfo` to parse and generate config files in the browser.

## Credits

Thanks to Sqooky and the OptimizationLock contributors for collecting and maintaining the community configs available in the preset picker. [Sqooky/OptimizationLock](https://github.com/Sqooky/OptimizationLock)
