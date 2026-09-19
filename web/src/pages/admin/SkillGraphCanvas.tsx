import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Layers,
  Compass,
  Zap,
  Target
} from 'lucide-react';

export interface GraphSkill {
  id: string;
  name: string;
  slug: string;
  category?: string;
  categoryId?: string;
  description?: string;
  topicCount?: number;
}

export interface GraphCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder?: number;
}

export interface GraphRelationship {
  id: string;
  sourceSkillId: string;
  targetSkillId: string;
  relationshipType: 'PREREQUISITE' | 'RELATED';
}

interface NodePosition {
  id: string;
  name: string;
  slug: string;
  type: 'SKILL' | 'CLUSTER';
  categoryId?: string;
  categoryName: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  topicCount?: number;
  questionCount?: number;
}

interface EdgeConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'PREREQUISITE' | 'RELATED' | 'DOMAIN';
}

interface SkillGraphCanvasProps {
  skills: GraphSkill[];
  categories: GraphCategory[];
  onOpenExtractor?: (skillId: string, skillName: string) => void;
  onInspectSkill?: (skill: GraphSkill) => void;
  height?: string | number;
}

const DOMAIN_PALETTES: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  programming: { bg: '#eff6ff', border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', text: '#1d4ed8' },
  frontend: { bg: '#ecfeff', border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: '#0e7490' },
  backend: { bg: '#f5f3ff', border: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', text: '#6d28d9' },
  database: { bg: '#eef2ff', border: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', text: '#4338ca' },
  cloud: { bg: '#f0fdfa', border: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)', text: '#0f766e' },
  devops: { bg: '#fffbeb', border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: '#b45309' },
  ai_ml: { bg: '#ecfdf5', border: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#047857' },
  'ai-machine-learning': { bg: '#ecfdf5', border: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#047857' },
  data_science: { bg: '#f0fdf4', border: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', text: '#15803d' },
  cybersecurity: { bg: '#fef2f2', border: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', text: '#b91c1c' },
  mobile: { bg: '#faf5ff', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#7e22ce' },
  'ui-ux': { bg: '#fdf2f8', border: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', text: '#be185d' },
  ui_ux: { bg: '#fdf2f8', border: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', text: '#be185d' },
  software_engineering: { bg: '#f8fafc', border: '#64748b', glow: 'rgba(100, 116, 139, 0.4)', text: '#334155' },
  default: { bg: '#f8fafc', border: '#1c2d81', glow: 'rgba(28, 45, 129, 0.4)', text: '#1c2d81' },
};

function getDomainPalette(slug: string = '') {
  const clean = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return DOMAIN_PALETTES[clean] || DOMAIN_PALETTES.default;
}

export function SkillGraphCanvas({
  skills,
  categories,
  onOpenExtractor,
  onInspectSkill,
  height = '680px'
}: SkillGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [relationships, setRelationships] = useState<GraphRelationship[]>([]);
  const [, setLoadingRel] = useState(true);

  // Canvas Viewport Transformation
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filtering & Interaction States
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [connectionFilter, setConnectionFilter] = useState<'ALL' | 'PREREQUISITE' | 'RELATED' | 'DOMAIN'>('ALL');
  const [layoutMode, setLayoutMode] = useState<'ORBIT' | 'HIERARCHY' | 'GRID'>('ORBIT');

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Custom node positions (allows user dragging)
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Fetch all relationships from backend
  useEffect(() => {
    let isMounted = true;
    setLoadingRel(true);
    fetch('/api/v1/taxonomy/relationships')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (isMounted) {
          setRelationships(data.data || []);
        }
      })
      .catch(() => {
        // Fallback: Empty array
      })
      .finally(() => {
        if (isMounted) setLoadingRel(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, GraphCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const skillMap = useMemo(() => {
    const map = new Map<string, GraphSkill>();
    skills.forEach((s) => map.set(s.id, s));
    return map;
  }, [skills]);

  // Compute Base Positions based on selected Layout Mode
  const computedNodes = useMemo(() => {
    const nodes: NodePosition[] = [];
    const width = 1600;
    const heightBound = 1100;
    const centerX = width / 2;
    const centerY = heightBound / 2;

    // Filter categories that have skills
    const activeCats = categories.filter((cat) => skills.some((s) => s.categoryId === cat.id));
    const catCount = Math.max(activeCats.length, 1);

    if (layoutMode === 'ORBIT') {
      // Clustered Radial Orbit Layout
      activeCats.forEach((cat, catIdx) => {
        const catAngle = (catIdx / catCount) * 2 * Math.PI - Math.PI / 2;
        const orbitRadius = 420;
        const catX = centerX + orbitRadius * Math.cos(catAngle);
        const catY = centerY + orbitRadius * Math.sin(catAngle);

        const palette = getDomainPalette(cat.slug);

        // Domain Hub Node
        nodes.push({
          id: `cat-${cat.id}`,
          name: cat.name,
          slug: cat.slug,
          type: 'CLUSTER',
          categoryId: cat.id,
          categoryName: cat.name,
          x: customPositions[`cat-${cat.id}`]?.x ?? catX,
          y: customPositions[`cat-${cat.id}`]?.y ?? catY,
          radius: 34,
          color: palette.border,
        });

        // Child skills of this domain
        const catSkills = skills.filter((s) => s.categoryId === cat.id);
        const skillRadiusSpread = 140;
        catSkills.forEach((skill, sIdx) => {
          const sAngle = (sIdx / Math.max(catSkills.length, 1)) * 2 * Math.PI;
          const sx = catX + skillRadiusSpread * Math.cos(sAngle);
          const sy = catY + skillRadiusSpread * Math.sin(sAngle);

          nodes.push({
            id: skill.id,
            name: skill.name,
            slug: skill.slug,
            type: 'SKILL',
            categoryId: cat.id,
            categoryName: cat.name,
            x: customPositions[skill.id]?.x ?? sx,
            y: customPositions[skill.id]?.y ?? sy,
            radius: 24,
            color: palette.border,
            topicCount: skill.topicCount || 3,
            questionCount: 312,
          });
        });
      });
    } else if (layoutMode === 'HIERARCHY') {
      // Left-to-Right Progression Hierarchy
      const cols = 5;
      const colWidth = width / (cols + 1);
      activeCats.forEach((cat, catIdx) => {
        const catSkills = skills.filter((s) => s.categoryId === cat.id);
        const rowY = 80 + catIdx * (heightBound / catCount);

        nodes.push({
          id: `cat-${cat.id}`,
          name: cat.name,
          slug: cat.slug,
          type: 'CLUSTER',
          categoryId: cat.id,
          categoryName: cat.name,
          x: customPositions[`cat-${cat.id}`]?.x ?? 120,
          y: customPositions[`cat-${cat.id}`]?.y ?? rowY,
          radius: 28,
          color: getDomainPalette(cat.slug).border,
        });

        catSkills.forEach((skill, sIdx) => {
          const col = 1 + (sIdx % (cols - 1));
          const sx = 120 + col * colWidth;
          const sy = rowY + (Math.floor(sIdx / (cols - 1)) * 48 - 24);

          nodes.push({
            id: skill.id,
            name: skill.name,
            slug: skill.slug,
            type: 'SKILL',
            categoryId: cat.id,
            categoryName: cat.name,
            x: customPositions[skill.id]?.x ?? sx,
            y: customPositions[skill.id]?.y ?? sy,
            radius: 22,
            color: getDomainPalette(cat.slug).border,
            topicCount: skill.topicCount || 3,
            questionCount: 312,
          });
        });
      });
    } else {
      // Clean Grid Matrix Layout
      const cols = 10;
      const cellWidth = 140;
      const cellHeight = 90;
      const offsetX = 100;
      const offsetY = 80;

      skills.forEach((skill, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cat = skill.categoryId ? categoryMap.get(skill.categoryId) : null;
        const palette = getDomainPalette(cat?.slug);

        nodes.push({
          id: skill.id,
          name: skill.name,
          slug: skill.slug,
          type: 'SKILL',
          categoryId: skill.categoryId,
          categoryName: cat ? cat.name : 'Competency',
          x: customPositions[skill.id]?.x ?? (offsetX + col * cellWidth),
          y: customPositions[skill.id]?.y ?? (offsetY + row * cellHeight),
          radius: 22,
          color: palette.border,
          topicCount: skill.topicCount || 3,
          questionCount: 312,
        });
      });
    }

    return nodes;
  }, [skills, categories, layoutMode, customPositions, categoryMap]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, NodePosition>();
    computedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [computedNodes]);

  // Build All Edge Connections
  const edges = useMemo(() => {
    const list: EdgeConnection[] = [];

    // 1. Prerequisite & Relational Edges from Database
    relationships.forEach((rel) => {
      if (nodeMap.has(rel.sourceSkillId) && nodeMap.has(rel.targetSkillId)) {
        list.push({
          id: rel.id,
          sourceId: rel.sourceSkillId,
          targetId: rel.targetSkillId,
          type: rel.relationshipType,
        });
      }
    });

    // 2. Domain Hierarchy Edges (Cluster Hub -> Skill)
    if (layoutMode !== 'GRID') {
      skills.forEach((s) => {
        if (s.categoryId) {
          const catNodeId = `cat-${s.categoryId}`;
          if (nodeMap.has(catNodeId) && nodeMap.has(s.id)) {
            list.push({
              id: `domain-${catNodeId}-${s.id}`,
              sourceId: catNodeId,
              targetId: s.id,
              type: 'DOMAIN',
            });
          }
        }
      });
    }

    return list;
  }, [relationships, nodeMap, skills, layoutMode]);

  // Connected Neighbors of the selected or hovered node
  const activeNeighborhood = useMemo(() => {
    const targetId = hoveredNodeId || selectedNodeId;
    if (!targetId) return null;

    const inPrereqs: string[] = [];
    const outDependents: string[] = [];
    const related: string[] = [];
    const domainLinks: string[] = [];

    edges.forEach((e) => {
      if (e.sourceId === targetId) {
        if (e.type === 'PREREQUISITE') outDependents.push(e.targetId);
        else if (e.type === 'RELATED') related.push(e.targetId);
        else if (e.type === 'DOMAIN') domainLinks.push(e.targetId);
      }
      if (e.targetId === targetId) {
        if (e.type === 'PREREQUISITE') inPrereqs.push(e.sourceId);
        else if (e.type === 'RELATED') related.push(e.sourceId);
        else if (e.type === 'DOMAIN') domainLinks.push(e.sourceId);
      }
    });

    const allConnected = new Set([targetId, ...inPrereqs, ...outDependents, ...related, ...domainLinks]);

    return {
      centerId: targetId,
      inPrereqs,
      outDependents,
      related,
      domainLinks,
      allConnected,
    };
  }, [hoveredNodeId, selectedNodeId, edges]);

  // Filtered nodes and edges based on HUD selection
  const { visibleNodes, visibleEdges } = useMemo(() => {
    let filteredNodes = computedNodes;

    // Cluster filter
    if (selectedCluster !== 'ALL') {
      filteredNodes = filteredNodes.filter((n) => n.categoryId === selectedCluster);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filteredNodes = filteredNodes.filter((n) =>
        n.name.toLowerCase().includes(q) ||
        n.categoryName.toLowerCase().includes(q) ||
        n.slug.toLowerCase().includes(q)
      );
    }

    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));

    let filteredEdges = edges.filter(
      (e) => visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId)
    );

    if (connectionFilter === 'PREREQUISITE') {
      filteredEdges = filteredEdges.filter((e) => e.type === 'PREREQUISITE');
    } else if (connectionFilter === 'RELATED') {
      filteredEdges = filteredEdges.filter((e) => e.type === 'RELATED');
    } else if (connectionFilter === 'DOMAIN') {
      filteredEdges = filteredEdges.filter((e) => e.type === 'DOMAIN');
    }

    return { visibleNodes: filteredNodes, visibleEdges: filteredEdges };
  }, [computedNodes, edges, selectedCluster, search, connectionFilter]);

  // Selected Node Details for Inspector Drawer
  const inspectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodeMap.get(selectedNodeId);
    if (!node) return null;

    const skillObj = skillMap.get(selectedNodeId);

    const prereqNodes = (activeNeighborhood?.inPrereqs || [])
      .map((id) => nodeMap.get(id))
      .filter(Boolean) as NodePosition[];

    const dependentNodes = (activeNeighborhood?.outDependents || [])
      .map((id) => nodeMap.get(id))
      .filter(Boolean) as NodePosition[];

    const relatedNodes = (activeNeighborhood?.related || [])
      .map((id) => nodeMap.get(id))
      .filter(Boolean) as NodePosition[];

    return {
      node,
      skill: skillObj,
      prereqNodes,
      dependentNodes,
      relatedNodes,
    };
  }, [selectedNodeId, nodeMap, skillMap, activeNeighborhood]);

  // Pan and Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.25), 2.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;

      setCustomPositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: rawX - dragOffset.x,
          y: rawY - dragOffset.y,
        },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: NodePosition) => {
    e.stopPropagation();
    setDraggingNodeId(node.id);
    setDragOffset({ x: 0, y: 0 });
    setSelectedNodeId(node.id);
  };

  // Focus directly onto a specific node
  const handleFocusNode = useCallback((nodeId: string) => {
    const n = nodeMap.get(nodeId);
    if (!n || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const targetZoom = 1.15;
    const targetX = rect.width / 2 - n.x * targetZoom;
    const targetY = rect.height / 2 - n.y * targetZoom;

    setZoom(targetZoom);
    setPan({ x: targetX, y: targetY });
    setSelectedNodeId(nodeId);
  }, [nodeMap]);

  // Center Graph Viewport initially
  const handleResetView = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setZoom(0.68);
      setPan({ x: rect.width / 2 - 800 * 0.68, y: rect.height / 2 - 550 * 0.68 });
    }
  };

  useEffect(() => {
    handleResetView();
  }, [layoutMode]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        background: '#090d16',
        border: '1px solid #1e293b',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* HUD Top Control Bar */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          pointerEvents: 'none',
        }}
      >
        {/* Left HUD: Title & Search Spotlight */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #334155',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#f8fafc',
            }}
          >
            <Compass size={16} color="#fed601" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fed601' }}>
              TOPOLOGY CANVAS
            </span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', borderLeft: '1px solid #334155', paddingLeft: '10px' }}>
              {visibleNodes.length} Nodes • {visibleEdges.length} Edges
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={14} color="#94a3b8" style={{ marginLeft: '10px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Spotlight skill node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '7px 12px 7px 8px',
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none',
                width: '180px',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', paddingRight: '8px' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right HUD: Filter Dropdowns & Layout Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
          {/* Cluster Filter */}
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #334155',
              color: '#f8fafc',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL" style={{ background: '#0f172a' }}>All Technical Clusters ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Connection Type Filter */}
          <select
            value={connectionFilter}
            onChange={(e: any) => setConnectionFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #334155',
              color: '#38bdf8',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL" style={{ background: '#0f172a' }}>All Edge Links</option>
            <option value="PREREQUISITE" style={{ background: '#0f172a' }}>Prerequisites (Direct Flow)</option>
            <option value="RELATED" style={{ background: '#0f172a' }}>Relational Synergies</option>
            <option value="DOMAIN" style={{ background: '#0f172a' }}>Domain Hierarchy Only</option>
          </select>

          {/* Layout Mode Button Group */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid #334155',
            }}
          >
            <button
              type="button"
              onClick={() => setLayoutMode('ORBIT')}
              style={{
                padding: '6px 10px',
                background: layoutMode === 'ORBIT' ? '#1c2d81' : 'transparent',
                color: layoutMode === 'ORBIT' ? '#fed601' : '#94a3b8',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Radial Orbit
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('HIERARCHY')}
              style={{
                padding: '6px 10px',
                background: layoutMode === 'HIERARCHY' ? '#1c2d81' : 'transparent',
                color: layoutMode === 'HIERARCHY' ? '#fed601' : '#94a3b8',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderLeft: '1px solid #334155',
              }}
            >
              Hierarchical Flow
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('GRID')}
              style={{
                padding: '6px 10px',
                background: layoutMode === 'GRID' ? '#1c2d81' : 'transparent',
                color: layoutMode === 'GRID' ? '#fed601' : '#94a3b8',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderLeft: '1px solid #334155',
              }}
            >
              Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Floating Zoom & Canvas Controls (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: 18,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #334155',
          padding: '6px',
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z * 1.2, 2.5))}
          title="Zoom In"
          style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '6px', cursor: 'pointer' }}
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.25))}
          title="Zoom Out"
          style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '6px', cursor: 'pointer' }}
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          title="Reset View to Center"
          style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '6px', cursor: 'pointer' }}
        >
          <RefreshCw size={15} />
        </button>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title="Toggle Fullscreen"
          style={{ background: 'transparent', border: 'none', color: '#fed601', padding: '6px', cursor: 'pointer' }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Floating Legend (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          right: inspectedNode ? '410px' : '18px',
          transition: 'right 0.2s ease',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #334155',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.74rem',
          color: '#cbd5e1',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', background: '#10b981', display: 'inline-block' }} />
          <span>Prerequisite (Direct)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', background: '#f59e0b', borderBottom: '1px dashed #f59e0b', display: 'inline-block' }} />
          <span>Relational Synergy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '1px', background: '#64748b', display: 'inline-block' }} />
          <span>Domain Cluster</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
          <Zap size={12} color="#fed601" />
          <span>Drag nodes to re-layout</span>
        </div>
      </div>

      {/* Primary SVG Canvas */}
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            <circle cx="20" cy="20" r="0.8" fill="#334155" />
          </pattern>

          {/* Directional Arrow Markers */}
          <marker id="arrow-prereq" markerWidth="8" markerHeight="8" refX="16" refY="4" orient="auto">
            <polygon points="0 1, 8 4, 0 7" fill="#10b981" />
          </marker>
          <marker id="arrow-prereq-active" markerWidth="10" markerHeight="10" refX="18" refY="5" orient="auto">
            <polygon points="0 1, 10 5, 0 9" fill="#34d399" />
          </marker>
          <marker id="arrow-related" markerWidth="6" markerHeight="6" refX="14" refY="3" orient="auto">
            <polygon points="0 1, 6 3, 0 5" fill="#f59e0b" />
          </marker>
          <marker id="arrow-domain" markerWidth="5" markerHeight="5" refX="12" refY="2.5" orient="auto">
            <polygon points="0 1, 5 2.5, 0 4" fill="#64748b" />
          </marker>
        </defs>

        {/* Canvas Background */}
        <rect width="100%" height="100%" fill="url(#graph-grid)" />

        {/* Scaled & Panned Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edge Connection Lines */}
          <g>
            {visibleEdges.map((edge) => {
              const src = nodeMap.get(edge.sourceId);
              const tgt = nodeMap.get(edge.targetId);
              if (!src || !tgt) return null;

              const isConnectedToActive =
                activeNeighborhood &&
                (edge.sourceId === activeNeighborhood.centerId || edge.targetId === activeNeighborhood.centerId);

              const isPrereq = edge.type === 'PREREQUISITE';
              const isRelated = edge.type === 'RELATED';

              // Calculate curved path for organic look
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;
              const curvature = isPrereq ? 0.08 : 0.04;
              const cx = midX - dy * curvature;
              const cy = midY + dx * curvature;

              const strokeColor = isConnectedToActive
                ? (isPrereq ? '#34d399' : isRelated ? '#fbbf24' : '#94a3b8')
                : (isPrereq ? '#059669' : isRelated ? '#b45309' : '#334155');

              const strokeWidth = isConnectedToActive
                ? (isPrereq ? 2.8 : 2.2)
                : (isPrereq ? 1.5 : isRelated ? 1.2 : 0.8);

              const opacity = activeNeighborhood
                ? (isConnectedToActive ? 1.0 : 0.15)
                : (isPrereq ? 0.75 : isRelated ? 0.5 : 0.25);

              const marker = isPrereq
                ? (isConnectedToActive ? 'url(#arrow-prereq-active)' : 'url(#arrow-prereq)')
                : (isRelated ? 'url(#arrow-related)' : 'url(#arrow-domain)');

              return (
                <path
                  key={edge.id}
                  d={`M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isRelated ? '4 3' : undefined}
                  strokeOpacity={opacity}
                  markerEnd={marker}
                />
              );
            })}
          </g>

          {/* Nodes Rendering */}
          <g>
            {visibleNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isCenter = activeNeighborhood && activeNeighborhood.centerId === node.id;
              const isConnected = activeNeighborhood && activeNeighborhood.allConnected.has(node.id);

              const opacity = activeNeighborhood ? (isConnected ? 1.0 : 0.22) : 1.0;
              const isClusterHub = node.type === 'CLUSTER';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  opacity={opacity}
                  style={{ cursor: 'pointer', transition: draggingNodeId ? 'none' : 'opacity 0.2s ease' }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                >
                  {/* Halo Aura on Active or Selected Node */}
                  {(isSelected || isCenter) && (
                    <circle
                      r={node.radius + 10}
                      fill="none"
                      stroke="#fed601"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      opacity={0.9}
                    />
                  )}

                  {/* Node Body */}
                  {isClusterHub ? (
                    // Domain Cluster Hub (Hexagon / Square badge)
                    <g>
                      <rect
                        x={-node.radius}
                        y={-node.radius}
                        width={node.radius * 2}
                        height={node.radius * 2}
                        rx={6}
                        fill="#0f172a"
                        stroke={isSelected ? '#fed601' : node.color}
                        strokeWidth={isSelected ? 3 : 2}
                      />
                      <Layers
                        size={18}
                        color={isSelected ? '#fed601' : node.color}
                        style={{ transform: 'translate(-9px, -16px)' }}
                      />
                      <text
                        y={8}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="9px"
                        fontWeight="800"
                        letterSpacing="0.02em"
                      >
                        {node.name.length > 14 ? node.name.substring(0, 12) + '…' : node.name}
                      </text>
                      <text
                        y={19}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="7.5px"
                        fontWeight="700"
                      >
                        CLUSTER HUB
                      </text>
                    </g>
                  ) : (
                    // Competency Skill Node
                    <g>
                      <circle
                        r={node.radius}
                        fill="#0f172a"
                        stroke={isSelected ? '#fed601' : (isHovered ? '#38bdf8' : node.color)}
                        strokeWidth={isSelected ? 3 : (isHovered ? 2.5 : 1.8)}
                      />

                      {/* Top Skill Name */}
                      <text
                        y={-2}
                        textAnchor="middle"
                        fill={isSelected ? '#fed601' : '#f8fafc'}
                        fontSize="9.5px"
                        fontWeight="800"
                        letterSpacing="-0.01em"
                      >
                        {node.name.length > 12 ? node.name.substring(0, 10) + '…' : node.name}
                      </text>

                      {/* Question Count Pill */}
                      <g transform="translate(0, 9)">
                        <rect
                          x={-20}
                          y={-6}
                          width={40}
                          height={12}
                          rx={3}
                          fill="#1e293b"
                          stroke="#334155"
                          strokeWidth={0.5}
                        />
                        <text
                          y={2.5}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="7.5px"
                          fontWeight="700"
                        >
                          312 Qs
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Selected Node Inspection Drawer (Slideout Panel) */}
      {inspectedNode && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '390px',
            background: '#0f172a',
            borderLeft: '1px solid #334155',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: '#0a0f1d',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: '#1e293b',
                    color: inspectedNode.node.color,
                    border: `1px solid ${inspectedNode.node.color}`,
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                  }}
                >
                  {inspectedNode.node.categoryName}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: '#064e3b',
                    color: '#34d399',
                    border: '1px solid #059669',
                    padding: '2px 7px',
                  }}
                >
                  HIGH DEMAND
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                {inspectedNode.node.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
            {/* Description */}
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {inspectedNode.skill?.description || `${inspectedNode.node.name} competency node in the ${inspectedNode.node.categoryName} domain cluster.`}
            </p>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '12px', borderRadius: '3px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Question Bank
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fed601', marginTop: '4px' }}>
                  312 Questions
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '2px' }}>
                  52 in each of 6 levels
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '12px', borderRadius: '3px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Curriculum Depth
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                  {inspectedNode.node.topicCount || 3} Chapters
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  Interactive Lessons
                </div>
              </div>
            </div>

            {/* Inbound Prerequisites Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
                  Prerequisites Required ({inspectedNode.prereqNodes.length}):
                </h4>
              </div>

              {inspectedNode.prereqNodes.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                  Foundational entry point (no prior technical prerequisites required).
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {inspectedNode.prereqNodes.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleFocusNode(p.id)}
                      style={{
                        padding: '4px 10px',
                        background: '#064e3b',
                        border: '1px solid #059669',
                        color: '#a7f3d0',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderRadius: '2px',
                      }}
                    >
                      <Target size={11} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Outbound Dependents / Next Steps Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
                  Successor Competencies Enabled ({inspectedNode.dependentNodes.length}):
                </h4>
              </div>

              {inspectedNode.dependentNodes.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                  Terminal specialization node.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {inspectedNode.dependentNodes.map((dep) => (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => handleFocusNode(dep.id)}
                      style={{
                        padding: '4px 10px',
                        background: '#0c4a6e',
                        border: '1px solid #0284c7',
                        color: '#bae6fd',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderRadius: '2px',
                      }}
                    >
                      <span>{dep.name}</span>
                      <ArrowRight size={11} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Relational Synergies */}
            {inspectedNode.relatedNodes.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                  <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
                    Cross-Domain Synergies ({inspectedNode.relatedNodes.length}):
                  </h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {inspectedNode.relatedNodes.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => handleFocusNode(rel.id)}
                      style={{
                        padding: '4px 10px',
                        background: '#451a03',
                        border: '1px solid #d97706',
                        color: '#fde68a',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {rel.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Navigation Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to={`/admin/questions?skillId=${inspectedNode.node.id}&search=${encodeURIComponent(inspectedNode.node.name)}`}
                style={{
                  padding: '10px 14px',
                  background: '#fed601',
                  color: '#1c2d81',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '2px',
                }}
              >
                <HelpCircle size={15} />
                <span>Explore 312 Questions in Bank →</span>
              </Link>

              {onOpenExtractor && inspectedNode.node.type === 'SKILL' && (
                <button
                  type="button"
                  onClick={() => onOpenExtractor(inspectedNode.node.id, inspectedNode.node.name)}
                  style={{
                    padding: '9px 14px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '2px',
                  }}
                >
                  <Sparkles size={14} color="#fed601" />
                  <span>Extract AI Questions (JSON)</span>
                </button>
              )}

              {onInspectSkill && inspectedNode.skill && (
                <button
                  type="button"
                  onClick={() => onInspectSkill(inspectedNode.skill!)}
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    border: '1px solid #475569',
                    color: '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '2px',
                  }}
                >
                  <Eye size={13} />
                  <span>Inspect Competency Registry</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
