
import React, { useEffect, useRef } from 'react';
import { Play, Zap, X, Trash2, Route, Eye, AlertTriangle } from 'lucide-react';
import { Tool, IntelNode, FollowUpRule } from '../types';
import { resolveFollowUpRules } from '../constants';

interface ContextMenuProps {
  x: number;
  y: number;
  node: IntelNode;
  availableTools: Tool[];
  allTools: Tool[];
  followUpRules: FollowUpRule[];
  onRunTool: (tool: Tool) => void;
  onDelete: () => void;
  onClose: () => void;
  onAnalyzeTrajectory?: () => void;
  onViewDetail?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  node,
  availableTools,
  allTools,
  followUpRules,
  onRunTool,
  onDelete,
  onClose,
  onAnalyzeTrajectory,
  onViewDetail
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 计算工具的联动链提示
  const getFollowUpHint = (tool: Tool): string | undefined => {
    const activeRules = resolveFollowUpRules(tool, followUpRules);
    if (activeRules.length === 0) return undefined;
    
    const hints = activeRules.map(r => {
      const targetTool = allTools.find(t => t.id === r.targetToolId);
      return `发现 ${r.whenNodeType} → 自动执行 ${targetTool?.name || r.targetToolId}`;
    });
    return `🔗 联动链:\n${hints.join('\n')}`;
  };

  // Prevent menu from going off-screen
  const style = {
    top: Math.max(8, Math.min(y, window.innerHeight - 300)),
    left: Math.max(8, Math.min(x, window.innerWidth - 260)),
    minWidth: '240px',
  };

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={style}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-slate-950/50 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-cyan-500 bg-cyan-950/30 px-1.5 rounded border border-cyan-900">
            {node.type}
          </span>
          <span className="text-xs text-slate-300 truncate max-w-[120px]" title={node.title}>
            {node.title}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
           <X className="w-3 h-3" />
        </button>
      </div>

      <div className="p-1 flex flex-col gap-0.5 max-h-[300px] overflow-y-auto">
        {availableTools.length > 0 ? (
          <>
            <div className="px-2 py-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              可用情报动作 (Actions)
            </div>
            {availableTools.map((tool) => {
                const followUpHint = getFollowUpHint(tool);
                const titleText = tool.isDeprecated
                  ? `⚠️ ${tool.deprecationReason}${followUpHint ? '\n\n' + followUpHint : ''}`
                  : followUpHint ? `${tool.description}\n\n${followUpHint}` : tool.description;
                return (
              <button
                key={tool.id}
                onClick={() => {
                  onRunTool(tool);
                  onClose();
                }}
                className={`flex items-center gap-3 px-2 py-2 text-left rounded transition-colors group ${
                  tool.isDeprecated
                    ? 'hover:bg-yellow-900/20 hover:text-yellow-400 text-yellow-600/80'
                    : 'hover:bg-cyan-900/20 hover:text-cyan-400 text-slate-300'
                }`}
                title={titleText}
              >
                <div className={`p-1 rounded ${
                  tool.isDeprecated
                    ? 'bg-yellow-900/20 group-hover:bg-yellow-900/40 text-yellow-500 group-hover:text-yellow-400'
                    : 'bg-slate-800 group-hover:bg-cyan-900/50 text-slate-400 group-hover:text-cyan-400'
                }`}>
                   {tool.isDeprecated ? <AlertTriangle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium flex items-center gap-1.5">
                    {tool.name}
                    {tool.isSimulated && !tool.isDeprecated && (
                      <span className="text-[8px] px-1 py-0.5 bg-slate-700 text-slate-400 rounded">SIM</span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 line-clamp-1">{tool.description}</div>
                </div>
                <Play className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${tool.isDeprecated ? 'text-yellow-500' : ''}`} />
              </button>
            );})}
          </>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 italic">
            该实体类型暂无可用工具。
          </div>
        )}
      </div>
      
      {/* 查看详情 */}
      {onViewDetail && (
        <div className="p-1 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={() => { onViewDetail(); onClose(); }}
            className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-cyan-900/20 hover:text-cyan-400 rounded text-slate-400 transition-colors group"
          >
            <div className="p-1 bg-slate-800 group-hover:bg-cyan-900/50 rounded text-slate-500 group-hover:text-cyan-400">
               <Eye className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium">查看详情</span>
          </button>
        </div>
      )}

      {/* 分析功能 */}
      {onAnalyzeTrajectory && (
        <div className="p-1 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={() => { onAnalyzeTrajectory(); onClose(); }}
            className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-cyan-900/20 hover:text-cyan-400 rounded text-slate-400 transition-colors group"
          >
            <div className="p-1 bg-slate-800 group-hover:bg-cyan-900/50 rounded text-slate-500 group-hover:text-cyan-400">
               <Route className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium">分析时空轨迹</span>
          </button>
        </div>
      )}

      <div className="p-1 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-red-900/20 hover:text-red-400 rounded text-slate-400 transition-colors group"
          >
            <div className="p-1 bg-slate-800 group-hover:bg-red-900/50 rounded text-slate-500 group-hover:text-red-400">
               <Trash2 className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium">删除实体 (Delete)</span>
          </button>
      </div>
    </div>
  );
};
