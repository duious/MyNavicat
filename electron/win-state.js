const electron = require('electron');
const app = electron.app;
const path = require('path');
const fs = require('fs');

const winState = {
  // {x, y, width, height}
  getLastState() {
    let data = false;

    try {
      data = fs.readFileSync(this.getStateFile());
    } catch (err) {
    }

    return this.parseJson(data);
  },

  watchClose(win) {
    win.on('close', () => {
      const winState = this.getWinState(win);

      if (!winState) {
        return;
      }

      this.saveStateToStorage(winState);
    });
  },

  getWinState(win) {
    try {
      const winBounds = win.getBounds();

      let state = {
        x: winBounds.x,
        y: winBounds.y,
        width: winBounds.width,
        height: winBounds.height,
      }

      // minimum size limit
      state.width < 200 && (state.width = 200);
      state.height < 200 && (state.height = 200);

      return state;
    } catch (err) {
      return false;
    }
  },

  saveStateToStorage(winState) {
    fs.writeFile(this.getStateFile(), JSON.stringify(winState), (err) => {
    });
  },

  getStateFile() {
    const userPath = app.getPath('userData');
    const fileName = 'ardm-win-state.json';

    return path.join(userPath, fileName);
  },

  parseJson(str) {
    let json = false;

    try {
      json = JSON.parse(str);
    } catch (err) {
    }

    return json;
  },
};

module.exports = winState;