import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('beyon', {
  platform: process.platform,
  auth: {
    getToken: () => ipcRenderer.invoke('auth:get-token'),
    setToken: (token: string) => ipcRenderer.invoke('auth:set-token', token),
    clearToken: () => ipcRenderer.invoke('auth:clear-token'),
  },
});
