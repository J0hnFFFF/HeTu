import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { X, Layers, Clock, MapPin } from 'lucide-react';
import { IntelNode } from '../types';

// Custom marker icon
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 轨迹点数据结构
interface TrajectoryPoint {
  nodeId: string;
  title: string;
  type: string;
  lat: number;
  lng: number;
  time?: string;
  sortTime?: number; // 用于排序的时间戳
}

interface TrajectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetNode: IntelNode;
  trajectoryPoints: TrajectoryPoint[];
}

// 解析时间字段，尝试提取可排序的时间
const parseTime = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const date = new Date(timeStr);
  if (!isNaN(date.getTime())) return date.getTime();
  // 尝试匹配常见格式如 "2024-01-15" 或 "2024/01/15"
  const match = timeStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
  }
  return null;
};

// 图层切换组件
const LayerControl: React.FC<{ onLayerChange: (layer: 'street' | 'satellite') => void; currentLayer: string }> = ({
  onLayerChange,
  currentLayer
}) => {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
      <button
        onClick={() => onLayerChange('street')}
        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
          currentLayer === 'street'
            ? 'bg-cyan-600 text-white'
            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
        }`}
      >
        <Layers className="w-3 h-3" />
        街道
      </button>
      <button
        onClick={() => onLayerChange('satellite')}
        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
          currentLayer === 'satellite'
            ? 'bg-cyan-600 text-white'
            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
        }`}
      >
        <Layers className="w-3 h-3" />
        卫星
      </button>
    </div>
  );
};

export const TrajectoryModal: React.FC<TrajectoryModalProps> = ({
  isOpen,
  onClose,
  targetNode,
  trajectoryPoints
}) => {
  const [layer, setLayer] = useState<'street' | 'satellite'>('street');

  // 按时间排序轨迹点
  const sortedPoints = useMemo(() => {
    return [...trajectoryPoints].sort((a, b) => {
      if (a.sortTime && b.sortTime) return a.sortTime - b.sortTime;
      if (a.sortTime) return -1;
      if (b.sortTime) return 1;
      return 0;
    });
  }, [trajectoryPoints]);

  // 计算地图中心和边界
  const mapCenter = useMemo(() => {
    if (sortedPoints.length === 0) return { lat: 39.9, lng: 116.4 };
    const avgLat = sortedPoints.reduce((sum, p) => sum + p.lat, 0) / sortedPoints.length;
    const avgLng = sortedPoints.reduce((sum, p) => sum + p.lng, 0) / sortedPoints.length;
    return { lat: avgLat, lng: avgLng };
  }, [sortedPoints]);

  // 生成轨迹线坐标
  const polylinePositions = useMemo(() => {
    return sortedPoints.map(p => [p.lat, p.lng] as [number, number]);
  }, [sortedPoints]);

  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const streetUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="bg-[#161b26] border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500" />
              <span className="font-bold text-white">时空轨迹分析</span>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {targetNode.title}
            </span>
            <span className="text-xs text-slate-500">
              {sortedPoints.length} 个轨迹点
            </span>
          </div>
          <button
            onClick={handleClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative" style={{ minHeight: '400px' }}>
            {sortedPoints.length > 0 ? (
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={sortedPoints.length === 1 ? 13 : 10}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  key={layer}
                  url={layer === 'street' ? streetUrl : satelliteUrl}
                />

                {/* 轨迹线 */}
                {polylinePositions.length > 1 && (
                  <Polyline
                    positions={polylinePositions}
                    color="#06b6d4"
                    weight={3}
                    opacity={0.8}
                    dashArray="10, 5"
                  />
                )}

                {/* 轨迹点标记 */}
                {sortedPoints.map((point, index) => (
                  <Marker key={point.nodeId} position={[point.lat, point.lng]} icon={markerIcon}>
                    <Popup>
                      <div className="text-sm min-w-[150px]">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="bg-cyan-100 text-cyan-700 text-[10px] px-1 rounded">
                            #{index + 1}
                          </span>
                          <strong>{point.title}</strong>
                        </div>
                        <p className="text-xs text-slate-500">{point.type}</p>
                        {point.time && (
                          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {point.time}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>未找到关联的地理位置数据</p>
                  <p className="text-xs mt-1">请确保关联节点包含「经纬度」字段</p>
                </div>
              </div>
            )}

            {sortedPoints.length > 0 && (
              <LayerControl onLayerChange={setLayer} currentLayer={layer} />
            )}
          </div>

          {/* Timeline Sidebar */}
          <div className="w-64 border-l border-slate-700 bg-slate-900/50 flex flex-col">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-400 uppercase">时间轴</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sortedPoints.length > 0 ? (
                sortedPoints.map((point, index) => (
                  <div
                    key={point.nodeId}
                    className="bg-slate-800/50 rounded p-2 border border-slate-700/50 hover:border-cyan-800 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="bg-cyan-900/50 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate" title={point.title}>
                          {point.title}
                        </p>
                        <p className="text-[10px] text-slate-500">{point.type}</p>
                        {point.time && (
                          <p className="text-[10px] text-cyan-600 mt-1">{point.time}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-600 text-xs py-4">
                  暂无轨迹数据
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-700 bg-black/20 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            轨迹线按时间顺序连接（虚线表示）
          </span>
          <span className="text-[10px] text-slate-500">
            点击标记查看详情
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// 工具函数：从节点和连接中提取轨迹点
export const extractTrajectoryPoints = (
  targetNode: IntelNode,
  allNodes: IntelNode[],
  connections: { sourceId: string; targetId: string }[]
): TrajectoryPoint[] => {
  const points: TrajectoryPoint[] = [];
  const coordinateFields = ['经纬度', '坐标', 'coordinates', 'latlng'];
  const timeFields = ['时间', '日期', '入住日期', '起飞时间', '发生时间', 'time', 'date', 'datetime'];

  // 解析坐标
  const parseCoords = (value: string): { lat: number; lng: number } | null => {
    if (!value || typeof value !== 'string') return null;
    const match = value.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (!match) return null;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  };

  // 获取关联的节点 ID
  const relatedNodeIds = new Set<string>();
  connections.forEach(conn => {
    if (conn.sourceId === targetNode.id) relatedNodeIds.add(conn.targetId);
    if (conn.targetId === targetNode.id) relatedNodeIds.add(conn.sourceId);
  });

  // 处理关联节点
  allNodes.forEach(node => {
    if (!relatedNodeIds.has(node.id)) return;

    // 查找坐标字段
    let coords: { lat: number; lng: number } | null = null;
    for (const field of coordinateFields) {
      const value = node.data?.[field];
      if (value) {
        coords = parseCoords(String(value));
        if (coords) break;
      }
    }

    if (!coords) return;

    // 查找时间字段
    let timeStr: string | undefined;
    let sortTime: number | undefined;
    for (const field of timeFields) {
      const value = node.data?.[field];
      if (value) {
        timeStr = String(value);
        const parsed = parseTime(timeStr);
        if (parsed) sortTime = parsed;
        break;
      }
    }

    points.push({
      nodeId: node.id,
      title: node.title,
      type: node.type,
      lat: coords.lat,
      lng: coords.lng,
      time: timeStr,
      sortTime
    });
  });

  return points;
};
