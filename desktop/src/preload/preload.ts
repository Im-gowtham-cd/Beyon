import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('beyon', {
  platform: process.platform,
  auth: {
    getToken: () => ipcRenderer.invoke('auth:get-token'),
    setToken: (token: string) => ipcRenderer.invoke('auth:set-token', token),
    clearToken: () => ipcRenderer.invoke('auth:clear-token'),
  },
  assessment: {
    enterFullscreen: () => ipcRenderer.invoke('assessment:enter-fullscreen'),
    exitFullscreen: () => ipcRenderer.invoke('assessment:exit-fullscreen'),
    isFullscreen: () => ipcRenderer.invoke('assessment:is-fullscreen'),
    lockWindow: () => ipcRenderer.invoke('assessment:lock-window'),
    unlockWindow: () => ipcRenderer.invoke('assessment:unlock-window'),
    disableKeyboardShortcuts: () => ipcRenderer.invoke('assessment:disable-shortcuts'),
    enableKeyboardShortcuts: () => ipcRenderer.invoke('assessment:enable-shortcuts'),
    getSystemInfo: () => ipcRenderer.invoke('assessment:system-info'),
    getDeviceInfo: () => ipcRenderer.invoke('assessment:device-info'),
  },
  proctoring: {
    onFullscreenChange: (callback: (isFullscreen: boolean) => void) => {
      ipcRenderer.on('proctoring:fullscreen-change', (_event, isFullscreen) => callback(isFullscreen));
    },
    onFocusChange: (callback: (hasFocus: boolean) => void) => {
      ipcRenderer.on('proctoring:focus-change', (_event, hasFocus) => callback(hasFocus));
    },
    onBeforeQuit: (callback: () => void) => {
      ipcRenderer.on('proctoring:before-quit', () => callback());
    },
    removeListeners: () => {
      ipcRenderer.removeAllListeners('proctoring:fullscreen-change');
      ipcRenderer.removeAllListeners('proctoring:focus-change');
      ipcRenderer.removeAllListeners('proctoring:before-quit');
    },
  },
});
