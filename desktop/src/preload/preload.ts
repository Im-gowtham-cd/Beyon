import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('beyon', {
  platform: process.platform,
});
