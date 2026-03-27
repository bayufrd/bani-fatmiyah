'use client';

import { useState, useRef, useEffect } from 'react';
import type { FamilyMember } from '@/lib/db';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface TreeNodePosition {
  id: number;
  x: number;
  y: number;
  member: FamilyMember;
}

interface TreeNodeWithChildren {
  member: FamilyMember;
  children: TreeNodeWithChildren[];
  isExpanded: boolean;
}

function buildTreeStructure(
  parentId: number | undefined,
  expandedNodes: Set<number>,
  allMembers: FamilyMember[]
): TreeNodeWithChildren | null {
  const member = allMembers.find((m) => m.id === parentId);
  if (!member) return null;

  const children = allMembers
    .filter((m) => {
      if (!m.parentIds) return false;
      const parentIds = Array.isArray(m.parentIds) 
        ? m.parentIds 
        : typeof m.parentIds === 'string'
          ? JSON.parse(m.parentIds)
          : [];
      return parentIds.includes(parentId);
    })
    .map((child) => buildTreeStructure(child.id, expandedNodes, allMembers))
    .filter((child): child is TreeNodeWithChildren => child !== null);

  return {
    member,
    children,
    isExpanded: expandedNodes.has(parentId),
  };
}

interface DrawTreeProps {
  node: TreeNodeWithChildren | null;
  x: number;
  y: number;
  xOffset: number;
  positions: Map<number, TreeNodePosition>;
  onPositionCalculated: (positions: Map<number, TreeNodePosition>) => void;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 120;
const VERTICAL_GAP = 180;
const SIBLING_GAP = 100;
const LEAF_SIBLING_GAP = 5; // Much smaller gap for leaf nodes

interface NodeWithWidth extends TreeNodeWithChildren {
  width?: number;
  prelimX?: number;
  finalX?: number;
  isLeaf?: boolean;
}

// Bottom-up approach: Calculate subtree width first, then position
function calculateSubtreeWidth(node: NodeWithWidth): number {
  const isLeaf = !node.isExpanded || node.children.length === 0;
  node.isLeaf = isLeaf;
  
  if (isLeaf) {
    return NODE_WIDTH;
  }

  let totalWidth = 0;
  for (const child of node.children) {
    totalWidth += calculateSubtreeWidth(child as NodeWithWidth);
    totalWidth += SIBLING_GAP;
  }
  
  node.width = Math.max(totalWidth - SIBLING_GAP, NODE_WIDTH);
  return node.width;
}

// Calculate preliminary X positions (bottom-up)
function calculatePrelimPositions(
  node: NodeWithWidth,
  x: number,
  y: number,
  positions: Map<string, TreeNodePosition>
): void {
  // Set current node position
  positions.set(node.member.id, {
    id: node.member.id,
    x,
    y,
    member: node.member,
  });

  if (!node.isExpanded || node.children.length === 0) {
    return;
  }

  // Position children horizontally
  const childrenWidth = (node.children as NodeWithWidth[]).reduce((sum, child) => {
    const childNode = child as NodeWithWidth;
    const gap = childNode.isLeaf ? LEAF_SIBLING_GAP : SIBLING_GAP;
    return sum + (childNode.width || NODE_WIDTH) + gap;
  }, 0) - (((node.children[node.children.length - 1] as NodeWithWidth).isLeaf ? LEAF_SIBLING_GAP : SIBLING_GAP));

  let currentX = x - childrenWidth / 2;

  for (const child of node.children) {
    const childNode = (child as NodeWithWidth);
    const childWidth = childNode.width || NODE_WIDTH;
    const gap = childNode.isLeaf ? LEAF_SIBLING_GAP : SIBLING_GAP;
    const childCenterX = currentX + childWidth / 2;

    calculatePrelimPositions(
      childNode,
      childCenterX,
      y + VERTICAL_GAP,
      positions
    );

    currentX += childWidth + gap;
  }
}

// Helper function to get all node IDs that have children
function getAllExpandableNodeIds(allMembers: FamilyMember[]): Set<number> {
  const expandableIds = new Set<number>();
  allMembers.forEach((member) => {
    const hasChildren = allMembers.some((m) => {
      if (!m.parentIds) return false;
      const parentIds = Array.isArray(m.parentIds) 
        ? m.parentIds 
        : typeof m.parentIds === 'string'
          ? JSON.parse(m.parentIds)
          : [];
      return parentIds.includes(member.id);
    });
    if (hasChildren) {
      expandableIds.add(member.id);
    }
  });
  return expandableIds;
}

export function InteractiveTreeVisualizer() {
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [positions, setPositions] = useState<Map<number, TreeNodePosition>>(
    new Map()
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FamilyMember[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load members from database
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          setAllMembers(data);
          // Expand all nodes initially
          setExpandedNodes(getAllExpandableNodeIds(data));
        }
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const rootMember = allMembers.find((m) => m.generation === 0 || m.generation === 1);

  useEffect(() => {
    if (!rootMember) return;

    const tree = buildTreeStructure(rootMember.id, expandedNodes, allMembers) as NodeWithWidth;
    if (!tree) return;

    const newPositions = new Map<number, TreeNodePosition>();
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const centerX = containerWidth / 2;

    // First pass: calculate subtree widths (bottom-up)
    calculateSubtreeWidth(tree);
    
    // Second pass: calculate positions
    calculatePrelimPositions(tree, centerX, 50, newPositions);
    setPositions(newPositions);
  }, [expandedNodes, rootMember, allMembers]);

  // Scroll to center on initial load
  useEffect(() => {
    if (containerRef.current && positions.size > 0) {
      // Get all positions to find the bounds
      const allPositions = Array.from(positions.values());
      if (allPositions.length === 0) return;

      const minX = Math.min(...allPositions.map(p => p.x));
      const maxX = Math.max(...allPositions.map(p => p.x));
      const minY = Math.min(...allPositions.map(p => p.y));
      const maxY = Math.max(...allPositions.map(p => p.y));

      const centerX = (minX + maxX) / 2 + offsetX + NODE_WIDTH / 2;
      const centerY = (minY + maxY) / 2 + NODE_HEIGHT / 2;

      const container = containerRef.current;
      const scrollX = centerX - container.offsetWidth / 2;
      const scrollY = centerY - container.offsetHeight / 2;

      // Scroll to center
      container.scrollLeft = Math.max(0, scrollX);
      container.scrollTop = Math.max(0, scrollY);
    }
  }, []);

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = allMembers.filter(member =>
      member.name.toLowerCase().includes(lowerQuery) ||
      (member.arabicName && member.arabicName.toLowerCase().includes(lowerQuery)) ||
      (member.description && member.description.toLowerCase().includes(lowerQuery))
    );
    
    setSearchResults(results);
  };

  // Auto-scroll and focus on searched member
  const focusOnMember = (member: FamilyMember) => {
    // Expand all parent nodes to make the member visible
    const newExpanded = new Set(expandedNodes);
    let currentIds: number[] = member.parentIds && Array.isArray(member.parentIds) 
      ? member.parentIds 
      : typeof member.parentIds === 'string'
        ? JSON.parse(member.parentIds)
        : [];
    
    // Expand all ancestors recursively
    const expandAncestors = (ids: number[]) => {
      ids.forEach((id) => {
        newExpanded.add(id);
        const parent = allMembers.find((m) => m.id === id);
        if (parent && parent.parentIds) {
          const parentIds = Array.isArray(parent.parentIds) 
            ? parent.parentIds 
            : typeof parent.parentIds === 'string'
              ? JSON.parse(parent.parentIds)
              : [];
          if (parentIds.length > 0) {
            expandAncestors(parentIds);
          }
        }
      });
    };
    
    expandAncestors(currentIds);
    
    setExpandedNodes(newExpanded);
    setSelectedMember(member);
    setSearchQuery('');
    setSearchResults([]);

    // Scroll to the member after a short delay to ensure DOM is updated
    setTimeout(() => {
      const nodeElement = nodeRefsMap.current.get(member.id);
      if (nodeElement && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const nodeRect = nodeElement.getBoundingClientRect();
        
        // Calculate scroll positions
        const scrollLeft = containerRef.current.scrollLeft + (nodeRect.left - containerRect.left) - (containerRect.width / 2) + (nodeRect.width / 2);
        const scrollTop = containerRef.current.scrollTop + (nodeRect.top - containerRect.top) - (containerRect.height / 2) + (nodeRect.height / 2);
        
        containerRef.current.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' });
      }
    }, 100);
  };

  if (loading) {
    return <div className="text-center py-8">Memuat data pohon silsilah...</div>;
  }

  if (!rootMember) {
    return <div>Data tidak ditemukan</div>;
  }

  const tree = buildTreeStructure(rootMember.id, expandedNodes, allMembers);
  if (!tree) return <div>Data tidak ditemukan</div>;

  // Calculate SVG dimensions with better padding for large trees
  const minX = Math.min(...Array.from(positions.values()).map((p) => p.x));
  const maxX = Math.max(...Array.from(positions.values()).map((p) => p.x));
  const maxY = Math.max(...Array.from(positions.values()).map((p) => p.y));

  const svgWidth = Math.max(1200, maxX - minX + NODE_WIDTH + 80);
  const svgHeight = Math.max(800, maxY + NODE_HEIGHT + 120);
  const offsetX = -minX + 40;

  // Draw connections
  const connections: {
    parent: TreeNodePosition;
    child: TreeNodePosition;
  }[] = [];

  positions.forEach((pos) => {
    const children = allMembers.filter((m) => {
      if (!m.parentIds) return false;
      const parentIds = Array.isArray(m.parentIds) 
        ? m.parentIds 
        : typeof m.parentIds === 'string'
          ? JSON.parse(m.parentIds)
          : [];
      return parentIds.includes(pos.id);
    });
    children.forEach((child) => {
      const childPos = positions.get(child.id);
      if (childPos) {
        connections.push({ parent: pos, child: childPos });
      }
    });
  });

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-8 transition-colors">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Pohon Silsilah Keluarga Besar
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
          H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh)
        </p>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
          Klik nama untuk detail, atau panah untuk perluas keturunan
        </p>
        
        {/* Search Box */}
        <div className="mt-4 sm:mt-6 mb-4 relative w-full max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  focusOnMember(searchResults[0]);
                }
              }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-48 sm:max-h-64 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => focusOnMember(result)}
                  className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-blue-100 dark:hover:bg-slate-600 border-b dark:border-slate-600 last:border-b-0 transition-colors text-xs sm:text-sm"
                >
                  <div className="font-semibold text-gray-900 dark:text-white truncate text-xs sm:text-sm">{result.name}</div>
                  {result.arabicName && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.arabicName}</div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-500">Gen {result.generation}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-3 sm:mt-4 flex gap-3 sm:gap-6 text-xs sm:text-sm justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Garis Keturunan (Sedarah)</span>
          </div>
        </div>
      </div>

      {/* Tree Container */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-auto border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 transition-colors"
        style={{ maxHeight: '600px' }}
      >
        <div className="inline-block relative" style={{ minWidth: `${svgWidth}px`, minHeight: `${svgHeight}px` }}>
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="absolute top-0 left-0 pointer-events-none"
          >
            {/* Draw connections - Blue lines for blood relations */}
            {connections.map((conn, idx) => {
              const parentX = conn.parent.x + offsetX + NODE_WIDTH / 2;
              const parentY = conn.parent.y + NODE_HEIGHT;
              const childX = conn.child.x + offsetX + NODE_WIDTH / 2;
              const childY = conn.child.y;

              const midY = (parentY + childY) / 2;

              return (
                <g key={idx}>
                  {/* Line from parent down */}
                  <line
                    x1={parentX}
                    y1={parentY}
                    x2={parentX}
                    y2={midY}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Horizontal line */}
                  <line
                    x1={parentX}
                    y1={midY}
                    x2={childX}
                    y2={midY}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Line to child - diperpanjang */}
                  <line
                    x1={childX}
                    y1={midY}
                    x2={childX}
                    y2={childY + 30}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Arrow head */}
                  <polygon
                    points={`${childX - 6},${childY + 20} ${childX + 6},${childY + 20} ${childX},${childY + 30}`}
                    fill="#3b82f6"
                  />
                </g>
              );
            })}
          </svg>

          {/* Draw nodes */}
          <div style={{ position: 'relative', width: '100%', minHeight: svgHeight }}>
            {Array.from(positions.values()).map((pos) => {
              const member = pos.member;
              const hasChildren = allMembers.some((m) => {
                if (!m.parentIds) return false;
                const parentIds = Array.isArray(m.parentIds) 
                  ? m.parentIds 
                  : typeof m.parentIds === 'string'
                    ? JSON.parse(m.parentIds)
                    : [];
                return parentIds.includes(member.id);
              });
              const isExpanded = expandedNodes.has(member.id);

              return (
                <div
                  key={member.id}
                  ref={(el) => {
                    if (el) {
                      nodeRefsMap.current.set(member.id, el);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: `${pos.x + offsetX}px`,
                    top: `${pos.y + 30}px`,
                  }}
                  className="cursor-pointer -translate-x-1/2"
                >
                  <div
                    onClick={() => setSelectedMember(member)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all w-52
                      ${
                        (member.gender === 'male' || !member.gender)
                          ? 'bg-blue-50 border-blue-300 hover:border-blue-500 hover:shadow-lg'
                          : 'bg-pink-50 border-pink-300 hover:border-pink-500 hover:shadow-lg'
                      }
                      ${
                        selectedMember?.id === member.id
                          ? 'ring-2 ring-purple-500 shadow-lg'
                          : ''
                      }
                    `}
                  >
                    {/* Toggle button for parent nodes */}
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNode(member.id);
                        }}
                        className="absolute -top-3 -right-3 bg-white border-2 border-gray-300 rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    )}

                    {/* Gender indicator - Top left corner */}
                    <div className="absolute -top-3 -left-3 text-2xl bg-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-300">
                      {(member.gender === 'male' || !member.gender) ? '👨' : '👩'}
                    </div>

                    {/* Child number - Next to gender icon, only for non-Gen0 */}
                    {member.generation > 0 && member.childNumber && (
                      <div className="absolute -top-3 left-7 text-xs font-bold px-2 py-1 bg-blue-200 text-blue-900 rounded-full border border-blue-300">
                        Anak ke-{member.childNumber}
                      </div>
                    )}

                    {/* Name with wrapping, not truncate */}
                    <h4 className="font-bold text-sm text-gray-900 break-words leading-tight min-h-8">
                      {member.name}
                    </h4>
                    {member.arabicName && (
                      <p className="text-xs text-gray-600 truncate">
                        {member.arabicName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Gen {member.generation}
                    </p>
                    {member.birth && (
                      <p className="text-xs text-gray-600 mt-1">
                        {member.birth}
                        {member.death && ` - ${member.death}`}
                      </p>
                    )}

                    {/* Status label - moved above spouse info */}
                    {member.status === 'deceased' && (
                      <div className="mt-1 text-xs font-semibold px-2 py-1 rounded inline-block bg-gray-400 text-white">
                        {(member.gender === 'male' || !member.gender) ? 'Alm' : 'Almh'}
                      </div>
                    )}

                    {/* Spouse info */}
                    {member.spouseName && (
                      <div className="mt-2 pt-2 border-t border-gray-300 text-xs">
                        <p className="text-gray-700 font-semibold">Pasangan:</p>
                        <p className="text-gray-600 italic font-bold">{member.spouseName}</p>
                        {member.spouse?.notes && (
                          <p className="text-gray-600 text-xs mt-1">{member.spouse.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedMember && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-700 transition-colors">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {selectedMember.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {selectedMember.arabicName && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Nama Arab</p>
                <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.arabicName}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Jenis Kelamin</p>
              <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                {(selectedMember.gender === 'male' || !selectedMember.gender) ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>

            {selectedMember.birth && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Tanggal Lahir</p>
                <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.birth}
                </p>
              </div>
            )}

            {selectedMember.death && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Tanggal Meninggal</p>
                <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.death}
                </p>
              </div>
            )}

            {selectedMember.spouseName && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Pasangan</p>
                <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.spouseName}
                </p>
                {selectedMember.spouse?.notes && (
                  <p className="text-gray-700 dark:text-gray-300 mt-1 text-xs sm:text-sm">
                    {selectedMember.spouse.notes}
                  </p>
                )}
              </div>
            )}

            {selectedMember.address && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Alamat</p>
                <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                  📍 {selectedMember.address}
                </p>
              </div>
            )}

            {selectedMember.status && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Status</p>
                <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.status === 'deceased' 
                    ? ((selectedMember.gender === 'male' || !selectedMember.gender) ? 'Alm (Almarhum)' : 'Almh (Almarhumah)')
                    : 'Hidup'
                  }
                </p>
              </div>
            )}

            {selectedMember.description && (
              <div className="md:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Keterangan</p>
                <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 mt-1">
                  {selectedMember.description}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Generasi</p>
              <p className="text-sm sm:text-lg text-gray-900 dark:text-white mt-1">
                Generasi {selectedMember.generation}
              </p>
            </div>
          </div>

          {/* Parents info */}
          {selectedMember.parentIds && selectedMember.parentIds.length > 0 && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-purple-300 dark:border-purple-700">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">Orang Tua</p>
              {(() => {
                const parentIds = Array.isArray(selectedMember.parentIds) 
                  ? selectedMember.parentIds 
                  : typeof selectedMember.parentIds === 'string'
                    ? JSON.parse(selectedMember.parentIds)
                    : [];
                const parents = parentIds
                  .map((id: number) => allMembers.find((m) => m.id === id))
                  .filter((p) => p !== undefined);
                
                return parents.length > 0 ? (
                  <div className="space-y-2">
                    {parents.map((parent) => (
                      <button
                        key={parent.id}
                        onClick={() => setSelectedMember(parent)}
                        className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-semibold block"
                      >
                        {parent.name}
                        {parent.arabicName && ` (${parent.arabicName})`}
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Children info */}
          {(() => {
            const children = allMembers.filter((m) => {
              if (!m.parentIds) return false;
              const parentIds = Array.isArray(m.parentIds) 
                ? m.parentIds 
                : typeof m.parentIds === 'string'
                  ? JSON.parse(m.parentIds)
                  : [];
              return parentIds.includes(selectedMember.id);
            });
            if (children.length > 0) {
              return (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-purple-300 dark:border-purple-700">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">
                    Anak-anak ({children.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedMember(child)}
                        className="text-left p-1.5 sm:p-2 rounded hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">
                          {child.name}
                        </div>
                        {child.arabicName && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {child.arabicName}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
