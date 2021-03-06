const electron = require('electron');
electron.ipcMain.on('get-all-fonts', (event, arg) => {
  try {
    require('font-list').getFonts().then((fonts) => {
      if (!fonts || !fonts.length) {
        fonts = [];
      }

      fonts = fonts.map((font) => font.replace('"', '').replace('"', ''));

      event.sender.send('send-all-fonts', fonts);
    });
  } catch (e) {
    event.sender.send('send-all-fonts', ['Default Initial']);
  }
});
