import type { WorkbenchApi } from '../preload/preload';

declare global {
  interface Window {
    workbenchApi: WorkbenchApi;
  }
}
