/**
 * Investigation Suggestion Engine (调查建议引擎)
 *
 * 核心算法模块 - 基于数学方法评估情报完整性并生成调查建议
 *
 * 设计理念：
 * - 关系完整性：使用概率矩阵法（实体类型间关系期望相对稳定）
 * - 属性完整性：使用自适应统计法（属性动态，从数据学习）
 * - 结构完整性：使用图论指标（纯数学计算）
 *
 * @author Nexus OSINT Platform
 * @version 1.0.0
 */

import { IntelNode, Connection, NodeType } from '../types';

// ============================================================================
// 类型定义
// ============================================================================

/** 调查建议优先级 */
export type SuggestionPriority = 'critical' | 'high' | 'medium' | 'low';

/** 缺失关系建议 */
export interface MissingRelation {
  targetType: NodeType;
  expectedProbability: number;
  description: string;
}

/** 稀疏属性建议 */
export interface SparseAttribute {
  field: string;
  importance: number;  // 信息量权重 (0-1)
  fillRate: number;    // 当前填充率
}

/** 结构问题 */
export interface StructuralIssue {
  type: 'isolated' | 'low_connectivity' | 'bridge_dependency' | 'peripheral';
  severity: number;    // 严重程度 (0-1)
  description: string;
}

/** 单节点完整性分析结果 */
export interface NodeCompleteness {
  nodeId: string;
  nodeType: NodeType;
  nodeTitle: string;

  // 三维完整性评分 (0-1)
  relationScore: number;
  attributeScore: number;
  structureScore: number;

  // 综合完整性评分 (0-1)
  overallScore: number;

  // 调查建议
  missingRelations: MissingRelation[];
  sparseAttributes: SparseAttribute[];
  structuralIssues: StructuralIssue[];

  // 优先级
  priority: SuggestionPriority;
}

/** 全局分析结果 */
export interface InvestigationAnalysis {
  // 整体统计
  totalNodes: number;
  averageCompleteness: number;
  completenessDistribution: {
    critical: number;  // < 0.3
    low: number;       // 0.3 - 0.5
    medium: number;    // 0.5 - 0.7
    high: number;      // > 0.7
  };

  // 节点详细分析
  nodeAnalysis: NodeCompleteness[];

  // 全局建议（按优先级排序）
  prioritizedSuggestions: NodeCompleteness[];

  // 图谱整体健康度
  graphHealth: {
    connectivity: number;      // 连通性评分
    informationDensity: number; // 信息密度
    structuralBalance: number;  // 结构均衡度
  };
}

// ============================================================================
// 关系概率矩阵 (Relation Probability Matrix)
// ============================================================================

/**
 * 预定义的关系期望矩阵
 * P[sourceType][targetType] = 期望概率 (0-1)
 *
 * 这些值基于情报分析领域的先验知识
 * 值越高表示该类型节点越应该有此类关系
 */
const RELATION_PROBABILITY_MATRIX: Partial<Record<NodeType, Partial<Record<NodeType, number>>>> = {
  // 人物实体
  [NodeType.ENTITY]: {
    [NodeType.PHONE_NUMBER]: 0.85,
    [NodeType.EMAIL]: 0.80,
    [NodeType.SOCIAL_PROFILE]: 0.75,
    [NodeType.ORGANIZATION]: 0.70,
    [NodeType.GEO_LOCATION]: 0.65,
    [NodeType.BANK_ACCOUNT]: 0.50,
    [NodeType.VEHICLE]: 0.45,
    [NodeType.DEVICE]: 0.60,
    [NodeType.DOCUMENT]: 0.55,
    [NodeType.ENTITY]: 0.40,  // 关联人物
  },

  // 组织
  [NodeType.ORGANIZATION]: {
    [NodeType.ENTITY]: 0.85,
    [NodeType.GEO_LOCATION]: 0.80,
    [NodeType.DOMAIN]: 0.75,
    [NodeType.EMAIL]: 0.70,
    [NodeType.PHONE_NUMBER]: 0.65,
    [NodeType.BANK_ACCOUNT]: 0.60,
    [NodeType.COMPANY_REGISTRATION]: 0.55,
    [NodeType.SOCIAL_PROFILE]: 0.50,
  },

  // 威胁行为者
  [NodeType.THREAT_ACTOR]: {
    [NodeType.MALWARE]: 0.85,
    [NodeType.IP_ADDRESS]: 0.80,
    [NodeType.DOMAIN]: 0.80,
    [NodeType.C2_SERVER]: 0.75,
    [NodeType.EXPLOIT]: 0.70,
    [NodeType.ATTACK_PATTERN]: 0.70,
    [NodeType.VULNERABILITY]: 0.65,
    [NodeType.CAMPAIGN]: 0.60,
    [NodeType.INDICATOR]: 0.55,
  },

  // IP地址
  [NodeType.IP_ADDRESS]: {
    [NodeType.DOMAIN]: 0.75,
    [NodeType.SERVER]: 0.70,
    [NodeType.GEO_LOCATION]: 0.65,
    [NodeType.ASN]: 0.60,
    [NodeType.MALWARE]: 0.45,
    [NodeType.C2_SERVER]: 0.40,
  },

  // 域名
  [NodeType.DOMAIN]: {
    [NodeType.IP_ADDRESS]: 0.80,
    [NodeType.SSL_CERT]: 0.65,
    [NodeType.ORGANIZATION]: 0.55,
    [NodeType.EMAIL]: 0.50,
    [NodeType.SERVER]: 0.45,
  },

  // 电子邮件
  [NodeType.EMAIL]: {
    [NodeType.ENTITY]: 0.85,
    [NodeType.ORGANIZATION]: 0.60,
    [NodeType.DOMAIN]: 0.55,
    [NodeType.SOCIAL_PROFILE]: 0.50,
  },

  // 电话号码
  [NodeType.PHONE_NUMBER]: {
    [NodeType.ENTITY]: 0.90,
    [NodeType.GEO_LOCATION]: 0.55,
    [NodeType.DEVICE]: 0.50,
    [NodeType.SIM_CARD]: 0.45,
  },

  // 社交账号
  [NodeType.SOCIAL_PROFILE]: {
    [NodeType.ENTITY]: 0.90,
    [NodeType.EMAIL]: 0.60,
    [NodeType.PHONE_NUMBER]: 0.50,
    [NodeType.IMAGE]: 0.45,
    [NodeType.SOCIAL_POST]: 0.40,
  },

  // 加密钱包
  [NodeType.CRYPTO_WALLET]: {
    [NodeType.TRANSACTION]: 0.85,
    [NodeType.ENTITY]: 0.60,
    [NodeType.CRYPTO_WALLET]: 0.55,  // 关联钱包
    [NodeType.ORGANIZATION]: 0.40,
  },

  // 交易
  [NodeType.TRANSACTION]: {
    [NodeType.CRYPTO_WALLET]: 0.90,
    [NodeType.BANK_ACCOUNT]: 0.70,
    [NodeType.ENTITY]: 0.55,
  },

  // 地理位置
  [NodeType.GEO_LOCATION]: {
    [NodeType.ENTITY]: 0.70,
    [NodeType.ORGANIZATION]: 0.65,
    [NodeType.FACILITY]: 0.55,
    [NodeType.EVENT]: 0.50,
  },

  // 车辆
  [NodeType.VEHICLE]: {
    [NodeType.ENTITY]: 0.85,
    [NodeType.LICENSE_PLATE]: 0.80,
    [NodeType.GEO_LOCATION]: 0.55,
  },

  // 恶意软件
  [NodeType.MALWARE]: {
    [NodeType.FILE_HASH]: 0.90,
    [NodeType.THREAT_ACTOR]: 0.75,
    [NodeType.C2_SERVER]: 0.70,
    [NodeType.IP_ADDRESS]: 0.65,
    [NodeType.VULNERABILITY]: 0.60,
    [NodeType.ATTACK_PATTERN]: 0.55,
  },

  // 事件
  [NodeType.EVENT]: {
    [NodeType.ENTITY]: 0.80,
    [NodeType.GEO_LOCATION]: 0.75,
    [NodeType.ORGANIZATION]: 0.60,
    [NodeType.DOCUMENT]: 0.50,
  },

  // 航班
  [NodeType.FLIGHT]: {
    [NodeType.ENTITY]: 0.90,
    [NodeType.GEO_LOCATION]: 0.85,
    [NodeType.PASSPORT]: 0.70,
  },

  // 护照
  [NodeType.PASSPORT]: {
    [NodeType.ENTITY]: 0.95,
    [NodeType.VISA]: 0.60,
    [NodeType.FLIGHT]: 0.55,
  },
};

// ============================================================================
// 核心算法实现
// ============================================================================

/**
 * 执行调查分析
 * 主入口函数 - 分析整个图谱并生成调查建议
 */
export function analyzeInvestigation(
  nodes: IntelNode[],
  connections: Connection[]
): InvestigationAnalysis {
  if (nodes.length === 0) {
    return createEmptyAnalysis();
  }

  // 构建辅助数据结构
  const adjacency = buildAdjacencyMap(nodes, connections);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const connectionsByNode = buildConnectionsByNode(connections);

  // 计算自适应属性统计
  const attributeStats = calculateAttributeStatistics(nodes);

  // 计算图结构指标
  const structureMetrics = calculateStructureMetrics(nodes, adjacency);

  // 分析每个节点
  const nodeAnalysis: NodeCompleteness[] = nodes.map(node =>
    analyzeNodeCompleteness(
      node,
      nodeMap,
      adjacency,
      connectionsByNode,
      attributeStats,
      structureMetrics
    )
  );

  // 计算整体统计
  const completenessScores = nodeAnalysis.map(n => n.overallScore);
  const averageCompleteness = completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length;

  // 按优先级排序建议
  const prioritizedSuggestions = [...nodeAnalysis]
    .filter(n => n.overallScore < 0.8)  // 只保留需要改进的节点
    .sort((a, b) => {
      // 先按优先级排序
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // 同优先级按完整性排序（低完整性优先）
      return a.overallScore - b.overallScore;
    });

  return {
    totalNodes: nodes.length,
    averageCompleteness,
    completenessDistribution: calculateDistribution(completenessScores),
    nodeAnalysis,
    prioritizedSuggestions,
    graphHealth: {
      connectivity: structureMetrics.globalConnectivity,
      informationDensity: calculateInformationDensity(nodes, attributeStats),
      structuralBalance: structureMetrics.structuralBalance,
    },
  };
}

/**
 * 分析单个节点的完整性
 */
function analyzeNodeCompleteness(
  node: IntelNode,
  nodeMap: Map<string, IntelNode>,
  adjacency: Map<string, Set<string>>,
  connectionsByNode: Map<string, Connection[]>,
  attributeStats: AttributeStatistics,
  structureMetrics: StructureMetrics
): NodeCompleteness {
  // 1. 计算关系完整性
  const { score: relationScore, missing: missingRelations } = calculateRelationCompleteness(
    node,
    nodeMap,
    adjacency,
    connectionsByNode
  );

  // 2. 计算属性完整性
  const { score: attributeScore, sparse: sparseAttributes } = calculateAttributeCompleteness(
    node,
    attributeStats
  );

  // 3. 计算结构完整性
  const { score: structureScore, issues: structuralIssues } = calculateStructureCompleteness(
    node,
    adjacency,
    structureMetrics
  );

  // 4. 几何加权平均计算总分
  // 权重：关系 30%, 属性 40%, 结构 30%
  const overallScore = geometricWeightedMean(
    [relationScore, attributeScore, structureScore],
    [0.30, 0.40, 0.30]
  );

  // 5. 确定优先级
  const priority = determinePriority(overallScore, missingRelations, sparseAttributes, structuralIssues);

  return {
    nodeId: node.id,
    nodeType: node.type,
    nodeTitle: node.title,
    relationScore,
    attributeScore,
    structureScore,
    overallScore,
    missingRelations,
    sparseAttributes,
    structuralIssues,
    priority,
  };
}

// ============================================================================
// 关系完整性计算
// ============================================================================

interface RelationCompletenessResult {
  score: number;
  missing: MissingRelation[];
}

/**
 * 计算关系完整性 - 基于概率矩阵
 */
function calculateRelationCompleteness(
  node: IntelNode,
  nodeMap: Map<string, IntelNode>,
  adjacency: Map<string, Set<string>>,
  connectionsByNode: Map<string, Connection[]>
): RelationCompletenessResult {
  const expectedRelations = RELATION_PROBABILITY_MATRIX[node.type];

  if (!expectedRelations || Object.keys(expectedRelations).length === 0) {
    // 该类型没有预定义期望，返回默认分数
    return { score: 0.7, missing: [] };
  }

  const neighbors = adjacency.get(node.id) || new Set();
  const neighborTypes = new Set<NodeType>();

  // 统计邻居节点类型
  neighbors.forEach(neighborId => {
    const neighbor = nodeMap.get(neighborId);
    if (neighbor) {
      neighborTypes.add(neighbor.type);
    }
  });

  let totalExpectation = 0;
  let satisfiedExpectation = 0;
  const missing: MissingRelation[] = [];

  // 计算期望满足度
  Object.entries(expectedRelations).forEach(([targetTypeStr, probability]) => {
    const targetType = targetTypeStr as NodeType;
    totalExpectation += probability;

    if (neighborTypes.has(targetType)) {
      satisfiedExpectation += probability;
    } else if (probability >= 0.5) {
      // 只报告高期望（>=0.5）的缺失关系
      missing.push({
        targetType,
        expectedProbability: probability,
        description: getRelationDescription(node.type, targetType),
      });
    }
  });

  const score = totalExpectation > 0 ? satisfiedExpectation / totalExpectation : 0.7;

  // 按期望概率降序排序缺失关系
  missing.sort((a, b) => b.expectedProbability - a.expectedProbability);

  return { score, missing: missing.slice(0, 5) };  // 最多返回5个建议
}

/**
 * 获取关系描述文本
 */
function getRelationDescription(sourceType: NodeType, targetType: NodeType): string {
  const descriptions: Record<string, string> = {
    [`${NodeType.ENTITY}-${NodeType.PHONE_NUMBER}`]: '该人物缺少关联电话号码',
    [`${NodeType.ENTITY}-${NodeType.EMAIL}`]: '该人物缺少关联电子邮箱',
    [`${NodeType.ENTITY}-${NodeType.SOCIAL_PROFILE}`]: '该人物缺少关联社交账号',
    [`${NodeType.ENTITY}-${NodeType.ORGANIZATION}`]: '该人物缺少关联组织/公司',
    [`${NodeType.ENTITY}-${NodeType.GEO_LOCATION}`]: '该人物缺少位置信息',
    [`${NodeType.ORGANIZATION}-${NodeType.ENTITY}`]: '该组织缺少关联人物',
    [`${NodeType.ORGANIZATION}-${NodeType.DOMAIN}`]: '该组织缺少关联域名',
    [`${NodeType.THREAT_ACTOR}-${NodeType.MALWARE}`]: '该威胁行为者缺少关联恶意软件',
    [`${NodeType.THREAT_ACTOR}-${NodeType.IP_ADDRESS}`]: '该威胁行为者缺少关联IP地址',
    [`${NodeType.IP_ADDRESS}-${NodeType.DOMAIN}`]: '该IP缺少关联域名',
    [`${NodeType.DOMAIN}-${NodeType.IP_ADDRESS}`]: '该域名缺少解析IP',
    [`${NodeType.MALWARE}-${NodeType.FILE_HASH}`]: '该恶意软件缺少文件哈希',
    [`${NodeType.CRYPTO_WALLET}-${NodeType.TRANSACTION}`]: '该钱包缺少交易记录',
    [`${NodeType.VEHICLE}-${NodeType.LICENSE_PLATE}`]: '该车辆缺少车牌信息',
    [`${NodeType.FLIGHT}-${NodeType.ENTITY}`]: '该航班缺少关联乘客',
  };

  return descriptions[`${sourceType}-${targetType}`] ||
    `建议添加 ${targetType} 类型的关联实体`;
}

// ============================================================================
// 属性完整性计算 (自适应统计法)
// ============================================================================

interface AttributeStatistics {
  // 按类型统计每个字段的填充率
  fieldFillRates: Map<NodeType, Map<string, number>>;
  // 按类型统计节点数量
  typeCount: Map<NodeType, number>;
}

interface AttributeCompletenessResult {
  score: number;
  sparse: SparseAttribute[];
}

/**
 * 计算属性统计 - 从当前数据动态学习
 */
function calculateAttributeStatistics(nodes: IntelNode[]): AttributeStatistics {
  const typeCount = new Map<NodeType, number>();
  const fieldOccurrences = new Map<NodeType, Map<string, number>>();

  // 第一遍：统计每种类型的节点数和字段出现次数
  nodes.forEach(node => {
    // 类型计数
    typeCount.set(node.type, (typeCount.get(node.type) || 0) + 1);

    // 字段统计
    if (!fieldOccurrences.has(node.type)) {
      fieldOccurrences.set(node.type, new Map());
    }
    const typeFields = fieldOccurrences.get(node.type)!;

    // 统计非空字段
    Object.entries(node.data || {}).forEach(([key, value]) => {
      if (isValidValue(value)) {
        typeFields.set(key, (typeFields.get(key) || 0) + 1);
      }
    });

    // 标题和内容也计入
    if (node.title && node.title.trim()) {
      typeFields.set('_title', (typeFields.get('_title') || 0) + 1);
    }
    if (node.content && node.content.trim()) {
      typeFields.set('_content', (typeFields.get('_content') || 0) + 1);
    }
  });

  // 计算填充率
  const fieldFillRates = new Map<NodeType, Map<string, number>>();

  fieldOccurrences.forEach((fields, type) => {
    const count = typeCount.get(type) || 1;
    const rates = new Map<string, number>();

    fields.forEach((occurrences, field) => {
      rates.set(field, occurrences / count);
    });

    fieldFillRates.set(type, rates);
  });

  return { fieldFillRates, typeCount };
}

/**
 * 计算属性完整性 - 自适应评分
 */
function calculateAttributeCompleteness(
  node: IntelNode,
  stats: AttributeStatistics
): AttributeCompletenessResult {
  const typeStats = stats.fieldFillRates.get(node.type);

  if (!typeStats || typeStats.size === 0) {
    // 没有同类型节点参考，返回基于自身的评分
    const filledFields = Object.values(node.data || {}).filter(v => isValidValue(v)).length;
    return {
      score: filledFields > 0 ? Math.min(0.5 + filledFields * 0.1, 0.8) : 0.3,
      sparse: [],
    };
  }

  // 计算信息量权重（基于填充率的信息熵）
  // I(field) = -log2(fillRate)，填充率越低，信息量越高
  const fieldImportance = new Map<string, number>();
  let totalImportance = 0;

  typeStats.forEach((fillRate, field) => {
    // 使用平滑后的信息量计算
    // 避免 log(0)，限制最大信息量
    const smoothedRate = Math.max(fillRate, 0.01);
    const importance = Math.min(-Math.log2(smoothedRate), 6);  // 最大6 bits
    fieldImportance.set(field, importance);
    totalImportance += importance;
  });

  // 计算节点的加权完整性分数
  let weightedSum = 0;
  const sparse: SparseAttribute[] = [];

  typeStats.forEach((fillRate, field) => {
    const importance = fieldImportance.get(field) || 0;
    const hasField = hasValidField(node, field);

    if (hasField) {
      weightedSum += importance;
    } else if (importance > 1.0) {
      // 报告重要但缺失的字段
      sparse.push({
        field: field.startsWith('_') ? field.substring(1) : field,
        importance: importance / 6,  // 归一化到 0-1
        fillRate,
      });
    }
  });

  const score = totalImportance > 0 ? weightedSum / totalImportance : 0.5;

  // 按重要性降序排序
  sparse.sort((a, b) => b.importance - a.importance);

  return { score, sparse: sparse.slice(0, 5) };
}

/**
 * 检查值是否有效（非空）
 */
function isValidValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'boolean') return true;
  return true;
}

/**
 * 检查节点是否有某个有效字段
 */
function hasValidField(node: IntelNode, field: string): boolean {
  if (field === '_title') return !!(node.title && node.title.trim());
  if (field === '_content') return !!(node.content && node.content.trim());
  return isValidValue(node.data?.[field]);
}

// ============================================================================
// 结构完整性计算
// ============================================================================

interface StructureMetrics {
  // 每个节点的度数
  degrees: Map<string, number>;
  // 每个节点的聚类系数
  clusteringCoefficients: Map<string, number>;
  // 每个节点的介数中心性
  betweenness: Map<string, number>;
  // 全局连通性
  globalConnectivity: number;
  // 结构均衡度
  structuralBalance: number;
  // 平均度数
  averageDegree: number;
}

interface StructureCompletenessResult {
  score: number;
  issues: StructuralIssue[];
}

/**
 * 计算图结构指标
 */
function calculateStructureMetrics(
  nodes: IntelNode[],
  adjacency: Map<string, Set<string>>
): StructureMetrics {
  const n = nodes.length;

  if (n === 0) {
    return {
      degrees: new Map(),
      clusteringCoefficients: new Map(),
      betweenness: new Map(),
      globalConnectivity: 0,
      structuralBalance: 0,
      averageDegree: 0,
    };
  }

  // 计算度数
  const degrees = new Map<string, number>();
  let totalDegree = 0;

  adjacency.forEach((neighbors, nodeId) => {
    const degree = neighbors.size;
    degrees.set(nodeId, degree);
    totalDegree += degree;
  });

  const averageDegree = totalDegree / n;

  // 计算聚类系数
  const clusteringCoefficients = calculateClusteringCoefficients(adjacency);

  // 简化的介数计算（使用度数近似，避免 O(VE) 复杂度）
  const maxDegree = Math.max(...degrees.values(), 1);
  const betweenness = new Map<string, number>();
  degrees.forEach((degree, nodeId) => {
    betweenness.set(nodeId, degree / maxDegree);
  });

  // 全局连通性：使用连通分量分析
  const componentSizes = findConnectedComponents(nodes, adjacency);
  const largestComponent = Math.max(...componentSizes, 0);
  const globalConnectivity = largestComponent / n;

  // 结构均衡度：基于度分布的基尼系数的补数
  const structuralBalance = 1 - calculateGiniCoefficient([...degrees.values()]);

  return {
    degrees,
    clusteringCoefficients,
    betweenness,
    globalConnectivity,
    structuralBalance,
    averageDegree,
  };
}

/**
 * 计算聚类系数
 */
function calculateClusteringCoefficients(
  adjacency: Map<string, Set<string>>
): Map<string, number> {
  const coefficients = new Map<string, number>();

  adjacency.forEach((neighbors, nodeId) => {
    const k = neighbors.size;

    if (k < 2) {
      coefficients.set(nodeId, 0);
      return;
    }

    // 计算邻居间的连接数
    let triangles = 0;
    const neighborArray = [...neighbors];

    for (let i = 0; i < neighborArray.length; i++) {
      for (let j = i + 1; j < neighborArray.length; j++) {
        if (adjacency.get(neighborArray[i])?.has(neighborArray[j])) {
          triangles++;
        }
      }
    }

    // 聚类系数 = 2 * triangles / (k * (k-1))
    const maxTriangles = (k * (k - 1)) / 2;
    coefficients.set(nodeId, triangles / maxTriangles);
  });

  return coefficients;
}

/**
 * 查找连通分量
 */
function findConnectedComponents(
  nodes: IntelNode[],
  adjacency: Map<string, Set<string>>
): number[] {
  const visited = new Set<string>();
  const componentSizes: number[] = [];

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      // BFS 遍历连通分量
      const queue = [node.id];
      let size = 0;

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;

        visited.add(current);
        size++;

        const neighbors = adjacency.get(current) || new Set();
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        });
      }

      componentSizes.push(size);
    }
  });

  return componentSizes;
}

/**
 * 计算基尼系数（衡量分布不均匀程度）
 */
function calculateGiniCoefficient(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;

  if (mean === 0) return 0;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (2 * (i + 1) - n - 1) * sorted[i];
  }

  return sum / (n * n * mean);
}

/**
 * 计算结构完整性
 */
function calculateStructureCompleteness(
  node: IntelNode,
  adjacency: Map<string, Set<string>>,
  metrics: StructureMetrics
): StructureCompletenessResult {
  const issues: StructuralIssue[] = [];
  const degree = metrics.degrees.get(node.id) || 0;
  const clustering = metrics.clusteringCoefficients.get(node.id) || 0;
  const betweenness = metrics.betweenness.get(node.id) || 0;

  // 度数评分（相对于平均值）
  const degreeScore = metrics.averageDegree > 0
    ? Math.min(degree / (metrics.averageDegree * 2), 1)
    : (degree > 0 ? 0.5 : 0);

  // 检测结构问题
  if (degree === 0) {
    issues.push({
      type: 'isolated',
      severity: 1.0,
      description: '该节点完全孤立，没有任何关联',
    });
  } else if (degree === 1) {
    issues.push({
      type: 'peripheral',
      severity: 0.6,
      description: '该节点处于网络边缘，仅有一个关联',
    });
  }

  if (degree > 0 && clustering < 0.1 && betweenness > 0.5) {
    issues.push({
      type: 'bridge_dependency',
      severity: 0.7,
      description: '该节点是关键桥梁，但缺乏冗余连接',
    });
  }

  if (degree < metrics.averageDegree * 0.3 && degree > 0) {
    issues.push({
      type: 'low_connectivity',
      severity: 0.4,
      description: '该节点连接性较低，建议扩展关联',
    });
  }

  // 综合评分：度数 50% + 聚类系数 30% + 非孤立加成 20%
  const isolationBonus = degree > 0 ? 0.2 : 0;
  const score = degreeScore * 0.5 + clustering * 0.3 + isolationBonus;

  return { score: Math.min(score, 1), issues };
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 构建邻接表
 */
function buildAdjacencyMap(
  nodes: IntelNode[],
  connections: Connection[]
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();

  nodes.forEach(node => adjacency.set(node.id, new Set()));

  connections.forEach(conn => {
    adjacency.get(conn.sourceId)?.add(conn.targetId);
    adjacency.get(conn.targetId)?.add(conn.sourceId);
  });

  return adjacency;
}

/**
 * 构建节点连接映射
 */
function buildConnectionsByNode(connections: Connection[]): Map<string, Connection[]> {
  const result = new Map<string, Connection[]>();

  connections.forEach(conn => {
    if (!result.has(conn.sourceId)) result.set(conn.sourceId, []);
    if (!result.has(conn.targetId)) result.set(conn.targetId, []);
    result.get(conn.sourceId)!.push(conn);
    result.get(conn.targetId)!.push(conn);
  });

  return result;
}

/**
 * 几何加权平均
 * 避免单项过低拉高总分
 */
function geometricWeightedMean(values: number[], weights: number[]): number {
  if (values.length === 0 || values.length !== weights.length) return 0;

  // 避免 log(0)
  const smoothedValues = values.map(v => Math.max(v, 0.01));

  let logSum = 0;
  let weightSum = 0;

  for (let i = 0; i < values.length; i++) {
    logSum += weights[i] * Math.log(smoothedValues[i]);
    weightSum += weights[i];
  }

  return Math.exp(logSum / weightSum);
}

/**
 * 确定优先级
 */
function determinePriority(
  overallScore: number,
  missingRelations: MissingRelation[],
  sparseAttributes: SparseAttribute[],
  structuralIssues: StructuralIssue[]
): SuggestionPriority {
  // 检查是否有严重问题
  const hasIsolation = structuralIssues.some(i => i.type === 'isolated');
  const hasCriticalMissing = missingRelations.some(r => r.expectedProbability >= 0.8);

  if (overallScore < 0.3 || hasIsolation) {
    return 'critical';
  }

  if (overallScore < 0.5 || hasCriticalMissing) {
    return 'high';
  }

  if (overallScore < 0.7) {
    return 'medium';
  }

  return 'low';
}

/**
 * 计算完整性分布
 */
function calculateDistribution(scores: number[]): InvestigationAnalysis['completenessDistribution'] {
  const distribution = { critical: 0, low: 0, medium: 0, high: 0 };

  scores.forEach(score => {
    if (score < 0.3) distribution.critical++;
    else if (score < 0.5) distribution.low++;
    else if (score < 0.7) distribution.medium++;
    else distribution.high++;
  });

  return distribution;
}

/**
 * 计算信息密度
 */
function calculateInformationDensity(
  nodes: IntelNode[],
  stats: AttributeStatistics
): number {
  if (nodes.length === 0) return 0;

  let totalFields = 0;
  let filledFields = 0;

  nodes.forEach(node => {
    const typeStats = stats.fieldFillRates.get(node.type);
    if (typeStats) {
      typeStats.forEach((_, field) => {
        totalFields++;
        if (hasValidField(node, field)) {
          filledFields++;
        }
      });
    }
  });

  return totalFields > 0 ? filledFields / totalFields : 0.5;
}

/**
 * 创建空分析结果
 */
function createEmptyAnalysis(): InvestigationAnalysis {
  return {
    totalNodes: 0,
    averageCompleteness: 0,
    completenessDistribution: { critical: 0, low: 0, medium: 0, high: 0 },
    nodeAnalysis: [],
    prioritizedSuggestions: [],
    graphHealth: {
      connectivity: 0,
      informationDensity: 0,
      structuralBalance: 0,
    },
  };
}

// ============================================================================
// 导出工具函数
// ============================================================================

/**
 * 获取节点完整性等级标签
 */
export function getCompletenessLabel(score: number): string {
  if (score >= 0.8) return '优秀';
  if (score >= 0.6) return '良好';
  if (score >= 0.4) return '一般';
  if (score >= 0.2) return '较差';
  return '严重不足';
}

/**
 * 获取优先级颜色类名
 */
export function getPriorityColorClass(priority: SuggestionPriority): string {
  const colors = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/30',
    high: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    low: 'text-green-500 bg-green-500/10 border-green-500/30',
  };
  return colors[priority];
}

/**
 * 获取优先级标签
 */
export function getPriorityLabel(priority: SuggestionPriority): string {
  const labels = {
    critical: '紧急',
    high: '高',
    medium: '中',
    low: '低',
  };
  return labels[priority];
}
