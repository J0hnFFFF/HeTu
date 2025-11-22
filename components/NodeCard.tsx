

import React from 'react';
import { IntelNode, NodeType } from '../types';
import { 
  User, Globe, Image as ImageIcon, FileText, 
  Link2, Network, Server, MapPin, Hash, Database, AtSign, Loader2,
  Building2, Car, Video, Mic, MessageSquare, File, Paperclip, Music,
  Bug, ShieldAlert, Search, DatabaseZap, Radio, Archive, Scan,
  Ghost, Fingerprint, Cloud, Wifi, CreditCard, Smartphone, Tablet, 
  Sword, Cpu, Newspaper, Code, Calendar, Flag, Lightbulb, Gavel, Lock,
  Landmark, Bitcoin, Activity, AppWindow, Users, Ear, Satellite, ScanFace,
  Plane, BedDouble, Ship, IdCard, Ticket, Tent, Bomb, Fish, Router
} from 'lucide-react';

interface NodeCardProps {
  node: IntelNode;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onStartConnect: (e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ 
  node, isSelected, onPointerDown, onStartConnect, onContextMenu 
}) => {
  
  const getIcon = () => {
    switch (node.type) {
      // 1. SUBJECTS
      case NodeType.ENTITY: return <User className="w-4 h-4 text-cyan-400" />;
      case NodeType.ORGANIZATION: return <Building2 className="w-4 h-4 text-orange-400" />;
      case NodeType.THREAT_ACTOR: return <Ghost className="w-4 h-4 text-red-500" />;
      case NodeType.IDENTITY: return <Fingerprint className="w-4 h-4 text-purple-400" />;
      case NodeType.MILITARY_UNIT: return <Tent className="w-4 h-4 text-green-600" />;
      case NodeType.GOV_AGENCY: return <Landmark className="w-4 h-4 text-yellow-500" />;

      // 2. NETWORK
      case NodeType.IP_ADDRESS: return <Server className="w-4 h-4 text-emerald-400" />;
      case NodeType.MAC_ADDRESS: return <Network className="w-4 h-4 text-indigo-300" />;
      case NodeType.DOMAIN: return <Globe className="w-4 h-4 text-blue-400" />;
      case NodeType.URL: return <Link2 className="w-4 h-4 text-blue-300" />;
      case NodeType.SERVER: return <Database className="w-4 h-4 text-slate-300" />;
      case NodeType.C2_SERVER: return <Router className="w-4 h-4 text-red-500" />;
      case NodeType.BOTNET: return <Network className="w-4 h-4 text-red-400" />;
      case NodeType.CLOUD_SERVICE: return <Cloud className="w-4 h-4 text-sky-300" />;
      case NodeType.WIFI: return <Wifi className="w-4 h-4 text-amber-400" />;
      case NodeType.SSL_CERT: return <Lock className="w-4 h-4 text-yellow-200" />;
      case NodeType.ASN: return <Network className="w-4 h-4 text-indigo-400" />;

      // 3. COMMUNICATION
      case NodeType.EMAIL: return <AtSign className="w-4 h-4 text-orange-300" />;
      case NodeType.PHONE_NUMBER: return <Smartphone className="w-4 h-4 text-green-400" />;
      case NodeType.SOCIAL_PROFILE: return <Users className="w-4 h-4 text-pink-400" />;
      case NodeType.MESSAGING_ID: return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case NodeType.FORUM_ACCOUNT: return <User className="w-4 h-4 text-slate-500" />;
      case NodeType.APP: return <AppWindow className="w-4 h-4 text-teal-400" />;

      // 4. FINANCIAL
      case NodeType.CRYPTO_WALLET: return <Bitcoin className="w-4 h-4 text-amber-500" />;
      case NodeType.BANK_ACCOUNT: return <Landmark className="w-4 h-4 text-emerald-600" />;
      case NodeType.CREDIT_CARD: return <CreditCard className="w-4 h-4 text-blue-500" />;
      case NodeType.TRANSACTION: return <Activity className="w-4 h-4 text-slate-400" />;

      // 5. PHYSICAL
      case NodeType.GEO_LOCATION: return <MapPin className="w-4 h-4 text-red-500" />;
      case NodeType.FACILITY: return <Building2 className="w-4 h-4 text-slate-400" />;
      case NodeType.VEHICLE: return <Car className="w-4 h-4 text-yellow-400" />;
      case NodeType.DEVICE: return <Tablet className="w-4 h-4 text-slate-300" />;
      case NodeType.WEAPON: return <Sword className="w-4 h-4 text-red-700" />;
      case NodeType.SIM_CARD: return <Cpu className="w-4 h-4 text-yellow-600" />;

      // 6. TRAVEL & LOGISTICS (NEW)
      case NodeType.FLIGHT: return <Plane className="w-4 h-4 text-sky-400" />;
      case NodeType.HOTEL: return <BedDouble className="w-4 h-4 text-indigo-400" />;
      case NodeType.SHIPPING: return <Ship className="w-4 h-4 text-blue-600" />;
      case NodeType.PASSPORT: return <IdCard className="w-4 h-4 text-rose-400" />;
      case NodeType.VISA: return <Ticket className="w-4 h-4 text-rose-300" />;

      // 7. CONTENT & MEDIA
      case NodeType.IMAGE: return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case NodeType.VIDEO: return <Video className="w-4 h-4 text-pink-400" />;
      case NodeType.AUDIO: return <Mic className="w-4 h-4 text-pink-400" />;
      case NodeType.DOCUMENT: return <File className="w-4 h-4 text-slate-300" />;
      case NodeType.SOCIAL_POST: return <MessageSquare className="w-4 h-4 text-blue-300" />;
      case NodeType.NEWS_ARTICLE: return <Newspaper className="w-4 h-4 text-slate-200" />;
      case NodeType.DARKWEB_SITE: return <div className="w-4 h-4 text-green-500 font-bold flex items-center justify-center">.o</div>;
      case NodeType.CODE_SNIPPET: return <Code className="w-4 h-4 text-yellow-300" />;
      case NodeType.FILE_HASH: return <Hash className="w-4 h-4 text-slate-500" />;
      case NodeType.EXPLOIT: return <Bomb className="w-4 h-4 text-red-600" />;
      case NodeType.PHISHING_KIT: return <Fish className="w-4 h-4 text-orange-500" />;

      // 8. INTELLIGENCE COLLECTION (NEW)
      case NodeType.SOURCE_HUMINT: return <User className="w-4 h-4 text-orange-500" />;
      case NodeType.SOURCE_SIGINT: return <Radio className="w-4 h-4 text-green-500" />;
      case NodeType.SOURCE_IMINT: return <Satellite className="w-4 h-4 text-blue-300" />;
      case NodeType.SOURCE_GEOINT: return <MapPin className="w-4 h-4 text-emerald-500" />;
      case NodeType.SOURCE_OSINT: return <Globe className="w-4 h-4 text-cyan-300" />;
      case NodeType.SOURCE_MASINT: return <Activity className="w-4 h-4 text-purple-500" />;

      // 9. INTEL & ANALYSIS
      case NodeType.REPORT: return <FileText className="w-4 h-4 text-yellow-400" />;
      case NodeType.NOTE: return <FileText className="w-4 h-4 text-slate-400" />;
      case NodeType.EVENT: return <Calendar className="w-4 h-4 text-orange-500" />;
      case NodeType.CAMPAIGN: return <Flag className="w-4 h-4 text-red-500" />;
      case NodeType.MALWARE: return <Bug className="w-4 h-4 text-red-600" />;
      case NodeType.VULNERABILITY: return <ShieldAlert className="w-4 h-4 text-orange-600" />;
      case NodeType.TOPIC: return <Hash className="w-4 h-4 text-pink-500" />;
      case NodeType.HYPOTHESIS: return <Lightbulb className="w-4 h-4 text-yellow-300" />;
      case NodeType.LEGAL_CASE: return <Gavel className="w-4 h-4 text-slate-200" />;

      // 10. OPS
      case NodeType.SEARCH_QUERY: return <Search className="w-4 h-4 text-teal-400" />;
      case NodeType.DATA_SOURCE: return <DatabaseZap className="w-4 h-4 text-indigo-400" />;
      case NodeType.LEAK_DUMP: return <Archive className="w-4 h-4 text-amber-600" />;
      case NodeType.SENSOR: return <Radio className="w-4 h-4 text-green-500" />;

      default: return <Hash className="w-4 h-4 text-slate-400" />;
    }
  };

  const isProcessing = node.status === 'PROCESSING';

  const borderColor = isSelected 
    ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-1 ring-cyan-500' 
    : isProcessing
        ? 'border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse'
        : 'border-slate-700 hover:border-slate-500';

  // Status indicator color
  const getStatusColor = () => {
      if (node.status === 'NEW') return 'bg-blue-500';
      if (node.status === 'PROCESSED') return 'bg-green-500';
      if (node.status === 'ERROR') return 'bg-red-500';
      if (node.status === 'PROCESSING') return 'bg-cyan-400 animate-ping';
      return 'bg-slate-600';
  }

  // Filter out empty values for preview
  const populatedData = Object.entries(node.data || {}).filter(([_, v]) => String(v).trim() !== "");

  return (
    <div
      data-node-id={node.id}
      className={`absolute rounded-lg bg-[#161b26]/95 border ${borderColor} text-slate-200 flex flex-col transition-all duration-200`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: 280, // Slightly wider for media
        zIndex: isSelected ? 100 : 10,
        backdropFilter: 'blur(8px)',
        touchAction: 'none'
      }}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
    >
      {/* Connection Point */}
      <div 
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 hover:bg-cyan-600 border border-slate-600 rounded-full flex items-center justify-center cursor-crosshair opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all z-50 shadow-lg"
        onPointerDown={onStartConnect}
      >
         <Link2 className="w-3 h-3 text-white" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-800/50">
        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 relative">
           {isProcessing ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" /> : getIcon()}
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
               <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`}></div>
               {isProcessing ? 'PROCESSING...' : node.type}
            </div>
            <div className="font-bold text-xs truncate text-white font-mono" title={node.title}>
               {node.title}
            </div>
        </div>
      </div>

      {/* Data Preview Body */}
      <div className="p-3 space-y-2">
         {/* Summary Text */}
         <div className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
            {node.content}
         </div>
         
         {/* Key Data Points Preview (Only shown if populated) */}
         {populatedData.length > 0 && (
            <div className="bg-black/20 rounded p-2 border border-white/5 space-y-1">
                {populatedData.slice(0, 3).map(([k, v]) => {
                   const strVal = String(v);
                   const isFile = strVal.startsWith('data:');
                   const isImage = strVal.startsWith('data:image');
                   const isVideo = strVal.startsWith('data:video');
                   const isAudio = strVal.startsWith('data:audio');
                   
                   if (isFile) {
                       return (
                           <div key={k} className="flex flex-col text-[9px] font-mono mt-2 mb-1">
                               <div className="flex items-center justify-between text-slate-500 mb-1">
                                  <span>{k}:</span>
                                  {isImage && <ImageIcon className="w-3 h-3" />}
                                  {isVideo && <Video className="w-3 h-3" />}
                                  {isAudio && <Music className="w-3 h-3" />}
                               </div>
                               
                               {isImage ? (
                                   <img src={strVal} className="w-full h-32 object-cover rounded border border-slate-700" alt="evidence" />
                               ) : isVideo ? (
                                   <video controls muted className="w-full rounded border border-slate-700 bg-black" src={strVal} />
                               ) : isAudio ? (
                                   <audio controls className="w-full h-6 mt-1" src={strVal} />
                               ) : (
                                   <div className="flex items-center gap-1 text-cyan-500 p-1 bg-slate-900 rounded border border-slate-800">
                                       <Paperclip className="w-3 h-3" /> <span className="italic">Binary File</span>
                                   </div>
                               )}
                           </div>
                       )
                   }

                   return (
                        <div key={k} className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500">{k}:</span>
                            <span className="text-cyan-600 truncate max-w-[140px]">{strVal}</span>
                        </div>
                   );
                })}
            </div>
         )}
      </div>

      {/* Footer / Rating */}
      {node.rating && (
        <div className="px-3 py-1.5 border-t border-slate-800/50 bg-black/20 flex justify-between items-center">
           <span className="text-[9px] text-slate-600">Source Rating</span>
           <span className={`text-[9px] font-mono px-1 rounded border ${
               node.rating.reliability === 'A' ? 'border-green-800 text-green-400 bg-green-900/20' : 'border-slate-700 text-slate-400'
           }`}>
               {node.rating.reliability}{node.rating.credibility}
           </span>
        </div>
      )}
    </div>
  );
};