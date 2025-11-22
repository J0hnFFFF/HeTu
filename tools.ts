
import { Tool, NodeType, ToolCategory } from './types';

export const DEFAULT_TOOLS: Tool[] = [
  // ============================================
  // SECTION 1: REAL AI AGENTS (Pure Reasoning)
  // ============================================
  {
    id: 'agent_profiler',
    category: ToolCategory.AGENT,
    name: '心理侧写 (Profiler)',
    version: '2.1',
    author: 'Nexus Mind',
    description: '基于文本分析目标的心理状态、情绪及潜在动机。',
    targetTypes: [NodeType.NOTE, NodeType.SOCIAL_POST, NodeType.EMAIL, NodeType.REPORT],
    promptTemplate: "分析目标的心理状态。\n1. 评估情绪极性（正面/负面/中性）。\n2. 识别具体情绪（愤怒、恐惧、焦虑、自信）。\n3. 检测是否存在欺骗性语言特征（如过度强调、回避细节）。\n4. 推测作者的教育程度和可能的职业背景。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'agent_visual_forensics',
    category: ToolCategory.AGENT,
    name: '视觉取证 (Image Ops)',
    version: '3.0',
    author: 'Nexus Vision',
    description: '【图片】OCR文字提取、地标识别、EXIF分析及隐写术检测。',
    targetTypes: [NodeType.IMAGE],
    promptTemplate: "作为图像情报专家，分析这张图片。\n1. OCR: 提取图中所有可见文字、路牌、车牌。\n2. Geolocation: 描述场景环境、地标，推断可能的地理位置（国家/城市）。\n3. Tech: 识别拍摄设备特征或后期编辑痕迹。\n4. Objects: 罗列关键物体（武器、电子设备、车辆）。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'agent_video_analyst',
    category: ToolCategory.AGENT,
    name: '视频情报 (Video Ops)',
    version: '1.0',
    author: 'Nexus Vision',
    description: '【视频】分析视频关键帧、转录音频内容、识别事件序列。',
    targetTypes: [NodeType.VIDEO],
    promptTemplate: "分析该视频内容（基于提供的元数据或帧数据）：\n1. 场景描述：视频发生了什么事件？\n2. 关键实体：出现了哪些人、车、物？\n3. 音频线索：如果有语音，概括对话内容或背景噪音特征。\n4. 拍摄环境：推断时间和地点。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'agent_translator',
    category: ToolCategory.AGENT,
    name: '文化解码 (Decoder)',
    version: '2.0',
    author: 'Nexus Polyglot',
    description: '翻译并解释俚语、隐喻及文化背景。',
    targetTypes: [NodeType.SOCIAL_POST, NodeType.DOCUMENT, NodeType.NOTE, NodeType.VIDEO, NodeType.AUDIO],
    promptTemplate: "将内容翻译为中文。重点解释：\n1. 黑话或俚语。\n2. 政治或宗教隐喻。\n3. 可能暗示地理位置的方言特征。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'agent_entity_extract',
    category: ToolCategory.AGENT,
    name: '实体提取 (Extractor)',
    version: '3.0',
    author: 'Nexus Core',
    description: '从非结构化文本中提取人名、地名、组织。',
    targetTypes: [NodeType.DOCUMENT, NodeType.NOTE, NodeType.REPORT, NodeType.SOCIAL_POST],
    promptTemplate: "深度阅读文本，提取所有提及的实体。\n重点关注：\n- 个人姓名\n- 组织机构\n- 具体地点\n- 提及的时间点\n- 涉及的违禁品或技术名词\n请创建这些实体节点。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'agent_timeline_gen',
    category: ToolCategory.AGENT,
    name: '时间线生成 (Timeline)',
    version: '1.0',
    author: 'Nexus Time',
    description: '从复杂的报告或文本中梳理事件发生的时间顺序。',
    targetTypes: [NodeType.REPORT, NodeType.DOCUMENT, NodeType.NOTE],
    promptTemplate: "阅读输入内容，构建一个按时间顺序排列的事件列表。\n格式要求：[时间] - [事件描述] (相关实体)。\n如果时间不明确，请推断可能的日期范围。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'agent_summarizer',
    category: ToolCategory.AGENT,
    name: '智能摘要 (Briefing)',
    version: '1.5',
    author: 'Nexus Core',
    description: '将长篇文档或大量数据浓缩为关键情报简报。',
    targetTypes: [NodeType.DOCUMENT, NodeType.REPORT, NodeType.LEAK_DUMP],
    promptTemplate: "你是情报分析主管。将输入内容总结为 200 字以内的“执行摘要”。\n包含：\n1. 核心事实 (Who, What, Where)。\n2. 数据的潜在价值。\n3. 下一步行动建议。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'agent_code_audit',
    category: ToolCategory.AGENT,
    name: '代码审计 (Audit)',
    version: '1.0',
    author: 'SecDev',
    description: '分析代码片段中的安全漏洞或恶意逻辑。',
    targetTypes: [NodeType.DOCUMENT], 
    promptTemplate: "分析这段代码片段：\n1. 识别编程语言。\n2. 寻找硬编码的凭证 (API Key, Password)。\n3. 发现潜在的安全漏洞 (SQLi, XSS, RCE)。\n4. 解释代码的恶意意图（如果有）。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'agent_deepfake',
    category: ToolCategory.AGENT,
    name: 'Deepfake 检测',
    version: 'Beta',
    author: 'TruthLens',
    description: '辅助分析视频/图片是否为 AI 生成。',
    targetTypes: [NodeType.IMAGE, NodeType.VIDEO],
    promptTemplate: "寻找 AI 生成内容的常见伪影：\n1. 手指数量或形状异常。\n2. 背景纹理的不连贯。\n3. 瞳孔反射不一致。\n4. 边缘模糊或过度平滑。\n给出真实性概率评估。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'agent_data_cleaner',
    category: ToolCategory.AGENT,
    name: '数据清洗 (Cleaner)',
    version: '1.0',
    author: 'Nexus Utils',
    description: '将杂乱的文本日志或 CSV 格式化为 JSON 对象。',
    targetTypes: [NodeType.NOTE, NodeType.DOCUMENT],
    promptTemplate: "将输入的非结构化文本数据整理为干净的 JSON 格式。\n去除无用的乱码、空白符。\n提取键值对。",
    autoExpand: false,
    isSimulated: false
  },

  // ============================================
  // SECTION 2: REAL ONLINE TOOLS (Google Grounding)
  // No API Keys needed, uses Google Search
  // ============================================
  
  // --- SOCMINT (Social Media) ---
  {
    id: 'mcp_github_recon',
    category: ToolCategory.MCP,
    name: 'GitHub 侦察 (Live)',
    version: 'Live',
    author: 'GitHub',
    description: '【真实】搜索 GitHub 上的代码库、Issue 和用户信息。',
    targetTypes: [NodeType.ENTITY, NodeType.EMAIL, NodeType.SEARCH_QUERY],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "使用 site:github.com 搜索该目标。查找：\n1. 相关的用户 Profile。\n2. 包含该名称/邮箱的代码提交记录。\n3. 泄露的配置文件或密钥。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_reddit_intel',
    category: ToolCategory.MCP,
    name: 'Reddit 讨论 (Live)',
    version: 'Live',
    author: 'Reddit',
    description: '【真实】检索 Reddit 上的相关讨论串和用户踪迹。',
    targetTypes: [NodeType.SEARCH_QUERY, NodeType.ENTITY, NodeType.TOPIC],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "使用 site:reddit.com 搜索相关话题。总结：\n1. 社区对该目标的普遍看法。\n2. 相关的爆料或传闻。\n3. 关键的评论者 ID。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_linkedin_lookup',
    category: ToolCategory.MCP,
    name: 'LinkedIn 职场 (Live)',
    version: 'Live',
    author: 'LinkedIn',
    description: '【真实】查找职业背景、任职公司和同事关系。',
    targetTypes: [NodeType.ENTITY, NodeType.ORGANIZATION],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "使用 site:linkedin.com 搜索目标。提取：\n1. 当前职位和公司。\n2. 过往的工作经历时间线。\n3. 教育背景。\n4. 可能的同事或合作伙伴。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_telegram_search',
    category: ToolCategory.MCP,
    name: 'Telegram 频道 (Live)',
    version: 'Live',
    author: 'Telegram',
    description: '【真实】检索公开的 Telegram 频道和群组预览。',
    targetTypes: [NodeType.SEARCH_QUERY, NodeType.TOPIC, NodeType.ORGANIZATION],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "使用 site:t.me 搜索相关的公开频道或群组。提取：\n1. 频道名称和链接。\n2. 频道的主要讨论话题（如黑客、政治、金融）。\n3. 订阅人数（如果可见）。",
    autoExpand: true,
    isSimulated: false
  },

  // --- TECH INT (Technical Intelligence) ---
  {
    id: 'mcp_tech_stack',
    category: ToolCategory.MCP,
    name: '技术栈识别 (Live)',
    version: 'Live',
    author: 'BuiltWith',
    description: '【真实】搜索网站使用的框架、服务器和技术组件。',
    targetTypes: [NodeType.DOMAIN, NodeType.URL],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该域名的技术栈信息（参考 BuiltWith, Wappalyzer 等来源）。提取：\n1. Web 服务器类型 (Nginx, Apache)。\n2. CMS 系统 (WordPress, Drupal)。\n3. 使用的 JavaScript 框架 (React, Vue)。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'mcp_ssl_subdomains',
    category: ToolCategory.MCP,
    name: 'SSL 子域名发现 (Live)',
    version: 'Live',
    author: 'Crt.sh',
    description: '【真实】通过 SSL 证书透明度记录查找子域名。',
    targetTypes: [NodeType.DOMAIN],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索 crt.sh 或其他证书透明度日志，查找该域名的子域名 (Subdomains)。\n列出所有发现的唯一子域名。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_mac_lookup',
    category: ToolCategory.MCP,
    name: 'MAC 地址厂商 (Live)',
    version: 'Live',
    author: 'IEEE',
    description: '【真实】查询 MAC 地址 OUI 以识别设备制造商。',
    targetTypes: [NodeType.MAC_ADDRESS],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该 MAC 地址的前缀 (OUI) 对应的设备制造商。例如 Apple, Cisco, Huawei。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'mcp_vuln_search',
    category: ToolCategory.MCP,
    name: 'CVE 漏洞情报 (Live)',
    version: 'Live',
    author: 'NIST',
    description: '【真实】检索特定漏洞的 PoC 和利用详情。',
    targetTypes: [NodeType.VULNERABILITY],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该 CVE 编号的最新技术分析。1. 查找是否存在公开的 PoC (Proof of Concept)。2. 确认受影响的具体版本。3. 修复补丁是否可用。",
    autoExpand: false,
    isSimulated: false
  },
  
  // --- THREAT INT (Threat Intelligence) ---
  {
    id: 'mcp_ransomware_check',
    category: ToolCategory.MCP,
    name: '勒索软件关联 (Live)',
    version: 'Live',
    author: 'RansomWatch',
    description: '【真实】检查实体是否出现在勒索软件勒索名单中。',
    targetTypes: [NodeType.ORGANIZATION, NodeType.DOMAIN],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该组织名称是否出现在 Ransomware Leak Sites（勒索软件泄露站点）的新闻报道中。\n确认：\n1. 攻击者团伙名称 (如 LockBit, Clop)。\n2. 宣称的攻击时间。\n3. 泄露数据的规模。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_breach_check',
    category: ToolCategory.MCP,
    name: '泄露数据检索 (Live)',
    version: 'Live',
    author: 'LeakCheck',
    description: '【真实】搜索该邮箱/用户是否出现在公开泄露事件中。',
    targetTypes: [NodeType.EMAIL, NodeType.ENTITY],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该邮箱/用户名是否出现在公开的数据泄露列表、Pastebin 或安全论坛中。\n注意：仅查找提及记录，确认涉及哪些网站的泄露（如 LinkedIn Breach, Adobe Breach）。",
    autoExpand: false,
    isSimulated: false
  },

  // --- GENERAL OSINT ---
  {
    id: 'mcp_google_search_entity',
    category: ToolCategory.MCP,
    name: '全网搜索 (Google)',
    version: 'Live',
    author: 'Google',
    description: '【真实】实时检索关于该实体的最新互联网情报。',
    targetTypes: [NodeType.ENTITY, NodeType.ORGANIZATION, NodeType.SEARCH_QUERY],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "使用 Google 搜索查询关于目标的最新信息。提取：\n1. 相关的近期新闻。\n2. 关联的社交媒体账号。\n3. 已知的公开声明或事件。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_fact_checker',
    category: ToolCategory.MCP,
    name: '事实核查 (FactCheck)',
    version: 'Live',
    author: 'FactCheck',
    description: '【真实】交叉验证新闻、谣言或声明的真实性。',
    targetTypes: [NodeType.SOCIAL_POST, NodeType.NOTE, NodeType.REPORT],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "对输入内容中的关键主张进行事实核查。\n搜索主流媒体和辟谣网站（如 Snopes）。\n结论：真实 / 虚假 / 有争议，并附上来源链接。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'mcp_wayback_machine',
    category: ToolCategory.MCP,
    name: '历史档案 (Wayback)',
    version: 'Live',
    author: 'Archive.org',
    description: '【真实】搜索网页的历史快照和变迁。',
    targetTypes: [NodeType.URL, NodeType.DOMAIN],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该 URL 在 Internet Archive (Wayback Machine) 上的记录。\n寻找：\n1. 网站早期的主要内容。\n2. 网站发生重大改版的时间点。\n3. 已被删除的页面痕迹。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_whois_live',
    category: ToolCategory.MCP,
    name: 'WHOIS 查询 (Live)',
    version: 'Live',
    author: 'ICANN',
    description: '【真实】通过搜索引擎检索域名的注册信息。',
    targetTypes: [NodeType.DOMAIN, NodeType.URL],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该域名的 WHOIS 记录信息。尝试找到：\n1. 注册商 (Registrar)。\n2. 注册日期和到期日期。\n3. 任何公开的 Registrant Organization 信息。\n注意：不要编造，只提取搜索结果中确定的信息。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_google_maps_lookup',
    category: ToolCategory.MCP,
    name: '地理侦察 (Maps)',
    version: 'Live',
    author: 'Google',
    description: '【真实】查询地理位置周边的设施和环境。',
    targetTypes: [NodeType.GEO_LOCATION, NodeType.ORGANIZATION],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该地点的详细信息。查找周边的关键设施（政府机构、关键基础设施）。寻找用户评论中提及的安全相关信息。",
    autoExpand: true,
    isSimulated: false
  },

  // --- FININT & LEGAL ---
  {
    id: 'mcp_company_check',
    category: ToolCategory.MCP,
    name: '企业背景调查 (Live)',
    version: 'Live',
    author: 'OpenData',
    description: '【真实】搜索工商注册信息、负面新闻。',
    targetTypes: [NodeType.ORGANIZATION],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该公司的工商注册信息、LinkedIn 页面和相关新闻。\n1. 确认总部所在地。\n2. 寻找主要高管姓名。\n3. 检查是否有涉诉或诈骗指控。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_swift_lookup',
    category: ToolCategory.MCP,
    name: 'SWIFT/BIC 查询',
    version: 'Live',
    author: 'SwiftRef',
    description: '【真实】查找银行 SWIFT 代码对应的分行信息。',
    targetTypes: [NodeType.ORGANIZATION, NodeType.NOTE],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该 SWIFT/BIC 代码对应的具体银行名称、分行地址和国家。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'mcp_patent_search',
    category: ToolCategory.MCP,
    name: '专利/商标检索',
    version: 'Live',
    author: 'WIPO',
    description: '【真实】查询个人或公司持有的知识产权。',
    targetTypes: [NodeType.ORGANIZATION, NodeType.ENTITY],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该目标申请的专利或注册商标（Google Patents, Justia）。\n提取：\n1. 主要技术领域。\n2. 最近的专利申请标题。\n3. 合作的发明人。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_etherscan_live',
    category: ToolCategory.MCP,
    name: 'Etherscan 追踪 (Live)',
    version: 'Live',
    author: 'Etherscan',
    description: '【真实】通过搜索公开账本浏览器查询钱包动态。',
    targetTypes: [NodeType.CRYPTO_WALLET],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索 Etherscan 或其他区块链浏览器关于该钱包地址的记录。提取：\n1. 当前余额。\n2. 最近的一笔主要交易时间。\n3. 是否被打上 'Phish' 或 'Hack' 的标签。",
    autoExpand: true,
    isSimulated: false
  },

  // ============================================
  // SECTION 3: SIMULATED TOOLS (APIs needing Keys)
  // Kept for demonstration of specific JSON structures
  // ============================================
  {
    id: 'api_virustotal',
    category: ToolCategory.API,
    name: 'VirusTotal (Sim)',
    version: 'v3',
    author: 'Google',
    description: '【模拟】查询威胁情报 (需 API Key)。',
    targetTypes: [NodeType.IP_ADDRESS, NodeType.FILE_HASH],
    apiConfig: {
        endpoint: 'https://www.virustotal.com/api/v3/ip_addresses/',
        method: 'GET',
        mockResponse: {
            "data": {
                "attributes": {
                    "last_analysis_stats": { "harmless": 50, "malicious": 12, "suspicious": 3 },
                    "reputation": -25,
                    "network": "185.100.0.0/24",
                    "tags": ["botnet", "phishing", "cobalt-strike"]
                }
            }
        }
    },
    promptTemplate: "基于模拟的 VT 数据：1. 判断威胁等级。2. 提取 ASN。3. 关联攻击组织标签。",
    autoExpand: true,
    isSimulated: true
  },
  {
    id: 'api_shodan',
    name: 'Shodan Host (Sim)',
    category: ToolCategory.API,
    version: '2.0',
    author: 'Shodan',
    description: '【模拟】查询端口暴露情况 (需 API Key)。',
    targetTypes: [NodeType.IP_ADDRESS],
    apiConfig: {
        endpoint: 'https://api.shodan.io/shodan/host/',
        method: 'GET',
        mockResponse: {
            "ports": [22, 80, 443, 3389],
            "os": "Linux 4.x",
            "vulns": ["CVE-2021-44228"],
            "data": [{ "port": 22, "product": "OpenSSH" }]
        }
    },
    promptTemplate: "分析开放端口和 CVE 漏洞。",
    autoExpand: true,
    isSimulated: true
  },
  {
    id: 'api_flightaware',
    name: 'FlightAware (Sim)',
    category: ToolCategory.API,
    version: '4.0',
    author: 'FlightAware',
    description: '【模拟】航班实时追踪。',
    targetTypes: [NodeType.VEHICLE],
    apiConfig: {
        endpoint: 'https://aeroapi.flightaware.com/',
        method: 'GET',
        mockResponse: {
            "flights": [{ "ident": "N12345", "origin": "KJFK", "destination": "EGLL", "status": "En Route" }]
        }
    },
    promptTemplate: "追踪飞机航程。",
    autoExpand: true,
    isSimulated: true
  },

  // ============================================
  // SECTION 4: UTILITY TOOLS (Local Logic)
  // ============================================
  {
    id: 'mcp_dork_gen',
    category: ToolCategory.MCP,
    name: 'Dork 生成器 (Util)',
    version: '2.0',
    author: 'GHDB',
    description: '构建 Google Hacking 搜索语法。',
    targetTypes: [NodeType.SEARCH_QUERY, NodeType.ENTITY, NodeType.DOMAIN],
    mcpConfig: { functionName: 'generateDorks' },
    promptTemplate: "生成 5 个 Google Dork 语法用于搜索该目标。例如：filetype:pdf, inurl:admin, site:target.com。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'mcp_calc_subnet',
    category: ToolCategory.MCP,
    name: 'Subnet 计算 (Util)',
    version: '1.0',
    author: 'NetUtils',
    description: '计算 IP CIDR 范围。',
    targetTypes: [NodeType.IP_ADDRESS],
    mcpConfig: { functionName: 'calculateSubnet' },
    promptTemplate: "计算该 IP 所在 C 段 (CIDR /24) 的网络范围。",
    autoExpand: true,
    isSimulated: false
  },

  // ============================================
  // SECTION 5: INTELLIGENCE COLLECTION OPS (NEW)
  // ============================================
  
  // HUMINT
  {
    id: 'col_humint_reliability',
    category: ToolCategory.AGENT,
    name: '信源可靠性评级 (HUMINT)',
    version: '1.0',
    author: 'Intel Ops',
    description: '根据海军部代码 (Admiralty Code) 评估人力情报来源的可靠性和内容可信度。',
    targetTypes: [NodeType.SOURCE_HUMINT, NodeType.REPORT],
    promptTemplate: "评估该信源的可靠性。\n输入数据包括过往记录、动机和访问权限。\n1. 判定来源可靠性 (A-F)。\n2. 判定信息可信度 (1-6)。\n3. 输出具体的评级理由。\n4. 标记潜在的偏见或欺骗风险。",
    autoExpand: false,
    isSimulated: false
  },
  {
    id: 'col_humint_debrief',
    category: ToolCategory.AGENT,
    name: '审讯/访谈提纲生成',
    version: '1.0',
    author: 'Intel Ops',
    description: '基于现有情报生成针对该信源的访谈或审讯问题清单。',
    targetTypes: [NodeType.SOURCE_HUMINT, NodeType.ENTITY],
    promptTemplate: "你是审讯专家。针对该目标生成一份访谈提纲。\n目标是填补当前情报图谱中的空白。\n1. 设计 5-10 个关键问题。\n2. 包含用于验证真伪的控制性问题 (Control Questions)。\n3. 建议采用的审讯策略（如：建立共情、证据施压）。",
    autoExpand: false,
    isSimulated: false
  },

  // SIGINT
  {
    id: 'col_sigint_alloc',
    category: ToolCategory.MCP,
    name: '无线电频谱查询 (SIGINT)',
    version: 'Live',
    author: 'ITU/FCC',
    description: '【真实】查询特定频率的分配情况和常见用途。',
    targetTypes: [NodeType.SOURCE_SIGINT, NodeType.SENSOR],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该频率 (Frequency) 的无线电频谱分配情况。\n1. 确定该频段的法定用途（如：航空、海事、军用、业余无线电）。\n2. 查找该频率是否与已知的数字通信协议（如 TETRA, DMR, LoRa）相关。\n3. 搜索该频率在目标区域的已知用户。",
    autoExpand: true,
    isSimulated: false
  },

  // IMINT
  {
    id: 'col_imint_analysis',
    category: ToolCategory.AGENT,
    name: '地理空间图像分析 (IMINT)',
    version: '2.5',
    author: 'Vision AI',
    description: '分析卫星图或航拍图中的军事/设施特征。',
    targetTypes: [NodeType.SOURCE_IMINT, NodeType.IMAGE],
    promptTemplate: "作为 IMINT 图像情报分析师，分析图像内容。\n1. 识别关键基础设施（跑道、储油罐、雷达罩、防御工事）。\n2. 估算设施的大致尺寸或容量。\n3. 判断设施的活跃状态（如：车辆活动、烟雾、新施工痕迹）。\n4. 标记感兴趣区域 (ROI)。",
    autoExpand: true,
    isSimulated: false
  },

  // GEOINT
  {
    id: 'col_geoint_context',
    category: ToolCategory.MCP,
    name: '坐标环境侦察 (GEOINT)',
    version: 'Live',
    author: 'Google Maps',
    description: '【真实】对坐标周边环境进行详细的情报侦察。',
    targetTypes: [NodeType.SOURCE_GEOINT, NodeType.GEO_LOCATION],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "搜索该地理坐标周边的详细环境信息。\n1. 识别最近的军事基地、政府设施或关键基础设施。\n2. 查找该地点的历史卫星图像变化记录（新闻报道）。\n3. 搜索与该地点相关的地缘政治事件。",
    autoExpand: true,
    isSimulated: false
  },

  // OSINT (Source specific)
  {
    id: 'col_osint_crossref',
    category: ToolCategory.MCP,
    name: '跨平台身份关联 (OSINT)',
    version: 'Live',
    author: 'Sherlock',
    description: '【真实】基于用户名或特征在全网搜索关联账号。',
    targetTypes: [NodeType.SOURCE_OSINT, NodeType.IDENTITY, NodeType.SOCIAL_PROFILE],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "对该用户名/ID 进行跨平台搜索。\n查找：GitHub, Twitter, Instagram, Reddit, Telegram, LinkedIn 等平台的同名账号。\n分析这些账号是否属于同一自然人的可能性（基于头像、简介、活动时间的重合度）。",
    autoExpand: true,
    isSimulated: false
  },
  {
    id: 'col_osint_docs',
    category: ToolCategory.MCP,
    name: '敏感文档挖掘 (OSINT)',
    version: 'Live',
    author: 'Google Dorks',
    description: '【真实】搜索与目标相关的公开 PDF, Excel, Doc 文档。',
    targetTypes: [NodeType.ORGANIZATION, NodeType.SOURCE_OSINT, NodeType.DOMAIN],
    mcpConfig: { functionName: 'googleSearch' },
    promptTemplate: "构造 Google Dork (filetype:pdf OR filetype:xlsx OR filetype:docx) 搜索与该目标相关的文件。\n重点寻找：\n1. 内部通讯录。\n2. 财务报表。\n3. 招标文件。\n4. 包含 'Confidential' 或 'Internal Use Only' 的文件。",
    autoExpand: true,
    isSimulated: false
  }
];
