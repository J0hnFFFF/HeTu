/**
 * Graph Analysis Service
 * 图谱分析服务 - 社区发现与核心人物识别
 */

import { IntelNode, Connection } from '../types';

// 分析结果接口
export interface GraphAnalysisResult {
  communities: Map<string, number>;  // nodeId -> communityId
  centrality: Map<string, number>;   // nodeId -> centrality score (0-1)
  keyNodes: string[];                // 核心节点 ID 列表
  communityCount: number;            // 社区数量
}

// 社区颜色映射
export const COMMUNITY_COLORS = [
  'border-cyan-500',
  'border-orange-500',
  'border-green-500',
  'border-purple-500',
  'border-pink-500',
  'border-yellow-500',
  'border-red-500',
  'border-blue-500',
  'border-indigo-500',
  'border-teal-500',
];

/**
 * 执行图谱分析
 * - 社区发现 (基于连通分量 + 模块度优化)
 * - 中心性分析 (度中心性 + PageRank 简化版)
 */
export function analyzeGraph(nodes: IntelNode[], connections: Connection[]): GraphAnalysisResult {
  if (nodes.length === 0) {
    return {
      communities: new Map(),
      centrality: new Map(),
      keyNodes: [],
      communityCount: 0
    };
  }

  // 构建邻接表
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach(node => adjacency.set(node.id, new Set()));

  connections.forEach(conn => {
    adjacency.get(conn.sourceId)?.add(conn.targetId);
    adjacency.get(conn.targetId)?.add(conn.sourceId);
  });

  // 1. 社区发现 - 使用标签传播算法 (Label Propagation)
  const communities = labelPropagation(nodes, adjacency);

  // 2. 中心性计算 - 度中心性 + 简化 PageRank
  const centrality = calculateCentrality(nodes, adjacency, connections.length);

  // 3. 识别核心节点 (中心性 > 0.5 的节点)
  const keyNodes: string[] = [];
  const sortedByCentrality = [...centrality.entries()].sort((a, b) => b[1] - a[1]);

  // 取前 20% 或中心性 > 0.5 的节点
  const threshold = Math.max(0.5, sortedByCentrality[Math.floor(sortedByCentrality.length * 0.2)]?.[1] || 0);
  sortedByCentrality.forEach(([nodeId, score]) => {
    if (score >= threshold) {
      keyNodes.push(nodeId);
    }
  });

  // 统计社区数量
  const uniqueCommunities = new Set(communities.values());

  return {
    communities,
    centrality,
    keyNodes,
    communityCount: uniqueCommunities.size
  };
}

/**
 * 标签传播算法 (Label Propagation Algorithm)
 * 简化版 - 用于社区发现
 */
function labelPropagation(nodes: IntelNode[], adjacency: Map<string, Set<string>>): Map<string, number> {
  const labels = new Map<string, number>();

  // 初始化：每个节点自成一个社区
  nodes.forEach((node, idx) => labels.set(node.id, idx));

  // 迭代直到收敛或达到最大迭代次数
  const maxIterations = 10;
  let changed = true;
  let iteration = 0;

  while (changed && iteration < maxIterations) {
    changed = false;
    iteration++;

    // 随机顺序遍历节点
    const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5);

    for (const node of shuffledNodes) {
      const neighbors = adjacency.get(node.id);
      if (!neighbors || neighbors.size === 0) continue;

      // 统计邻居标签频率
      const labelCounts = new Map<number, number>();
      neighbors.forEach(neighborId => {
        const label = labels.get(neighborId)!;
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      });

      // 找出出现最多的标签
      let maxCount = 0;
      let maxLabel = labels.get(node.id)!;
      labelCounts.forEach((count, label) => {
        if (count > maxCount) {
          maxCount = count;
          maxLabel = label;
        }
      });

      // 更新标签
      if (labels.get(node.id) !== maxLabel) {
        labels.set(node.id, maxLabel);
        changed = true;
      }
    }
  }

  // 重新编号社区 (从 0 开始连续编号)
  const uniqueLabels = [...new Set(labels.values())];
  const labelMapping = new Map<number, number>();
  uniqueLabels.forEach((label, idx) => labelMapping.set(label, idx));

  const normalizedLabels = new Map<string, number>();
  labels.forEach((label, nodeId) => {
    normalizedLabels.set(nodeId, labelMapping.get(label)!);
  });

  return normalizedLabels;
}

/**
 * 计算中心性
 * 综合度中心性和简化 PageRank
 */
function calculateCentrality(
  nodes: IntelNode[],
  adjacency: Map<string, Set<string>>,
  totalEdges: number
): Map<string, number> {
  const centrality = new Map<string, number>();

  if (nodes.length === 0) return centrality;

  // 1. 度中心性 (Degree Centrality)
  const maxDegree = Math.max(...[...adjacency.values()].map(s => s.size), 1);

  const degreeCentrality = new Map<string, number>();
  adjacency.forEach((neighbors, nodeId) => {
    degreeCentrality.set(nodeId, neighbors.size / maxDegree);
  });

  // 2. 简化 PageRank
  const dampingFactor = 0.85;
  const iterations = 20;
  const n = nodes.length;

  let pageRank = new Map<string, number>();
  nodes.forEach(node => pageRank.set(node.id, 1 / n));

  for (let i = 0; i < iterations; i++) {
    const newPageRank = new Map<string, number>();

    nodes.forEach(node => {
      let sum = 0;
      adjacency.forEach((neighbors, otherId) => {
        if (neighbors.has(node.id) && neighbors.size > 0) {
          sum += pageRank.get(otherId)! / neighbors.size;
        }
      });
      newPageRank.set(node.id, (1 - dampingFactor) / n + dampingFactor * sum);
    });

    pageRank = newPageRank;
  }

  // 归一化 PageRank
  const maxPR = Math.max(...pageRank.values(), 0.001);
  pageRank.forEach((pr, nodeId) => {
    pageRank.set(nodeId, pr / maxPR);
  });

  // 3. 综合得分 (度中心性 * 0.4 + PageRank * 0.6)
  nodes.forEach(node => {
    const dc = degreeCentrality.get(node.id) || 0;
    const pr = pageRank.get(node.id) || 0;
    centrality.set(node.id, dc * 0.4 + pr * 0.6);
  });

  return centrality;
}

/**
 * 获取节点的社区颜色类名
 */
export function getCommunityColorClass(communityId: number): string {
  return COMMUNITY_COLORS[communityId % COMMUNITY_COLORS.length];
}
