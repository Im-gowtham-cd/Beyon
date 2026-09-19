import { contextBridge, ipcRenderer } from 'electron';

export interface WorkbenchApi {
  // Dolt
  getDoltStatus: () => Promise<any>;
  getDoltTables: () => Promise<any>;
  getDoltSchema: (tableName: string) => Promise<any>;
  getDoltRows: (params: { tableName: string; limit?: number; offset?: number; search?: string }) => Promise<any>;
  executeDoltQuery: (sql: string) => Promise<any>;
  getDoltLog: () => Promise<any>;
  getDoltBranches: () => Promise<any>;
  getDoltDiff: (tableName?: string) => Promise<any>;

  // Floci
  getFlociStatus: () => Promise<any>;
  listS3Buckets: () => Promise<any>;
  listS3Objects: (bucketName: string) => Promise<any>;
  listSqsQueues: () => Promise<any>;
  peekSqsMessages: (queueUrl: string) => Promise<any>;
  sendSqsMessage: (params: { queueUrl: string; messageBody: string }) => Promise<any>;
  purgeSqsQueue: (queueUrl: string) => Promise<any>;
  listDynamoTables: () => Promise<any>;
  scanDynamoTable: (tableName: string) => Promise<any>;
  listSnsTopics: () => Promise<any>;
  listEventBridgeRules: () => Promise<any>;
  putEventBridgeEvent: (params: { source: string; detailType: string; detail: string }) => Promise<any>;

  // System & AI
  getClusterHealth: () => Promise<any>;
  testAiEndpoint: (params: { path: string; method?: string; body?: any }) => Promise<any>;
}

const api: WorkbenchApi = {
  // Dolt
  getDoltStatus: () => ipcRenderer.invoke('dolt:status'),
  getDoltTables: () => ipcRenderer.invoke('dolt:tables'),
  getDoltSchema: (tableName) => ipcRenderer.invoke('dolt:schema', tableName),
  getDoltRows: (params) => ipcRenderer.invoke('dolt:rows', params),
  executeDoltQuery: (sql) => ipcRenderer.invoke('dolt:query', sql),
  getDoltLog: () => ipcRenderer.invoke('dolt:log'),
  getDoltBranches: () => ipcRenderer.invoke('dolt:branches'),
  getDoltDiff: (tableName) => ipcRenderer.invoke('dolt:diff', tableName),

  // Floci
  getFlociStatus: () => ipcRenderer.invoke('floci:status'),
  listS3Buckets: () => ipcRenderer.invoke('floci:s3:list-buckets'),
  listS3Objects: (bucketName) => ipcRenderer.invoke('floci:s3:list-objects', bucketName),
  listSqsQueues: () => ipcRenderer.invoke('floci:sqs:list-queues'),
  peekSqsMessages: (queueUrl) => ipcRenderer.invoke('floci:sqs:peek-messages', queueUrl),
  sendSqsMessage: (params) => ipcRenderer.invoke('floci:sqs:send-message', params),
  purgeSqsQueue: (queueUrl) => ipcRenderer.invoke('floci:sqs:purge-queue', queueUrl),
  listDynamoTables: () => ipcRenderer.invoke('floci:dynamo:list-tables'),
  scanDynamoTable: (tableName) => ipcRenderer.invoke('floci:dynamo:scan-table', tableName),
  listSnsTopics: () => ipcRenderer.invoke('floci:sns:list-topics'),
  listEventBridgeRules: () => ipcRenderer.invoke('floci:events:list-rules'),
  putEventBridgeEvent: (params) => ipcRenderer.invoke('floci:events:put-event', params),

  // System & AI
  getClusterHealth: () => ipcRenderer.invoke('system:health'),
  testAiEndpoint: (params) => ipcRenderer.invoke('ai:test-endpoint', params),
};

contextBridge.exposeInMainWorld('workbenchApi', api);
