
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { ContextMenu } from './components/ContextMenu';
import { IntelNode, Connection, NodeType, Position, LogEntry, Tool, AIModelConfig } from './types';
import { executeTool } from './services/geminiService';
import { ENTITY_DEFAULT_FIELDS } from './constants';
import { DEFAULT_TOOLS } from './tools';
import { Search } from 'lucide-react';

const uuid = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [nodes, setNodes] = useState<IntelNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([{
      id: 'init',
      timestamp: new Date(),
      action: 'NEXUS 系统核心已启动 / System initialized',
      status: 'success'
  }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tools (Plugins) State
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AIModelConfig>({
      modelId: 'gemini-2.5-flash',
      temperature: 0.4,
      enableThinking: false,
      thinkingBudget: 0
  });

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  // Refs for async access in loops
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // Logging
  const addLog = useCallback((action: string, status: LogEntry['status'] = 'info') => {
    setLogs(prev => [{ id: uuid(), timestamp: new Date(), action, status }, ...prev].slice(200));
  }, []);

  // --- Core Graph Operations ---
  
  const deleteNodes = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;
    
    setNodes(prev => prev.filter(n => !nodeIds.includes(n.id)));
    setConnections(prev => prev.filter(c => !nodeIds.includes(c.sourceId) && !nodeIds.includes(c.targetId)));
    setSelectedNodeIds([]);
    addLog(`删除了 ${nodeIds.length} 个实体`, 'warning');
    setContextMenu(null);
  }, [addLog]);

  // Keyboard listener for deletion
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          const target = e.target as HTMLElement;
          if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

          if (e.key === 'Delete' || e.key === 'Backspace') {
              if (selectedNodeIds.length > 0) {
                  deleteNodes(selectedNodeIds);
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, deleteNodes]);

  // --- Layout Engine ---
  const performAutoLayout = useCallback(() => {
      setNodes(currentNodes => {
          if (currentNodes.length === 0) return currentNodes;

          const COLUMN_WIDTH = 350;
          const ROW_HEIGHT = 180;
          const BASE_X = 100;
          const BASE_Y = 100;

          const depthMap: Record<number, IntelNode[]> = {};
          currentNodes.forEach(node => {
              const d = node.depth || 0;
              if (!depthMap[d]) depthMap[d] = [];
              depthMap[d].push(node);
          });

          const newNodes = [...currentNodes];
          
          Object.keys(depthMap).sort((a,b) => Number(a)-Number(b)).forEach(depthStr => {
              const depth = Number(depthStr);
              const nodesInLayer = depthMap[depth];
              
              nodesInLayer.forEach((node, idx) => {
                  const targetX = BASE_X + (depth * COLUMN_WIDTH);
                  const targetY = BASE_Y + (idx * ROW_HEIGHT);

                  const nIndex = newNodes.findIndex(n => n.id === node.id);
                  if (nIndex > -1) {
                      newNodes[nIndex] = {
                          ...newNodes[nIndex],
                          position: { x: targetX, y: targetY }
                      };
                  }
              });
          });

          addLog("自动布局已完成 / Auto-layout applied", 'info');
          return newNodes;
      });
  }, [addLog]);

  const addNode = useCallback((position: Position, type: NodeType, content: string = '待分析...', depth: number = 0) => {
    const defaultData = ENTITY_DEFAULT_FIELDS[type] ? { ...ENTITY_DEFAULT_FIELDS[type] } : {};

    const newNode: IntelNode = {
      id: uuid(),
      type,
      title: `新 ${type}`,
      content: content,
      position,
      data: defaultData,
      rating: { reliability: 'C', credibility: '3' },
      status: 'NEW',
      depth: depth
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeIds([newNode.id]);
    addLog(`创建了新节点: ${type}`, 'info');
  }, [addLog]);

  const updateNode = useCallback((id: string, data: Partial<IntelNode>) => {
      setNodes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  }, []);

  const setNodeStatus = (ids: string[], status: IntelNode['status']) => {
    setNodes(prev => prev.map(n => ids.includes(n.id) ? { ...n, status } : n));
  };

  const handleConnect = useCallback((sourceId: string, targetId: string) => {
    setConnections(prev => [...prev, { id: uuid(), sourceId, targetId }]);
    addLog('创建了新的手动连接', 'info');
  }, [addLog]);

  const handleMoveNodes = useCallback((delta: Position) => {
    setNodes(prev => prev.map(node => {
      if (selectedNodeIds.includes(node.id)) {
        return { ...node, position: { x: node.position.x + delta.x, y: node.position.y + delta.y } };
      }
      return node;
    }));
  }, [selectedNodeIds]);

  const handleSelectionChange = useCallback((ids: string[]) => {
      setSelectedNodeIds(ids);
      if (ids.length === 1) {
          const node = nodesRef.current.find(n => n.id === ids[0]);
          if(node) addLog(`选中实体: ${node.title} (${node.type})`, 'info');
      }
  }, [addLog]);

  const handleUpdateAiConfig = useCallback((config: AIModelConfig) => {
      setAiConfig(config);
      if (config.modelId !== aiConfig.modelId) addLog(`切换 AI 模型至: ${config.modelId}`, 'warning');
      if (config.enableThinking !== aiConfig.enableThinking) addLog(`AI 思考模式: ${config.enableThinking ? 'ENABLED' : 'DISABLED'}`, 'warning');
      if (config.temperature !== aiConfig.temperature) addLog(`AI 温度调整: ${config.temperature}`, 'info');
  }, [aiConfig, addLog]);

  // --- Data Import Logic ---
  const handleImportData = async (fileContent: string, type: 'json' | 'text') => {
    try {
      if (type === 'json') {
         const importedData = JSON.parse(fileContent);
         if (Array.isArray(importedData.nodes)) {
            const enhancedNodes = importedData.nodes.map((n: any) => ({
                ...n,
                id: uuid(),
                data: { ...ENTITY_DEFAULT_FIELDS[n.type as NodeType], ...n.data } 
            }));
            setNodes(prev => [...prev, ...enhancedNodes]);
            addLog(`成功导入 ${enhancedNodes.length} 个节点`, 'success');
         } else {
             addLog('JSON 格式错误: 缺少 nodes 数组', 'error');
         }
      } else {
         addNode({ x: 200, y: 200 }, NodeType.DOCUMENT, fileContent, 0);
         addLog('文本已导入为 [DOCUMENT] 节点', 'success');
      }
    } catch (e) {
      addLog(`导入失败: ${e}`, 'error');
    }
  };

  // --- Analysis Engine ---

  const runToolOnNode = async (tool: Tool, node: IntelNode): Promise<IntelNode[]> => {
     setNodeStatus([node.id], 'PROCESSING'); 
     addLog(`开始执行任务 [${tool.name}] 目标: ${node.title}...`, 'info');
     
     try {
        // Pass aiConfig to the service execution
        const result = await executeTool(tool, node, nodesRef.current, aiConfig);
        
        if (result.updateData) {
            updateNode(node.id, { 
                data: { ...node.data, ...result.updateData },
                status: 'PROCESSED'
            });
        } else {
            setNodeStatus([node.id], 'PROCESSED');
        }

        if (result.newNodes.length > 0) {
            const enhancedNewNodes = result.newNodes.map((n, idx) => ({
                ...n,
                depth: node.depth + 1,
                position: { 
                    x: node.position.x + 350, 
                    y: node.position.y + (idx * 150) 
                }
            }));

            setNodes(prev => [...prev, ...enhancedNewNodes]);
            setConnections(prev => [...prev, ...result.newConnections]);
            addLog(`[${tool.name}] 完成: 发现 ${result.newNodes.length} 个新线索`, 'success');
            
            return enhancedNewNodes;
        } else {
            addLog(`[${tool.name}] 完成: 无新增实体，仅更新属性`, 'success');
            return [];
        }
     } catch (e) {
        addLog(`插件执行失败 [${tool.name}]: ${e}`, 'error');
        setNodeStatus([node.id], 'ERROR');
        return [];
     }
  };

  const handleRunTool = async (tool: Tool, targetNodes: IntelNode[]) => {
    setIsProcessing(true);
    setContextMenu(null);
    
    for (const node of targetNodes) {
        await runToolOnNode(tool, node);
    }
    setTimeout(performAutoLayout, 100);
    setIsProcessing(false);
  };

  const handleSaveTool = (newTool: Tool) => {
      setTools(prev => [...prev, newTool]);
      addLog(`新自定义插件已保存: ${newTool.name}`, 'success');
  };

  const handleNodeContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
     const node = nodes.find(n => n.id === nodeId);
     if (node) {
         setContextMenu({
             x: e.clientX,
             y: e.clientY,
             nodeId: nodeId
         });
     }
  }, [nodes]);

  const handleSearch = (term: string) => {
      setSearchTerm(term);
      // Optional: Log search if needed, but avoiding spam
  };

  return (
    <div className="flex h-screen w-screen bg-[#0B0F19] text-slate-200 font-sans overflow-hidden">
       {/* Header Overlay */}
       <div className="absolute top-4 left-4 z-30 flex items-center gap-4">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-4 py-2 rounded shadow-lg flex flex-col">
             <span className="font-bold text-slate-100 tracking-[0.2em] text-sm">NEXUS OSINT</span>
             <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] text-slate-400 font-mono">INTELLIGENCE WORKSTATION</span>
             </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded shadow-lg flex items-center h-[50px] w-[300px] px-3 focus-within:border-cyan-500 transition-colors">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input 
                  className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full"
                  placeholder="全局指令 / 搜索实体..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onBlur={() => { if(searchTerm) addLog(`执行全局搜索: "${searchTerm}"`, 'info') }}
              />
          </div>
       </div>

       {/* Canvas */}
       <div className="flex-1 relative">
          <Canvas
            nodes={nodes}
            connections={connections}
            selectedNodeIds={selectedNodeIds}
            onSelectionChange={handleSelectionChange}
            onNodesMove={handleMoveNodes}
            onConnect={handleConnect}
            onAddNode={(pos, type) => addNode(pos, type, '手动创建', 0)}
            onNodeContextMenu={handleNodeContextMenu}
            searchTerm={searchTerm}
          />
          
          {contextMenu && (() => {
              const node = nodes.find(n => n.id === contextMenu.nodeId);
              if (!node) return null;
              
              const availableTools = tools.filter(t => 
                t.targetTypes.length === 0 || t.targetTypes.includes(node.type)
              );

              return (
                  <ContextMenu 
                    x={contextMenu.x}
                    y={contextMenu.y}
                    node={node}
                    availableTools={availableTools}
                    onRunTool={(tool) => handleRunTool(tool, [node])}
                    onDelete={() => deleteNodes([node.id])}
                    onClose={() => setContextMenu(null)}
                  />
              )
          })()}
       </div>

       {/* Right Sidebar */}
       <ControlPanel 
         selectedNodes={nodes.filter(n => selectedNodeIds.includes(n.id))}
         allNodes={nodes}
         allTools={tools}
         logs={logs}
         onRunTool={handleRunTool}
         onSaveTool={handleSaveTool}
         onUpdateNode={updateNode}
         onAddNode={(type) => addNode({x: 100, y: 100 + (nodes.length * 100)}, type, '新实体', 0)}
         onDeleteNode={deleteNodes}
         onImportData={handleImportData}
         onSelectNode={(id) => handleSelectionChange([id])}
         isProcessing={isProcessing}
         onAutoLayout={performAutoLayout}
         aiConfig={aiConfig}
         onUpdateAiConfig={handleUpdateAiConfig}
         onLog={addLog}
       />
    </div>
  );
};

export default App;
