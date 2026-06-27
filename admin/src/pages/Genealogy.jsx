import { useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import api from '../common/api.js';

// ─── Layout constants ──────────────────────────────────────────────────────────
const NODE_W = 168;
const NODE_H = 95;
const H_GAP  = 50;
const V_GAP  = 64;

const RANK_NAMES = [
  '','Business Associate','Business Adviser','Business Head',
  'Dist. BH','State BH','Regional BH','National BH',
  'VP Sales','President Sales','President Club',
];

// ─── Layout engine ─────────────────────────────────────────────────────────────
// Returns: { nodes: [{node, x, y}], width, height }
function computeLayout(root) {
  const result = [];  // flat array of {node, x, y}

  // First pass: compute subtree widths bottom-up
  function subtreeWidth(node) {
    if (!node) return 0;
    const lw = subtreeWidth(node.left);
    const rw = subtreeWidth(node.right);
    if (!node.left && !node.right) return NODE_W;
    if (node.left && node.right) return lw + H_GAP + rw;
    return Math.max(NODE_W, lw || rw);
  }

  // Second pass: assign absolute x,y coords
  function place(node, offsetX, depth) {
    if (!node) return;
    const lw = subtreeWidth(node.left);
    const rw = subtreeWidth(node.right);
    let nodeX;

    if (!node.left && !node.right) {
      nodeX = offsetX;
    } else if (node.left && node.right) {
      // Center over the gap between left and right subtrees
      nodeX = offsetX + lw + H_GAP / 2 - NODE_W / 2;
    } else if (node.left) {
      nodeX = offsetX + lw / 2 - NODE_W / 2;
    } else {
      nodeX = offsetX + rw / 2 - NODE_W / 2;
    }

    const y = depth * (NODE_H + V_GAP);
    result.push({ node, x: nodeX, y });

    if (node.left)  place(node.left,  offsetX, depth + 1);
    if (node.right) place(node.right, offsetX + (node.left ? lw + H_GAP : 0), depth + 1);
  }

  place(root, 0, 0);

  const maxX = Math.max(...result.map((r) => r.x + NODE_W));
  const maxY = Math.max(...result.map((r) => r.y + NODE_H));

  return { nodes: result, width: maxX, height: maxY };
}

// ─── TreeCanvas ────────────────────────────────────────────────────────────────
function TreeCanvas({ data }) {
  if (!data) return null;

  const PAD = 32;
  const { nodes, width, height } = computeLayout(data);
  const canvasW = width + PAD * 2;
  const canvasH = height + PAD * 2;

  // Build a userId→position lookup
  const posMap = new Map();
  nodes.forEach(({ node, x, y }) => {
    const key = node.userId || node.associateId;
    if (key) posMap.set(key, { x: x + PAD, y: y + PAD, node });
  });

  // Draw SVG connector lines
  const lines = [];
  nodes.forEach(({ node, x, y }) => {
    const px = x + PAD + NODE_W / 2;
    const py = y + PAD + NODE_H;
    const elbowY = py + V_GAP * 0.5;

    const children = [
      node.left  ? { child: node.left,  label: 'L' } : null,
      node.right ? { child: node.right, label: 'R' } : null,
    ].filter(Boolean);

    if (children.length === 0) return;

    // Vertical from parent down to elbow
    lines.push(<line key={`pv-${node.userId}`} x1={px} y1={py} x2={px} y2={elbowY} stroke="#CBD5E1" strokeWidth="2" />);

    const childCenters = children.map(({ child }) => {
      const key = child.userId || child.associateId;
      const pos = posMap.get(key);
      return pos ? pos.x + NODE_W / 2 : px;
    });

    // Horizontal bar
    if (children.length === 2) {
      lines.push(
        <line key={`ph-${node.userId}`}
          x1={Math.min(...childCenters)} y1={elbowY}
          x2={Math.max(...childCenters)} y2={elbowY}
          stroke="#CBD5E1" strokeWidth="2"
        />
      );
    }

    // Vertical down to each child + L/R label
    children.forEach(({ child, label }, i) => {
      const key = child.userId || child.associateId;
      const pos = posMap.get(key);
      if (!pos) return;
      const cx = pos.x + NODE_W / 2;
      const cy = pos.y;

      lines.push(<line key={`cv-${key}`} x1={cx} y1={elbowY} x2={cx} y2={cy} stroke="#CBD5E1" strokeWidth="2" />);
      lines.push(
        <text key={`lbl-${key}`} x={cx + 4} y={cy - 3} fontSize="9" fill="#94A3B8" fontWeight="700">{label}</text>
      );
    });
  });

  return (
    <div style={{ position: 'relative', width: canvasW, height: canvasH }}>
      {/* Lines layer */}
      <svg width={canvasW} height={canvasH} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}>
        {lines}
      </svg>

      {/* Node cards layer */}
      {nodes.map(({ node, x, y }) => (
        <NodeCard key={node.userId || node.associateId} node={node} x={x + PAD} y={y + PAD} />
      ))}
    </div>
  );
}

// ─── NodeCard ──────────────────────────────────────────────────────────────────
function NodeCard({ node, x, y }) {
  const isActive   = node.status === 'ACTIVE';
  const isInactive = node.status === 'INACTIVE';

  const borderColor = isActive ? '#22C55E' : isInactive ? '#F59E0B' : '#CBD5E1';
  const bgColor     = isActive ? '#F0FDF4' : isInactive ? '#FFFBEB' : '#F8FAFC';
  const statusBg    = isActive ? '#DCFCE7' : isInactive ? '#FEF9C3' : '#F1F5F9';
  const statusText  = isActive ? '#16A34A' : isInactive ? '#CA8A04' : '#64748B';

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: NODE_W, height: NODE_H,
      border: `2px solid ${borderColor}`,
      borderRadius: 12, background: bgColor,
      boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '6px 10px', boxSizing: 'border-box',
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
        {node.name || '—'}
      </p>
      <p style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', margin: '2px 0' }}>
        {node.userId || '—'}
      </p>
      {node.rank != null && (
        <span style={{ fontSize: 9, background: '#FEF3C7', color: '#D97706', borderRadius: 99, padding: '1px 8px', fontWeight: 700, marginBottom: 2, textAlign: 'center' }}>
          R{node.rank}: {RANK_NAMES[node.rank] || ''}
        </span>
      )}
      <span style={{ fontSize: 9, borderRadius: 99, padding: '1px 8px', fontWeight: 600, background: statusBg, color: statusText }}>
        {node.status || '—'}
      </span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Genealogy() {
  const [searchQuery, setSearchQuery]           = useState('');
  const [treeData, setTreeData]                 = useState(null);
  const [businessData, setBusinessData]         = useState(null);
  const [selectedAssociate, setSelectedAssociate] = useState('');
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const scrollRef = useRef(null);

  const fetchTree = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError('');
      setTreeData(null);
      const res = await api.get(`/admin/genealogy/tree/${userId}`, { params: { depth: 10 } });
      setTreeData(res.data?.data || null);
      setTimeout(() => {
        if (scrollRef.current) {
          const el = scrollRef.current;
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        }
      }, 80);
    } catch (err) {
      setError(err.response?.data?.message || 'Associate not found');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) fetchTree(searchQuery.trim());
  };

  const fetchBusiness = async () => {
    if (!selectedAssociate.trim()) return;
    try {
      const res = await api.get(`/admin/genealogy/business-tracking/${selectedAssociate.trim()}`);
      setBusinessData(res.data?.data || res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Not found');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 lg:hidden">Genealogy Tree</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 items-center">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Enter User ID (e.g. IWR100010)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm w-64 focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
          />
        </div>
        <button type="submit" className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-medium text-white hover:bg-gold-600">
          Search
        </button>
        {treeData && (
          <span className="text-xs text-gray-500">
            Showing tree for <span className="font-semibold text-gray-700">{treeData.userId} — {treeData.name}</span>
          </span>
        )}
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
          <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          Loading tree...
        </div>
      )}

      {/* Legend */}
      {treeData && !loading && (
        <div className="flex flex-wrap gap-4 items-center text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Active</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Inactive</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Suspended</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">L = Left leg &nbsp; R = Right leg</span>
        </div>
      )}

      {/* Tree */}
      {treeData && !loading && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: '72vh' }}>
            <div style={{ padding: 32, display: 'inline-block', minWidth: '100%' }}>
              <TreeCanvas data={treeData} />
            </div>
          </div>
        </div>
      )}

      {/* Business Tracking */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Business Tracking</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter Associate ID (e.g. IW100010)"
            value={selectedAssociate}
            onChange={(e) => setSelectedAssociate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-64 focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
          />
          <button onClick={fetchBusiness} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600">
            Track
          </button>
        </div>
        {businessData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">Left Volume</p>
              <p className="text-xl font-bold text-blue-700">₹{Number(businessData.leftVolume || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl bg-green-50 p-4 border border-green-100">
              <p className="text-xs text-gray-500 mb-1">Right Volume</p>
              <p className="text-xl font-bold text-green-700">₹{Number(businessData.rightVolume || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4 border border-purple-100">
              <p className="text-xs text-gray-500 mb-1">Carry Forward</p>
              <p className="text-xl font-bold text-purple-700">₹{Number(businessData.carryForward || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
              <p className="text-xs text-gray-500 mb-1">Paired Volume</p>
              <p className="text-xl font-bold text-amber-700">₹{Number(businessData.pairedVolume || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
