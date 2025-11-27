# 河图情报分析系统 - 技术文档

本文档包含系统架构、开发指南和技术细节，供开发者参考。

---

## 目录

1. [系统架构](#1-系统架构)
2. [核心数据结构](#2-核心数据结构)
3. [AI 服务层](#3-ai-服务层)
4. [图谱分析算法](#4-图谱分析算法)
5. [扩展开发指南](#5-扩展开发指南)
6. [文件结构](#6-文件结构)
7. [常见问题](#7-常见问题)

---

## 1. 系统架构

### 1.1 设计理念

**Client-Side Heavy (重客户端)**
- 所有图谱渲染、状态管理在浏览器完成
- AI 推理直接调用 Google Gemini API (Serverless)
- 无需后端服务器，完全前端化

### 1.2 技术栈

| 类别 | 技术 |
|------|------|
| Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI SDK | `@google/genai` |
| Storage | `idb` (IndexedDB) |
| Maps | `leaflet` + `react-leaflet` |
| Icons | `lucide-react` |
| Build | Vite |
| Desktop | Electron + electron-builder |

### 1.3 核心模块

```
┌─────────────────────────────────────────────┐
│           App.tsx (状态容器)                  │
│  - nodes[] / connections[] 管理               │
│  - 工具执行调度                                │
│  - 日志系统                                    │
└─────────┬───────────────────────┬─────────────┘
          │                       │
          ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│  Canvas.tsx      │    │  ControlPanel.tsx    │
│  - 无限画布渲染   │    │  - 工具/插件管理      │
│  - SVG 连线      │    │  - 时间线引擎        │
│  - 交互事件处理   │    │  - 属性编辑器        │
└──────────────────┘    └──────────────────────┘
          │                       │
          ▼                       ▼
┌────────────────────────────────────────────┐
│      services/geminiService.ts             │
│  - Tool 执行策略 (AGENT/API/MCP)           │
│  - Google Gemini API 集成                  │
│  - Search Grounding 配置                   │
│  - 结构化 JSON 输出强制                     │
└────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────┐
│      Google Gemini API                     │
│  - gemini-2.5-flash (快速)                 │
│  - gemini-3.0-pro (深度推理)               │
│  - Search Grounding (实时 Web 数据)        │
└────────────────────────────────────────────┘
```

### 1.4 数据持久化

```
┌────────────────────────────────────────────┐
│      services/storageService.ts            │
│  - IndexedDB 封装 (idb)                    │
│  - 图谱数据持久化 (nodes/connections)       │
│  - AI 配置自动保存                          │
│  - 自定义工具存储                           │
└────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────┐
│      Browser IndexedDB                     │
│  - nexus-osint-db                          │
│  - config / nodes / connections / tools    │
└────────────────────────────────────────────┘
```

### 1.5 数据流

```
用户操作 (点击运行工具)
  ↓
状态更新 (node.status = 'PROCESSING')
  ↓
executeTool() 构建 Prompt
  ↓
发送到 Gemini API (带 Search Grounding)
  ↓
返回结构化 JSON
  {
    summary: "分析摘要",
    updated_properties: [{key, value}],
    new_entities: [{title, type, data, relationship}]
  }
  ↓
图谱扩展 (创建新节点、连线)
  ↓
Canvas 重新渲染
```

---

## 2. 核心数据结构

### 2.1 IntelNode (情报节点)

```typescript
interface IntelNode {
  id: string;
  type: NodeType;                 // 枚举：110+ 实体类型
  title: string;
  content: string;                // 简短摘要
  position: { x: number; y: number };
  data: Record<string, any>;      // 灵活 KV 存储
  status: 'NEW' | 'PROCESSING' | 'PROCESSED' | 'ERROR';
  rating?: IntelligenceRating;    // NATO 编码
  depth: number;                  // 图谱层级
}
```

### 2.2 Connection (关系连接)

```typescript
interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  type?: 'CONFIRMED' | 'SUSPECTED' | 'CONTRADICTS';
}
```

### 2.3 Tool (工具/插件)

```typescript
interface Tool {
  id: string;
  category: 'AGENT' | 'API' | 'MCP';
  name: string;
  targetTypes: NodeType[];        // 适用实体类型
  promptTemplate: string;         // AI Prompt 模板
  mcpConfig?: {
    functionName: 'googleSearch'; // 启用搜索 Grounding
  };
  autoExpand: boolean;            // 是否自动生成关联节点
}
```

### 2.4 NodeType 枚举

系统支持 110+ 实体类型，分为 10 个类别：

1. **主体 (Subjects)**: ENTITY, ORGANIZATION, THREAT_ACTOR, IDENTITY, MILITARY_UNIT, GOV_AGENCY
2. **网络基础设施 (Network)**: IP_ADDRESS, DOMAIN, URL, SERVER, C2_SERVER, SSL_CERT, ASN...
3. **通信账号 (Communication)**: EMAIL, PHONE_NUMBER, SOCIAL_PROFILE, MESSAGING_ID...
4. **金融 (Financial)**: CRYPTO_WALLET, BANK_ACCOUNT, TRANSACTION...
5. **物理世界 (Physical)**: GEO_LOCATION, VEHICLE, DEVICE, WEAPON...
6. **旅行物流 (Travel)**: FLIGHT, HOTEL, SHIPPING, PASSPORT, VISA
7. **内容媒体 (Content)**: IMAGE, VIDEO, DOCUMENT, MALWARE, FILE_HASH...
8. **情报搜集 (Intelligence)**: SOURCE_HUMINT, SOURCE_SIGINT, SOURCE_OSINT...
9. **分析研判 (Analysis)**: REPORT, EVENT, CAMPAIGN, VULNERABILITY...
10. **操作节点 (Ops)**: SEARCH_QUERY, DATA_SOURCE, LEAK_DUMP, SENSOR

完整定义见 `types.ts`。

---

## 3. AI 服务层

### 3.1 策略模式

`geminiService.ts` 使用策略模式处理不同工具类型：

```typescript
// AGENT: 纯 LLM 推理
if (tool.category === ToolCategory.AGENT) {
  // 仅发送 Prompt，使用 responseSchema 强制 JSON 输出
}

// MCP: 函数调用 (Google Search Grounding)
if (tool.mcpConfig?.functionName === 'googleSearch') {
  config.tools = [{ googleSearch: {} }];
  // 不能使用 responseMimeType，改用 systemInstruction 要求 JSON
}

// API: 外部接口调用
if (tool.category === ToolCategory.API) {
  // 调用 tool.apiConfig.endpoint
}
```

### 3.2 Prompt 变量注入

```typescript
// 支持模板变量
promptTemplate: "分析 {{title}} 的威胁情报，数据：{{data.ip}}"
// 自动替换为节点实际值
```

### 3.3 图谱扩展协议

所有工具返回统一的 JSON 格式：

```json
{
  "summary": "分析摘要",
  "updated_properties": [
    {"key": "威胁评分", "value": "85"}
  ],
  "new_entities": [
    {
      "title": "攻击者IP",
      "type": "IP_ADDRESS",
      "description": "来源地址",
      "data": [{"key": "IP", "value": "192.168.1.1"}],
      "relationship_label": "攻击来源"
    }
  ]
}
```

---

## 4. 图谱分析算法

### 4.1 社区发现 - Louvain 算法

`services/graphAnalysis.ts` 实现了 Louvain 模块度优化算法：

**算法流程**：
1. 初始化：每个节点自成一个社区
2. 第一阶段：遍历节点，将其移动到能最大化模块度增益的邻居社区
3. 第二阶段：将社区聚合为超级节点，重复第一阶段
4. 直到模块度不再增加为止

**优势**：
- 确定性结果（相同输入必定相同输出）
- 质量优于标签传播算法 (LPA)
- 复杂度 O(n log n)

### 4.2 中心性分析

综合三种中心性指标，权重分配：

| 指标 | 权重 | 说明 |
|------|------|------|
| 介数中心性 (Betweenness) | 35% | 衡量节点作为"桥梁"的重要性 |
| PageRank | 40% | 衡量影响力传递 |
| 度中心性 (Degree) | 25% | 衡量直接连接数量 |

**介数中心性**使用 Brandes 算法实现，复杂度 O(VE)。

### 4.3 调查建议引擎

`services/investigationEngine.ts` 实现完整性分析：

**三维评估**：

1. **关系完整性** (30%) - 概率矩阵法
   - 预定义实体类型间的关系期望
   - 检测缺失的高期望关系

2. **属性完整性** (40%) - 自适应统计法
   - 从当前图谱数据动态学习字段填充率
   - 使用信息熵加权：`I(field) = -log₂(fillRate)`
   - 无需预设规则

3. **结构完整性** (30%) - 图论指标
   - 度数、聚类系数、连通性
   - 检测孤立节点、边缘节点、桥梁依赖

**综合评分**：
```
Completeness = R^0.30 × A^0.40 × S^0.30  (几何加权平均)
```

---

## 5. 扩展开发指南

### 5.1 添加新实体类型

**步骤 1**: `types.ts` - 添加 NodeType 枚举
```typescript
export enum NodeType {
  MY_NEW_ENTITY = 'MY_NEW_ENTITY',
}
```

**步骤 2**: `constants.ts` - 定义默认字段
```typescript
[NodeType.MY_NEW_ENTITY]: {
  "字段1": "",
  "字段2": ""
}
```

**步骤 3**: `NodeCard.tsx` - 添加图标
```typescript
case NodeType.MY_NEW_ENTITY:
  return <Icon className="w-4 h-4 text-color" />;
```

**步骤 4**: `ControlPanel.tsx` - 添加创建按钮
```typescript
<EntityCategory title="类别名" items={[
  {t: NodeType.MY_NEW_ENTITY, l: '显示名', Icon: IconComponent}
]} />
```

### 5.2 添加新工具

编辑 `tools.ts`，在 `DEFAULT_TOOLS` 数组中添加：

```typescript
{
  id: 'my_tool',
  category: ToolCategory.MCP,          // 或 AGENT/API
  name: '工具显示名称',
  version: '1.0',
  author: '作者',
  description: '简短描述',
  targetTypes: [NodeType.IP_ADDRESS],  // 适用实体（空数组=全局工具）
  autoExpand: true,                    // 是否自动生成关联节点
  mcpConfig: {
    functionName: 'googleSearch'       // 启用实时搜索
  },
  promptTemplate: `
    你是 OSINT 分析专家。分析 {{title}} 实体。

    搜索并提取：
    1. 威胁情报
    2. 关联实体
    3. 时间线事件

    输出 JSON 格式的分析结果。
  `,
  isSimulated: false
}
```

### 5.3 Prompt 编写最佳实践

1. **明确角色定位**: "你是网络安全专家 / OSINT 分析师 / 威胁情报研究员"
2. **结构化输出**: 使用编号列表指定提取字段
3. **强制 JSON**: 明确说明输出格式要求
4. **使用变量**: `{{title}}`, `{{content}}`, `{{data.fieldName}}`
5. **提供示例**: 在 Prompt 中给出期望输出格式的示例

---

## 6. 文件结构

```
nexus-osint-platform/
├── App.tsx                    # 主容器 & 状态管理
├── types.ts                   # TypeScript 类型定义
├── constants.ts               # 实体字段模板 & AI 配置
├── tools.ts                   # 内置工具定义 (59 tools)
├── components/
│   ├── Canvas.tsx             # 无限画布引擎
│   ├── NodeCard.tsx           # 节点卡片组件
│   ├── ControlPanel.tsx       # 右侧控制面板
│   ├── ContextMenu.tsx        # 右键菜单
│   ├── MiniMap.tsx            # 小地图预览组件
│   ├── MapModal.tsx           # 大地图弹窗组件
│   ├── MediaModal.tsx         # 媒体预览弹窗组件
│   ├── TrajectoryModal.tsx    # 时空轨迹分析弹窗
│   ├── NodeDetailPanel.tsx    # 实体详情面板
│   └── AnalysisPanel.tsx      # 网络分析报告面板
├── services/
│   ├── geminiService.ts       # AI 服务层
│   ├── storageService.ts      # 本地持久化服务 (IndexedDB)
│   ├── graphAnalysis.ts       # 图谱分析服务 (社区发现/核心节点)
│   └── investigationEngine.ts # 调查建议引擎 (完整性分析)
├── public/                    # 静态资源
├── electron.cjs               # Electron 主进程
├── preload.cjs                # Electron 预加载脚本
├── BUILD_GUIDE.md             # Electron 打包指南
├── TECHNICAL.md               # 技术文档 (本文件)
├── vite.config.ts             # Vite 构建配置
├── package.json
└── README.md                  # 项目介绍
```

---

## 7. 常见问题

### Q: 为什么有些工具执行失败？

检查：
1. API Key 是否正确配置
2. 是否开通 Paid Tier (免费版无法使用 Search Grounding)
3. 查看"系统日志"获取详细错误信息

### Q: 如何导出分析结果？

1. 时间线 → 生成情报简报 → 导出 TXT 或 PDF（AI 生成的报告）
2. 图谱数据通过「保存」按钮持久化到本地 IndexedDB

### Q: 节点太多时如何整理？

点击顶部左侧的"自动布局"按钮，系统会按深度自动排列所有节点。

### Q: 可以离线使用吗？

- 基础功能（画布、节点管理）可离线使用
- AI 工具需要网络连接 Gemini API
- 可打包为桌面应用获得更好的离线体验

### Q: 如何添加真实 API 数据源？

修改 `tools.ts` 中的 API 类工具配置，将 `apiConfig.endpoint` 指向真实 API 地址，并移除 `mockResponse`。

---

## 贡献代码

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

---

**He Tu** - *Empowering Intelligence with AI.*
