/**
 * PDF Export Service
 * PDF 导出服务 - 情报简报导出
 */

import { jsPDF } from 'jspdf';

// 定义页面配置
const PAGE_CONFIG = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  lineHeight: 7,
  titleFontSize: 16,
  subtitleFontSize: 12,
  bodyFontSize: 10,
  footerFontSize: 8
};

/**
 * 生成情报简报 PDF
 * @param reportText 简报文本内容
 * @param title 简报标题
 */
export function generateBriefingPDF(reportText: string, title?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const contentWidth = PAGE_CONFIG.width - PAGE_CONFIG.marginLeft - PAGE_CONFIG.marginRight;
  let currentY = PAGE_CONFIG.marginTop;

  // 添加页眉
  const addHeader = (pageNum: number) => {
    // 顶部线条
    doc.setDrawColor(6, 182, 212); // cyan-500
    doc.setLineWidth(0.5);
    doc.line(PAGE_CONFIG.marginLeft, 10, PAGE_CONFIG.width - PAGE_CONFIG.marginRight, 10);

    // 系统标识
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('HETU INTELLIGENCE ANALYSIS SYSTEM', PAGE_CONFIG.marginLeft, 8);

    // 机密标识
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68); // red-500
    const classificationText = 'CLASSIFIED - INTERNAL USE ONLY';
    const classificationWidth = doc.getTextWidth(classificationText);
    doc.text(classificationText, PAGE_CONFIG.width - PAGE_CONFIG.marginRight - classificationWidth, 8);

    // 页码
    doc.setFontSize(PAGE_CONFIG.footerFontSize);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${pageNum}`, PAGE_CONFIG.width - PAGE_CONFIG.marginRight - 15, PAGE_CONFIG.height - 10);
  };

  // 添加页脚
  const addFooter = () => {
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.line(PAGE_CONFIG.marginLeft, PAGE_CONFIG.height - 15, PAGE_CONFIG.width - PAGE_CONFIG.marginRight, PAGE_CONFIG.height - 15);

    doc.setFontSize(PAGE_CONFIG.footerFontSize);
    doc.setTextColor(100, 116, 139);
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated: ${timestamp}`, PAGE_CONFIG.marginLeft, PAGE_CONFIG.height - 10);
  };

  // 检查是否需要新页面
  const checkNewPage = (requiredSpace: number): boolean => {
    if (currentY + requiredSpace > PAGE_CONFIG.height - PAGE_CONFIG.marginBottom - 20) {
      addFooter();
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = PAGE_CONFIG.marginTop + 10;
      return true;
    }
    return false;
  };

  let pageNumber = 1;
  addHeader(pageNumber);

  // 标题
  const reportTitle = title || '情报简报 (Intelligence Briefing)';
  doc.setFontSize(PAGE_CONFIG.titleFontSize);
  doc.setTextColor(0, 0, 0);
  doc.text(reportTitle, PAGE_CONFIG.marginLeft, currentY);
  currentY += 10;

  // 日期
  doc.setFontSize(PAGE_CONFIG.bodyFontSize);
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Report Date: ${dateStr}`, PAGE_CONFIG.marginLeft, currentY);
  currentY += 10;

  // 分隔线
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(PAGE_CONFIG.marginLeft, currentY, PAGE_CONFIG.width - PAGE_CONFIG.marginRight, currentY);
  currentY += 10;

  // 处理正文内容
  doc.setFontSize(PAGE_CONFIG.bodyFontSize);
  doc.setTextColor(30, 41, 59); // slate-800

  // 将文本按行分割
  const lines = reportText.split('\n');

  for (const line of lines) {
    // 检测标题行（以 # 或 ## 或数字. 开头）
    const isHeading = /^#{1,3}\s/.test(line) || /^\d+\.\s/.test(line);
    const isBullet = /^[-*]\s/.test(line.trim());

    if (isHeading) {
      checkNewPage(15);
      doc.setFontSize(PAGE_CONFIG.subtitleFontSize);
      doc.setTextColor(6, 182, 212); // cyan-500
      const cleanLine = line.replace(/^#{1,3}\s/, '');
      doc.text(cleanLine, PAGE_CONFIG.marginLeft, currentY);
      currentY += PAGE_CONFIG.lineHeight + 2;
      doc.setFontSize(PAGE_CONFIG.bodyFontSize);
      doc.setTextColor(30, 41, 59);
    } else if (line.trim() === '') {
      // 空行
      currentY += 4;
    } else {
      // 普通文本，自动换行
      checkNewPage(PAGE_CONFIG.lineHeight);

      const leftMargin = isBullet ? PAGE_CONFIG.marginLeft + 5 : PAGE_CONFIG.marginLeft;
      const textWidth = isBullet ? contentWidth - 5 : contentWidth;

      // 使用 jsPDF 的 splitTextToSize 处理长文本换行
      const wrappedLines = doc.splitTextToSize(line, textWidth);

      for (const wrappedLine of wrappedLines) {
        checkNewPage(PAGE_CONFIG.lineHeight);
        doc.text(wrappedLine, leftMargin, currentY);
        currentY += PAGE_CONFIG.lineHeight;
      }
    }
  }

  // 添加最后一页的页脚
  addFooter();

  // 下载 PDF
  const fileName = `Intel_Briefing_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * 生成图谱分析报告 PDF（包含节点和连接统计）
 */
export function generateAnalysisReportPDF(
  reportText: string,
  nodeCount: number,
  connectionCount: number,
  communityCount?: number,
  keyNodeCount?: number
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let currentY = PAGE_CONFIG.marginTop;

  // 页眉
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.5);
  doc.line(PAGE_CONFIG.marginLeft, 10, PAGE_CONFIG.width - PAGE_CONFIG.marginRight, 10);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('HETU INTELLIGENCE ANALYSIS SYSTEM', PAGE_CONFIG.marginLeft, 8);

  // 标题
  doc.setFontSize(PAGE_CONFIG.titleFontSize);
  doc.setTextColor(0, 0, 0);
  doc.text('Intelligence Analysis Report', PAGE_CONFIG.marginLeft, currentY);
  currentY += 12;

  // 统计摘要框
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, PAGE_CONFIG.width - PAGE_CONFIG.marginLeft - PAGE_CONFIG.marginRight, 25, 2, 2, 'FD');

  currentY += 8;
  doc.setFontSize(PAGE_CONFIG.bodyFontSize);
  doc.setTextColor(71, 85, 105); // slate-600

  // 统计数据行
  const stats = [
    `Entities: ${nodeCount}`,
    `Connections: ${connectionCount}`,
    communityCount !== undefined ? `Communities: ${communityCount}` : null,
    keyNodeCount !== undefined ? `Key Nodes: ${keyNodeCount}` : null
  ].filter(Boolean).join('  |  ');

  doc.text(stats, PAGE_CONFIG.marginLeft + 5, currentY);
  currentY += 8;

  const dateStr = new Date().toLocaleString('zh-CN');
  doc.text(`Generated: ${dateStr}`, PAGE_CONFIG.marginLeft + 5, currentY);
  currentY += 15;

  // 分隔线
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(PAGE_CONFIG.marginLeft, currentY, PAGE_CONFIG.width - PAGE_CONFIG.marginRight, currentY);
  currentY += 10;

  // 正文
  doc.setFontSize(PAGE_CONFIG.bodyFontSize);
  doc.setTextColor(30, 41, 59);

  const contentWidth = PAGE_CONFIG.width - PAGE_CONFIG.marginLeft - PAGE_CONFIG.marginRight;
  const lines = doc.splitTextToSize(reportText, contentWidth);

  for (const line of lines) {
    if (currentY > PAGE_CONFIG.height - PAGE_CONFIG.marginBottom - 20) {
      doc.addPage();
      currentY = PAGE_CONFIG.marginTop;
    }
    doc.text(line, PAGE_CONFIG.marginLeft, currentY);
    currentY += PAGE_CONFIG.lineHeight;
  }

  // 页脚
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.line(PAGE_CONFIG.marginLeft, PAGE_CONFIG.height - 15, PAGE_CONFIG.width - PAGE_CONFIG.marginRight, PAGE_CONFIG.height - 15);

  doc.setFontSize(PAGE_CONFIG.footerFontSize);
  doc.setTextColor(100, 116, 139);
  doc.text('CLASSIFIED - INTERNAL USE ONLY', PAGE_CONFIG.marginLeft, PAGE_CONFIG.height - 10);

  // 下载
  const fileName = `Intel_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
