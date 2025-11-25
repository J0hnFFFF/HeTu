import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IntelNode, Connection, Tool, AIModelConfig } from '../types';

const DB_NAME = 'nexus-osint-db';
const DB_VERSION = 1;

interface NexusDBSchema extends DBSchema {
  config: {
    key: string;
    value: any;
  };
  nodes: {
    key: string;
    value: IntelNode & { workspaceId: string };
    indexes: { 'by-workspace': string };
  };
  connections: {
    key: string;
    value: Connection & { workspaceId: string };
    indexes: { 'by-workspace': string };
  };
  customTools: {
    key: string;
    value: Tool;
  };
}

const DEFAULT_WORKSPACE_ID = 'default';

let dbInstance: IDBPDatabase<NexusDBSchema> | null = null;

/**
 * 获取数据库实例（单例模式）
 */
const getDB = async (): Promise<IDBPDatabase<NexusDBSchema>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NexusDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 配置表
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config');
      }

      // 节点表
      if (!db.objectStoreNames.contains('nodes')) {
        const nodeStore = db.createObjectStore('nodes', { keyPath: 'id' });
        nodeStore.createIndex('by-workspace', 'workspaceId');
      }

      // 连接表
      if (!db.objectStoreNames.contains('connections')) {
        const connStore = db.createObjectStore('connections', { keyPath: 'id' });
        connStore.createIndex('by-workspace', 'workspaceId');
      }

      // 自定义工具表
      if (!db.objectStoreNames.contains('customTools')) {
        db.createObjectStore('customTools', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
};

// ============ 配置相关 (自动保存) ============

/**
 * 保存 AI 配置
 */
export const saveAIConfig = async (config: AIModelConfig): Promise<void> => {
  const db = await getDB();
  await db.put('config', config, 'aiConfig');
};

/**
 * 加载 AI 配置
 */
export const loadAIConfig = async (): Promise<AIModelConfig | undefined> => {
  const db = await getDB();
  return db.get('config', 'aiConfig');
};

// ============ 自定义工具相关 (自动保存) ============

/**
 * 保存自定义工具
 */
export const saveCustomTool = async (tool: Tool): Promise<void> => {
  const db = await getDB();
  await db.put('customTools', tool);
};

/**
 * 加载所有自定义工具
 */
export const loadCustomTools = async (): Promise<Tool[]> => {
  const db = await getDB();
  return db.getAll('customTools');
};

/**
 * 删除自定义工具
 */
export const deleteCustomTool = async (toolId: string): Promise<void> => {
  const db = await getDB();
  await db.delete('customTools', toolId);
};

// ============ 图谱数据相关 (手动保存) ============

/**
 * 保存图谱数据（节点和连接）
 */
export const saveGraphData = async (
  nodes: IntelNode[],
  connections: Connection[]
): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['nodes', 'connections'], 'readwrite');

  // 清除当前工作区的旧数据
  const nodeStore = tx.objectStore('nodes');
  const connStore = tx.objectStore('connections');

  const existingNodes = await nodeStore.index('by-workspace').getAllKeys(DEFAULT_WORKSPACE_ID);
  const existingConns = await connStore.index('by-workspace').getAllKeys(DEFAULT_WORKSPACE_ID);

  for (const key of existingNodes) {
    await nodeStore.delete(key);
  }
  for (const key of existingConns) {
    await connStore.delete(key);
  }

  // 写入新数据
  for (const node of nodes) {
    await nodeStore.put({ ...node, workspaceId: DEFAULT_WORKSPACE_ID });
  }
  for (const conn of connections) {
    await connStore.put({ ...conn, workspaceId: DEFAULT_WORKSPACE_ID });
  }

  await tx.done;
};

/**
 * 加载图谱数据
 */
export const loadGraphData = async (): Promise<{
  nodes: IntelNode[];
  connections: Connection[];
}> => {
  const db = await getDB();

  const nodesWithWorkspace = await db.getAllFromIndex('nodes', 'by-workspace', DEFAULT_WORKSPACE_ID);
  const connsWithWorkspace = await db.getAllFromIndex('connections', 'by-workspace', DEFAULT_WORKSPACE_ID);

  // 移除 workspaceId 字段返回
  const nodes: IntelNode[] = nodesWithWorkspace.map(({ workspaceId, ...node }) => node as IntelNode);
  const connections: Connection[] = connsWithWorkspace.map(({ workspaceId, ...conn }) => conn as Connection);

  return { nodes, connections };
};

/**
 * 检查是否有已保存的图谱数据
 */
export const hasGraphData = async (): Promise<boolean> => {
  const db = await getDB();
  const count = await db.countFromIndex('nodes', 'by-workspace', DEFAULT_WORKSPACE_ID);
  return count > 0;
};

// ============ 完整数据导出/导入 ============

export interface ExportData {
  version: string;
  exportedAt: string;
  nodes: IntelNode[];
  connections: Connection[];
  customTools: Tool[];
  aiConfig?: AIModelConfig;
}

/**
 * 导出所有数据为 JSON
 */
export const exportAllData = async (
  nodes: IntelNode[],
  connections: Connection[],
  customTools: Tool[],
  aiConfig: AIModelConfig
): Promise<ExportData> => {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    nodes,
    connections,
    customTools: customTools.filter(t => t.isCustom), // 只导出自定义工具
    aiConfig,
  };
};

/**
 * 清除所有数据
 */
export const clearAllData = async (): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['nodes', 'connections', 'customTools', 'config'], 'readwrite');

  await tx.objectStore('nodes').clear();
  await tx.objectStore('connections').clear();
  await tx.objectStore('customTools').clear();
  await tx.objectStore('config').clear();

  await tx.done;
};
