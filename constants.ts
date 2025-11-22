

import { NodeType } from './types';

export const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (高速/通用)', description: '适合大多数情报提取和摘要任务，速度快。' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro (深度推理)', description: '适合复杂的逻辑分析、代码审计和心理侧写。' },
];

export const ENTITY_DEFAULT_FIELDS: Partial<Record<NodeType, Record<string, string>>> = {
  // --- 1. SUBJECTS ---
  [NodeType.ENTITY]: {
    "姓名": "", "照片": "", "别名": "", "职业": "", "国籍": "", "出生日期": "", "身份证号": ""
  },
  [NodeType.ORGANIZATION]: {
    "机构名称": "", "LOGO": "", "行业": "", "注册号": "", "总部地址": "", "成立日期": "", "法人代表": ""
  },
  [NodeType.THREAT_ACTOR]: {
    "代号": "", "活跃地区": "", "动机": "", "目标行业": "", "常用TTPs": "", "疑似归属": ""
  },
  [NodeType.IDENTITY]: {
    "假名": "", "证件类型": "", "证件号码": "", "签发地": "", "有效期": ""
  },
  [NodeType.MILITARY_UNIT]: {
    "番号": "", "隶属": "", "驻地": "", "指挥官": "", "装备": "", "任务性质": ""
  },
  [NodeType.GOV_AGENCY]: {
    "部门名称": "", "层级": "", "管辖区域": "", "职能": "", "负责人": ""
  },

  // --- 2. NETWORK INFRA ---
  [NodeType.IP_ADDRESS]: {
    "IP地址": "", "ASN": "", "ISP": "", "地理位置": "", "威胁评分": "", "开放端口": ""
  },
  [NodeType.MAC_ADDRESS]: {
    "MAC地址": "", "厂商(OUI)": "", "设备类型": "", "关联IP": ""
  },
  [NodeType.DOMAIN]: {
    "域名": "", "注册商": "", "注册日期": "", "到期日期": "", "NameServer": "", "Whois隐私": ""
  },
  [NodeType.URL]: {
    "链接": "", "网页标题": "", "HTTP状态": "", "内容类型": "", "最后抓取": ""
  },
  [NodeType.SERVER]: {
    "主机名": "", "操作系统": "", "MAC地址": "", "物理位置": "", "用途": ""
  },
  [NodeType.C2_SERVER]: {
    "C2 IP": "", "家族": "", "心跳间隔": "", "通信协议": "", "Payload特征": ""
  },
  [NodeType.BOTNET]: {
    "名称": "", "控制协议": "", "估计规模": "", "活跃区域": "", "主要目标": ""
  },
  [NodeType.CLOUD_SERVICE]: {
    "服务商": "", "Bucket名/ID": "", "区域": "", "访问权限": "", "泄露状态": ""
  },
  [NodeType.WIFI]: {
    "SSID": "", "BSSID": "", "加密方式": "", "信号强度": "", "发现位置": ""
  },
  [NodeType.ASN]: {
    "ASN编号": "", "拥有者": "", "注册国家": "", "IP段数量": ""
  },
  [NodeType.SSL_CERT]: {
    "CN": "", "颁发者": "", "有效期起": "", "有效期止": "", "指纹(SHA1)": ""
  },

  // --- 3. COMMUNICATION ---
  [NodeType.EMAIL]: {
    "邮箱地址": "", "关联服务": "", "泄露记录": "", "密码Hash": ""
  },
  [NodeType.PHONE_NUMBER]: {
    "号码": "", "国家代码": "", "运营商": "", "归属地": "", "关联App": ""
  },
  [NodeType.SOCIAL_PROFILE]: {
    "平台": "", "用户名": "", "用户ID": "", "昵称": "", "注册时间": "", "粉丝数": ""
  },
  [NodeType.MESSAGING_ID]: {
    "应用": "", "账号/ID": "", "昵称": "", "最后活跃": ""
  },
  [NodeType.FORUM_ACCOUNT]: {
    "论坛名称": "", "用户名": "", "注册时间": "", "发帖数": "", "信誉度": ""
  },
  [NodeType.APP]: {
    "应用名称": "", "包名": "", "版本": "", "开发者": "", "下载来源": ""
  },

  // --- 4. FINANCIAL ---
  [NodeType.CRYPTO_WALLET]: {
    "地址": "", "公链": "", "余额": "", "首次交易": "", "最后交易": ""
  },
  [NodeType.BANK_ACCOUNT]: {
    "银行名称": "", "账号": "", "SWIFT/BIC": "", "开户行地址": "", "账户类型": ""
  },
  [NodeType.CREDIT_CARD]: {
    "卡号(Masked)": "", "发卡行": "", "卡组织": "", "类型": "", "BIN码": ""
  },
  [NodeType.TRANSACTION]: {
    "交易ID": "", "时间": "", "金额": "", "发送方": "", "接收方": "", "备注": ""
  },

  // --- 5. PHYSICAL WORLD ---
  [NodeType.GEO_LOCATION]: {
    "详细地址": "", "经纬度": "", "国家": "", "城市": "", "邮编": ""
  },
  [NodeType.FACILITY]: {
    "设施名称": "", "类型": "", "安保等级": "", "所有者": "", "楼层平面图": ""
  },
  [NodeType.VEHICLE]: {
    "车牌号": "", "VIN码": "", "品牌型号": "", "颜色": "", "车主": ""
  },
  [NodeType.DEVICE]: {
    "设备名称": "", "IMEI/MEID": "", "型号": "", "系统版本": "", "序列号": ""
  },
  [NodeType.WEAPON]: {
    "类型": "", "型号": "", "序列号": "", "口径": "", "生产商": ""
  },
  [NodeType.SIM_CARD]: {
    "ICCID": "", "IMSI": "", "运营商": "", "状态": ""
  },

  // --- 6. TRAVEL & LOGISTICS (NEW) ---
  [NodeType.FLIGHT]: {
    "航班号": "", "起飞机场": "", "降落机场": "", "起飞时间": "", "座位号": "", "乘客名单": ""
  },
  [NodeType.HOTEL]: {
    "酒店名称": "", "入住日期": "", "退房日期": "", "房号": "", "同住人": ""
  },
  [NodeType.SHIPPING]: {
    "集装箱号": "", "提单号": "", "船名": "", "货物描述": "", "出发港": "", "目的港": ""
  },
  [NodeType.PASSPORT]: {
    "护照号": "", "签发国": "", "姓名": "", "有效期": "", "出生地": "", "机读码(MRZ)": ""
  },
  [NodeType.VISA]: {
    "签证号": "", "签发国": "", "类型": "", "有效期": "", "停留天数": ""
  },

  // --- 7. CONTENT & MEDIA ---
  [NodeType.IMAGE]: {
    "文件内容": "", "来源URL": "", "EXIF": "", "宽度": "", "高度": ""
  },
  [NodeType.VIDEO]: {
    "文件内容": "", "来源URL": "", "时长": "", "分辨率": "", "编码": ""
  },
  [NodeType.AUDIO]: {
    "文件内容": "", "时长": "", "采样率": "", "语种": "", "声纹特征": ""
  },
  [NodeType.DOCUMENT]: {
    "文件内容": "", "文件名": "", "类型": "", "作者": "", "创建时间": ""
  },
  [NodeType.SOCIAL_POST]: {
    "平台": "", "帖子ID": "", "内容": "", "发布时间": "", "互动数": ""
  },
  [NodeType.NEWS_ARTICLE]: {
    "标题": "", "来源媒体": "", "作者": "", "发布日期": "", "URL": ""
  },
  [NodeType.DARKWEB_SITE]: {
    "Onion链接": "", "标题": "", "服务状态": "", "托管内容": ""
  },
  [NodeType.FILE_HASH]: {
    "MD5": "", "SHA1": "", "SHA256": "", "文件类型": ""
  },
  [NodeType.CODE_SNIPPET]: {
    "语言": "", "来源": "", "功能描述": "", "关键特征": ""
  },
  [NodeType.EXPLOIT]: {
    "CVE编号": "", "利用类型": "", "目标平台": "", "Payload": "", "公开日期": ""
  },
  [NodeType.PHISHING_KIT]: {
    "名称": "", "伪造品牌": "", "后台地址": "", "特征哈希": ""
  },

  // --- 8. INTELLIGENCE COLLECTION (NEW) ---
  [NodeType.SOURCE_HUMINT]: {
    "代号": "", "可靠性": "", "接入时间": "", "负责官员": "", "动机": ""
  },
  [NodeType.SOURCE_SIGINT]: {
    "频率": "", "截获时间": "", "信号类型": "", "加密方式": "", "发射源位置": ""
  },
  [NodeType.SOURCE_IMINT]: {
    "卫星/平台": "", "拍摄时间": "", "分辨率": "", "坐标范围": "", "云层覆盖": ""
  },
  [NodeType.SOURCE_GEOINT]: {
    "地理特征": "", "测绘数据": "", "图层来源": "", "更新时间": ""
  },
  [NodeType.SOURCE_OSINT]: {
    "来源URL": "", "抓取工具": "", "归档快照": "", "数据类型": ""
  },
  [NodeType.SOURCE_MASINT]: {
    "特征类型": "", "传感器数据": "", "采集地点": "", "分析结论": ""
  },

  // --- 9. INTELLIGENCE & ANALYSIS ---
  [NodeType.REPORT]: {
    "标题": "", "摘要": "", "密级": "", "作者": "", "日期": ""
  },
  [NodeType.NOTE]: {
    "笔记内容": "", "创建人": "", "日期": ""
  },
  [NodeType.EVENT]: {
    "事件名称": "", "发生时间": "", "地点": "", "参与者": "", "性质": ""
  },
  [NodeType.CAMPAIGN]: {
    "战役名称": "", "开始时间": "", "结束时间": "", "目标": "", "相关组织": ""
  },
  [NodeType.VULNERABILITY]: {
    "CVE编号": "", "CVSS评分": "", "影响版本": "", "利用状态": ""
  },
  [NodeType.MALWARE]: {
    "名称": "", "家族": "", "类型": "", "C2服务器": "", "感染方式": ""
  },
  [NodeType.TOPIC]: {
    "话题": "", "关键词": "", "热度": "", "情感倾向": ""
  },
  [NodeType.HYPOTHESIS]: {
    "假设内容": "", "置信度": "", "支持证据": "", "反驳证据": ""
  },
  [NodeType.LEGAL_CASE]: {
    "案件编号": "", "法院": "", "案由": "", "当事人": "", "状态": ""
  },

  // --- 10. OPS ---
  [NodeType.SEARCH_QUERY]: {
    "查询词": "", "引擎": "", "时间": "", "结果数": ""
  },
  [NodeType.DATA_SOURCE]: {
    "名称": "", "URL": "", "类型": "", "可信度": ""
  },
  [NodeType.LEAK_DUMP]: {
    "名称": "", "泄露日期": "", "条目数": "", "来源": ""
  },
  [NodeType.SENSOR]: {
    "ID": "", "类型": "", "位置": "", "状态": ""
  }
};