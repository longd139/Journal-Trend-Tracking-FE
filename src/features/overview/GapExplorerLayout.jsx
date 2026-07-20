import { useState, useCallback, useEffect, useRef } from 'react';
import GapNeo4jGraph from './GapNeo4jGraph';
import MCPChatbot from './MCPChatbot';
import GapAnalysisPanel from './GapAnalysisPanel';
import useGapExplorerStore from '../../store/useGapExplorerStore';

const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 360;

/**
 * Main layout for the Research Gap Explorer.
 * Left: Neo4j Graph (flex-1)
 * Right: MCP Chatbot (Stage 1-2) or Gap Analysis Panel (Stage 3)
 * A draggable handle between them allows resizing the right panel.
 */
export default function GapExplorerLayout() {
  const stage = useGapExplorerStore((s) => s.stage);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth.current + delta));
      setPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left: Neo4j Graph */}
      <GapNeo4jGraph />

      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className="w-1.5 shrink-0 bg-[#DEDBC8]/5 hover:bg-[#4F8CFF]/30 cursor-col-resize transition-colors relative group"
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-[#DEDBC8]/0 group-hover:bg-[#DEDBC8]/20 transition-colors" />
      </div>

      {/* Right: Chatbot or Analysis Panel (resizable) */}
      <div style={{ width: panelWidth }} className="shrink-0">
        {stage === 'focused' ? <GapAnalysisPanel /> : <MCPChatbot />}
      </div>
    </div>
  );
}
