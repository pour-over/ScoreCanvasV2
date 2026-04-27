import { useCallback, useRef, useEffect, useState, type DragEvent } from "react";
import { useViewMode } from "../context/ViewModeContext";
import { auditionAsset, stopAudition, setVolume, getVolume, snapCrossfadeSec, type AssetCategory } from "../audio/synth";
import { TransportBar } from "./TransportBar";
import { PlayingNodeProvider } from "../context/PlayingNodeContext";
import { SequenceProvider } from "../context/SequenceContext";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
  useReactFlow,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "../nodes";
import type { GameLevel } from "../data/projects";
import { NodeDetailPanel } from "./NodeDetailPanel";
// Transport bar handles playback controls, now playing, mini sprite

const defaultNodeData: Record<string, Record<string, unknown>> = {
  musicState: { label: "New State", intensity: 50, looping: true, stems: [], asset: "" },
  transition: { label: "New Transition", duration: 500, syncPoint: "next-bar", fadeType: "crossfade" },
  parameter: { label: "NewParam", paramName: "RTPC_NewParam", minValue: 0, maxValue: 100, defaultValue: 50, description: "Description…" },
  stinger: { label: "New Stinger", trigger: "OnEvent", asset: "", priority: "medium" },
  event: { label: "New Event", eventType: "cinematic", blueprintRef: "", description: "Description…" },
};

let nodeId = 100;
const getId = () => `node_${++nodeId}`;

// ─── Auto-layout: BFS left-to-right columns ────────────────────────────────
function autoLayout(nodes: Node[], edges: Edge[], detailed = false): Node[] {
  if (nodes.length === 0) return nodes;

  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  nodes.forEach((n) => { outgoing.set(n.id, []); incoming.set(n.id, []); });
  edges.forEach((e) => {
    outgoing.get(e.source)?.push(e.target);
    incoming.get(e.target)?.push(e.source);
  });

  // BFS from roots (no incoming edges)
  const depth = new Map<string, number>();
  const visited = new Set<string>();
  const roots = nodes.filter((n) => (incoming.get(n.id)?.length ?? 0) === 0);
  if (roots.length === 0) roots.push(nodes[0]);

  const queue: { id: string; d: number }[] = roots.map((r) => ({ id: r.id, d: 0 }));
  while (queue.length > 0) {
    const { id, d } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    depth.set(id, d);
    for (const tgt of outgoing.get(id) ?? []) {
      if (!visited.has(tgt)) {
        queue.push({ id: tgt, d: d + 1 });
      }
    }
  }

  // Disconnected nodes go to column 0
  nodes.forEach((n) => { if (!depth.has(n.id)) depth.set(n.id, 0); });

  // Group by column
  const columns = new Map<number, Node[]>();
  nodes.forEach((n) => {
    const col = depth.get(n.id) ?? 0;
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col)!.push(n);
  });

  // Detailed nodes are taller (director notes, stems list, status badges)
  // and slightly wider, so they need more breathing room when the layout runs.
  const COL_WIDTH = detailed ? 420 : 340;
  const ROW_HEIGHT = detailed ? 320 : 220;

  return nodes.map((n) => {
    const col = depth.get(n.id) ?? 0;
    const colNodes = columns.get(col) ?? [n];
    const row = colNodes.indexOf(n);
    const yOffset = -(colNodes.length - 1) * ROW_HEIGHT / 2;
    return {
      ...n,
      position: {
        x: 80 + col * COL_WIDTH,
        y: 480 + yOffset + row * ROW_HEIGHT,
      },
    };
  });
}

interface CanvasProps {
  level: GameLevel;
  projectId: string;
  /**
   * Optional callback fired (debounced) when the user edits nodes or edges.
   * Used by App.tsx to keep its source-of-truth project in sync for save.
   * Demo projects pass nothing here — they're effectively read-only.
   */
  onLevelEdit?: (levelId: string, nodes: Node[], edges: Edge[]) => void;
}

export function Canvas({ level, projectId, onLevelEdit }: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(level.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(level.edges);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { mode, toggle: toggleViewMode } = useViewMode();

  useEffect(() => {
    // Auto-clean layout on first load of every level — uses the same BFS
    // algorithm as the Clean Up View button so the canvas is tidy and
    // left-to-right from the start.
    const cleaned = autoLayout(level.nodes, level.edges, mode === "detailed");
    setNodes(cleaned);
    setEdges(level.edges);
    // Slightly generous padding so the graph breathes
    setTimeout(() => fitView({ padding: 0.22, duration: 400 }), 60);
  }, [level.id, level.nodes, level.edges, setNodes, setEdges, fitView, mode]);

  // ─── Broadcast edits up to App (for save) ───────────────────────────────
  // Debounced so we don't fire on every drag pixel. App handles save itself
  // (manual or autosave); this just keeps the parent's project in sync.
  useEffect(() => {
    if (!onLevelEdit) return;
    const t = setTimeout(() => onLevelEdit(level.id, nodes, edges), 400);
    return () => clearTimeout(t);
  }, [nodes, edges, level.id, onLevelEdit]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // ─── Double-click node to open detail panel ────────────────────────────
  const [detailNode, setDetailNode] = useState<Node | null>(null);
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setDetailNode(node);
  }, []);

  // ─── Edge context menu (right-click to delete) ─────────────────────────
  const [edgeMenu, setEdgeMenu] = useState<{ x: number; y: number; edgeId: string } | null>(null);
  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setEdgeMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
  }, []);
  const handleDeleteEdge = useCallback(() => {
    if (!edgeMenu) return;
    setEdges((eds) => eds.filter((e) => e.id !== edgeMenu.edgeId));
    setEdgeMenu(null);
  }, [edgeMenu, setEdges]);
  // Close menu on click anywhere
  useEffect(() => {
    if (!edgeMenu) return;
    const close = () => setEdgeMenu(null);
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [edgeMenu]);

  // ─── Undo stack for asset drops ──────────────────────────────────────────
  const [undoToast, setUndoToast] = useState<{ nodeId: string; nodeName: string; prevAsset: string; newAsset: string } | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const handleUndo = useCallback(() => {
    if (!undoToast) return;
    const { nodeId, prevAsset } = undoToast;
    setNodes((nds) =>
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, asset: prevAsset } } : n)
    );
    setUndoToast(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, [undoToast, setNodes]);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      // Handle asset drops onto nodes
      const assetData = event.dataTransfer.getData("application/scorecanvas-asset");
      if (assetData) {
        const target = (event.target as HTMLElement).closest(".react-flow__node");
        if (target) {
          const nodeId = target.getAttribute("data-id");
          if (nodeId) {
            const asset = JSON.parse(assetData);
            // Find the node and save previous asset for undo
            const targetNode = nodes.find((n) => n.id === nodeId);
            if (targetNode) {
              const prevAsset = (targetNode.data as Record<string, unknown>).asset as string ?? "";
              const nodeName = (targetNode.data as Record<string, unknown>).label as string ?? nodeId;
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === nodeId
                    ? { ...n, data: { ...n.data, asset: asset.filename } }
                    : n
                )
              );
              // Show undo toast
              if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
              setUndoToast({ nodeId, nodeName, prevAsset, newAsset: asset.filename });
              undoTimerRef.current = window.setTimeout(() => setUndoToast(null), 8000);
            }
          }
        }
        return;
      }

      // Handle node palette drops
      const type = event.dataTransfer.getData("application/scorecanvas-node");
      if (!type || !defaultNodeData[type]) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode: Node = { id: getId(), type, position, data: { ...defaultNodeData[type] } };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes, nodes]
  );

  const handleCleanUp = useCallback(() => {
    setNodes((nds) => autoLayout(nds, edges, mode === "detailed"));
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  }, [setNodes, edges, fitView, mode]);

  // ─── Volume control ────────────────────────────────────────────────────────
  const [volume, setVolumeState] = useState(getVolume());
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
  }, []);

  // ─── Play Sequence: walk graph and audition each node ──────────────────────
  const [sequencePlaying, setSequencePlaying] = useState(false);
  const [sequenceNodeId, setSequenceNodeId] = useState<string | null>(null);
  const [, setSequenceNodeType] = useState<string | null>(null);
  const [sequenceNodeIndex, setSequenceNodeIndex] = useState(0);
  const [sequenceTotalNodes, setSequenceTotalNodes] = useState(0);
  const [sequenceQuickMode, setSequenceQuickMode] = useState(false);
  const sequenceQuickModeRef = useRef(false);
  const [jumpInput, setJumpInput] = useState("");
  const [jumpSuggestions, setJumpSuggestions] = useState<Array<{ idx: number; label: string; type: string }>>([]);
  // Keep ref in sync with state so recursive playNext always reads latest
  useEffect(() => { sequenceQuickModeRef.current = sequenceQuickMode; }, [sequenceQuickMode]);
  const sequenceAbort = useRef(false);
  const sequenceOrderRef = useRef<Node[]>([]);

  // Jump to node by search
  const handleJumpSearch = useCallback((query: string) => {
    setJumpInput(query);
    if (!query.trim()) { setJumpSuggestions([]); return; }
    const q = query.toLowerCase();
    // Search all nodes (not just sequence order)
    const matches = nodes
      .map((n, idx) => ({
        idx,
        label: (n.data as Record<string, unknown>).label as string ?? n.id,
        type: n.type ?? "musicState",
        id: n.id,
      }))
      .filter((m) => m.label.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) || String(m.idx + 1) === q)
      .slice(0, 6);
    setJumpSuggestions(matches);
  }, [nodes]);

  // Rewind: jump back to a specific node index in the sequence
  const handleSequenceRewind = useCallback((targetIndex: number) => {
    if (!sequencePlaying || targetIndex < 0 || targetIndex >= sequenceOrderRef.current.length) return;
    // Stop current playback, restart from targetIndex
    stopAudition();
    const playOrder = sequenceOrderRef.current;
    const n = playOrder[targetIndex];
    setSequenceNodeId(n.id);
    setSequenceNodeType(n.type ?? null);
    setSequenceNodeIndex(targetIndex);

    // Find audio for this node
    const d = n.data as Record<string, unknown>;
    const assetRef = d.asset as string | undefined;
    let audioFile: string | undefined;
    if (n.type === "transition") {
      audioFile = "transition_sweep.mp3";
    } else if (assetRef && level?.assets) {
      const matched = level.assets.find((a: { filename?: string; id: string; audioFile?: string }) => a.filename === assetRef || a.id === assetRef);
      if (matched?.audioFile) audioFile = matched.audioFile;
    }
    if (!audioFile && level?.assets) {
      const amb = level.assets.find((a: { audioFile?: string; category?: string }) => a.audioFile && (a.category === "ambient" || a.category === "layer" || a.category === "loop"));
      if (amb?.audioFile) audioFile = amb.audioFile;
      else {
        const any = level.assets.find((a: { audioFile?: string; category?: string }) => a.audioFile && a.category !== "transition" && a.category !== "stinger");
        if (any?.audioFile) audioFile = any.audioFile;
      }
    }

    const category: AssetCategory = n.type === "transition" ? "transition" : "loop";
    const isQuick = sequenceQuickModeRef.current;
    auditionAsset({
      id: n.id,
      category,
      key: "Dm",
      bpm: 120,
      audioFile,
      playbackMode: isQuick && n.type !== "transition" ? "transition" : "full",
    }).then((durationMs) => {
      let i = targetIndex + 1;
      function playNext() {
        if (sequenceAbort.current || i >= playOrder.length) {
          setSequencePlaying(false);
          setSequenceNodeId(null);
          setSequenceNodeType(null);
          setSequenceNodeIndex(0);
          setSequenceTotalNodes(0);
          return;
        }
        const nn = playOrder[i];
        const dd = nn.data as Record<string, unknown>;
        const ar = dd.asset as string | undefined;
        let af: string | undefined;
        if (nn.type === "transition") af = "transition_sweep.mp3";
        else if (ar && level?.assets) {
          const m = level.assets.find((a: { filename?: string; id: string; audioFile?: string }) => a.filename === ar || a.id === ar);
          if (m?.audioFile) af = m.audioFile;
        }
        if (!af && level?.assets) {
          const f = level.assets.find((a: { audioFile?: string; category?: string }) => a.audioFile && a.category !== "transition");
          if (f?.audioFile) af = f.audioFile;
        }
        setSequenceNodeId(nn.id);
        setSequenceNodeType(nn.type ?? null);
        setSequenceNodeIndex(i);
        const cat: AssetCategory = nn.type === "transition" ? "transition" : "loop";
        const quick = sequenceQuickModeRef.current;
        auditionAsset({
          id: nn.id,
          category: cat,
          key: "Dm",
          bpm: 120,
          audioFile: af,
          playbackMode: quick && nn.type !== "transition" ? "transition" : "full",
        }).then((dur) => {
          i++;
          const maxMs = quick ? Math.min(dur, 20500) : dur;
          setTimeout(playNext, (maxMs > 0 ? maxMs : 1000) + 300);
        });
      }
      const firstMax = isQuick ? Math.min(durationMs, 20500) : durationMs;
      setTimeout(playNext, (firstMax > 0 ? firstMax : 1000) + 300);
    });
  }, [sequencePlaying, level]);

  const handleJumpTo = useCallback((nodeId: string) => {
    if (sequencePlaying) {
      const idx = sequenceOrderRef.current.findIndex((n) => n.id === nodeId);
      if (idx >= 0) handleSequenceRewind(idx);
    } else {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const d = node.data as Record<string, unknown>;
      const assetRef = d.asset as string | undefined;
      let audioFile: string | undefined;
      if (assetRef && level?.assets) {
        const matched = level.assets.find((a: { filename?: string; id: string; audioFile?: string }) => a.filename === assetRef || a.id === assetRef);
        if (matched?.audioFile) audioFile = matched.audioFile;
      }
      if (!audioFile && level?.assets) {
        const amb = level.assets.find((a: { audioFile?: string; category?: string }) => a.audioFile && (a.category === "ambient" || a.category === "layer" || a.category === "loop"));
        if (amb?.audioFile) audioFile = amb.audioFile;
      }
      if (node.type === "transition") audioFile = "transition_sweep.mp3";
      auditionAsset({
        id: node.id,
        category: (node.type === "transition" ? "transition" : "loop") as AssetCategory,
        key: "Dm", bpm: 120, audioFile, playbackMode: "full",
      });
    }
    setJumpInput("");
    setJumpSuggestions([]);
  }, [sequencePlaying, nodes, level, handleSequenceRewind]);

  const handlePlaySequence = useCallback(() => {
    if (sequencePlaying) {
      sequenceAbort.current = true;
      stopAudition();
      setSequencePlaying(false);
      setSequenceNodeId(null);
      setSequenceNodeType(null);
      setSequenceNodeIndex(0);
      setSequenceTotalNodes(0);
      return;
    }

    // Filter out stingers, parameters, and events BEFORE building graph
    const playableTypes = new Set(["musicState", "transition"]);
    const playableNodes = nodes.filter((n) => playableTypes.has(n.type ?? "musicState"));
    const playableIds = new Set(playableNodes.map((n) => n.id));

    // Build adjacency from edges (only between playable nodes)
    const outgoing = new Map<string, string[]>();
    playableNodes.forEach((n) => outgoing.set(n.id, []));
    edges.forEach((e) => {
      if (playableIds.has(e.source) && playableIds.has(e.target) && outgoing.has(e.source))
        outgoing.get(e.source)!.push(e.target);
    });
    const incomingCount = new Map<string, number>();
    playableNodes.forEach((n) => incomingCount.set(n.id, 0));
    edges.forEach((e) => {
      if (playableIds.has(e.source) && playableIds.has(e.target))
        incomingCount.set(e.target, (incomingCount.get(e.target) ?? 0) + 1);
    });

    // BFS order — roots first, then follow edges; sort by x-position at each step
    const visited = new Set<string>();
    const order: Node[] = [];
    const roots = playableNodes.filter((n) => (incomingCount.get(n.id) ?? 0) === 0);
    if (roots.length === 0 && playableNodes.length > 0) roots.push(playableNodes[0]);
    // Sort roots left-to-right by x position
    roots.sort((a, b) => a.position.x - b.position.x);

    const queue = [...roots];
    while (queue.length > 0) {
      const n = queue.shift()!;
      if (visited.has(n.id)) continue;
      visited.add(n.id);
      order.push(n);
      // Sort children by x-position so left-to-right visual order = play order
      const children = (outgoing.get(n.id) ?? [])
        .map((id) => playableNodes.find((nn) => nn.id === id))
        .filter((nn): nn is Node => !!nn && !visited.has(nn.id))
        .sort((a, b) => a.position.x - b.position.x);
      queue.push(...children);
    }
    // Add any disconnected playable nodes
    playableNodes.forEach((n) => { if (!visited.has(n.id)) order.push(n); });

    // Resolve audio file for a node
    function findAudioFile(n: Node): string | undefined {
      const d = n.data as Record<string, unknown>;
      // Music states / stingers have an asset reference
      const assetRef = d.asset as string | undefined;
      if (assetRef && level?.assets) {
        const matched = level.assets.find((a) => a.filename === assetRef || a.id === assetRef);
        if (matched?.audioFile) return matched.audioFile;
      }
      // Events (cinematics, IGCs) — find connected musicState's audio
      if (n.type === "event" || n.type === "parameter") {
        // Look at edges from/to this node, find a musicState neighbor
        const connectedIds = edges
          .filter((e) => e.source === n.id || e.target === n.id)
          .map((e) => e.source === n.id ? e.target : e.source);
        for (const cid of connectedIds) {
          const neighbor = nodes.find((nn) => nn.id === cid && nn.type === "musicState");
          if (neighbor) {
            const nd = neighbor.data as Record<string, unknown>;
            const nAsset = nd.asset as string | undefined;
            if (nAsset && level?.assets) {
              const m = level.assets.find((a) => a.filename === nAsset || a.id === nAsset);
              if (m?.audioFile) return m.audioFile;
            }
          }
        }
        // Fallback: prioritize ambient/loop/layer assets
        if (level?.assets?.length) {
          const ambient = level.assets.find((a) => a.audioFile && (a.category === "ambient" || a.category === "layer" || a.category === "loop"));
          if (ambient?.audioFile) return ambient.audioFile;
          const any = level.assets.find((a) => a.audioFile && a.category !== "transition" && a.category !== "stinger");
          if (any?.audioFile) return any.audioFile;
        }
      }
      return undefined;
    }

    // Look up BPM from the matched asset so crossfades can snap to bar boundaries
    function findBpm(n: Node): number | undefined {
      const d = n.data as Record<string, unknown>;
      const assetRef = d.asset as string | undefined;
      if (assetRef && level?.assets) {
        const matched = level.assets.find((a) => a.filename === assetRef || a.id === assetRef);
        if (matched?.bpm) return matched.bpm;
      }
      return undefined;
    }

    const playOrder = order; // already filtered to musicState + transition

    sequenceAbort.current = false;
    setSequencePlaying(true);
    setSequenceTotalNodes(playOrder.length);
    sequenceOrderRef.current = playOrder;

    // Play nodes with audible crossfades. Track B starts `crossfadeSec` before
    // track A's audible end, both fade simultaneously, so transitions are
    // seamless instead of fade-out → silence → fade-in. Crossfade duration
    // snaps to the nearest whole bar at the *outgoing* track's BPM so the
    // overlap lands on a musical boundary.
    let i = 0;
    async function playNext() {
      if (sequenceAbort.current || i >= playOrder.length) {
        setSequencePlaying(false);
        setSequenceNodeId(null);
        setSequenceNodeType(null);
        setSequenceNodeIndex(0);
        setSequenceTotalNodes(0);
        return;
      }
      const n = playOrder[i];
      const audioFile = n.type === "transition" ? "transition_sweep.mp3" : findAudioFile(n);
      const category: AssetCategory = n.type === "transition" ? "transition" : "loop";
      const bpm = findBpm(n) ?? 120;

      setSequenceNodeId(n.id);
      setSequenceNodeType(n.type ?? null);
      setSequenceNodeIndex(i);

      const isQuick = sequenceQuickModeRef.current;
      // Crossfade window: 4.5s target, snapped to bars. Suppress for the very
      // last track (nothing to crossfade into) and for Quick mode (Transition
      // Check is meant to expose seams, not blend them).
      const isLast = i === playOrder.length - 1;
      const wantCrossfade = !isQuick && !isLast;
      const crossfadeSec = wantCrossfade ? snapCrossfadeSec(4.5, bpm) : 0;

      const actualDurationMs = await auditionAsset({
        id: n.id,
        category,
        key: "Dm",
        bpm,
        audioFile,
        playbackMode: isQuick && n.type !== "transition" ? "transition" : "full",
        // First track in the sequence starts clean; subsequent tracks layer on
        // top of the previous one's tail so the crossfade actually overlaps.
        noStopPrevious: i > 0 && wantCrossfade,
        // Match the fade envelope to the crossfade window so the gain ramps
        // line up across both tracks.
        fadeInSec: wantCrossfade ? Math.min(crossfadeSec, 1.5) : undefined,
        fadeOutSec: wantCrossfade ? crossfadeSec : undefined,
      });

      i++;
      // Schedule the next track to begin `crossfadeSec` before this one's
      // audible end so they overlap. If no crossfade (Quick mode or last
      // track), keep the legacy 300ms gap.
      const maxMs = isQuick ? Math.min(actualDurationMs, 20500) : actualDurationMs;
      const crossfadeMs = crossfadeSec * 1000;
      const waitMs = wantCrossfade
        ? Math.max(500, maxMs - crossfadeMs)
        : (maxMs > 0 ? maxMs + 300 : 1000);
      setTimeout(playNext, waitMs);
    }
    playNext();
  }, [sequencePlaying, nodes, edges, level]);

  const handleSkipNext = useCallback(() => {
    if (!sequencePlaying) return;
    const nextIndex = sequenceNodeIndex + 1;
    if (nextIndex >= sequenceOrderRef.current.length) return;
    handleSequenceRewind(nextIndex);
  }, [sequencePlaying, sequenceNodeIndex, handleSequenceRewind]);

  // Toggle quick/transition-check mode. If sequence is playing, immediately
  // fade the current track and advance to the next node so the new mode
  // takes effect live — instead of only kicking in after the current track
  // finishes.
  const handleToggleQuickMode = useCallback(() => {
    setSequenceQuickMode((q) => {
      const next = !q;
      sequenceQuickModeRef.current = next;
      return next;
    });
    if (sequencePlaying) {
      const nextIndex = sequenceNodeIndex + 1;
      if (nextIndex < sequenceOrderRef.current.length) {
        // Small delay to let state propagate, then skip — rewind will pick
        // up the new quickModeRef value.
        setTimeout(() => handleSequenceRewind(nextIndex), 50);
      }
    }
  }, [sequencePlaying, sequenceNodeIndex, handleSequenceRewind]);

  const handleStopAll = useCallback(() => {
    stopAudition();
    if (sequencePlaying) {
      sequenceAbort.current = true;
      setSequencePlaying(false);
      setSequenceNodeId(null);
      setSequenceNodeType(null);
      setSequenceNodeIndex(0);
      setSequenceTotalNodes(0);
    }
  }, [sequencePlaying]);

  // ─── Audition takes priority over the timeline ──────────────────────────
  // When any panel (AssetBrowser, ProjectAssets, etc.) starts a user-initiated
  // audition via priorityAuditionAsset(), it dispatches "audition-priority-play".
  // Pause the sequence STATE (don't call stopAudition — auditionAsset handles
  // the audio takeover internally; calling stopAudition here would fade down
  // the master gain right as the audition starts).
  useEffect(() => {
    const onPriority = () => {
      if (sequencePlaying) {
        sequenceAbort.current = true;
        setSequencePlaying(false);
        setSequenceNodeId(null);
        setSequenceNodeType(null);
        setSequenceNodeIndex(0);
        setSequenceTotalNodes(0);
      }
    };
    window.addEventListener("audition-priority-play", onPriority);
    return () => window.removeEventListener("audition-priority-play", onPriority);
  }, [sequencePlaying]);

  // Play from a specific node: if sequence running, rewind there; otherwise start sequence from that node
  const handlePlayFromNode = useCallback((nodeId: string) => {
    if (sequencePlaying) {
      const idx = sequenceOrderRef.current.findIndex((n) => n.id === nodeId);
      if (idx >= 0) handleSequenceRewind(idx);
      return;
    }
    // Build sequence, find node index, then start from there
    // Trigger handlePlaySequence first to build the order
    handlePlaySequence();
    // After sequence starts, rewind to the target node
    setTimeout(() => {
      const idx = sequenceOrderRef.current.findIndex((n) => n.id === nodeId);
      if (idx > 0) handleSequenceRewind(idx);
    }, 100);
  }, [sequencePlaying, handlePlaySequence, handleSequenceRewind]);

  const sequenceCtx = { isPlaying: sequencePlaying, playFromNode: handlePlayFromNode };

  return (
    <PlayingNodeProvider value={sequenceNodeId}>
    <SequenceProvider value={sequenceCtx}>
    <div ref={reactFlowWrapper} data-tour="canvas" className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeContextMenu={onEdgeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{ animated: true, style: { stroke: "#3a3a5c", strokeWidth: 2 } }}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnDrag={[1, 2]}
        className="bg-canvas-bg"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e1e3a" />
        <Controls className="!bg-[#0d0d1a] !border-canvas-accent !rounded-lg !shadow-xl [&>button]:!bg-[#0d0d1a] [&>button]:!border-canvas-accent [&>button]:!text-canvas-muted [&>button:hover]:!text-canvas-text" />
        <Panel position="top-right">
          <div className="flex gap-2 items-center">
            <button
              data-tour="view-mode"
              onClick={toggleViewMode}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors backdrop-blur-sm shadow-lg ${
                mode === "simple"
                  ? "bg-canvas-highlight/20 text-canvas-highlight border-canvas-highlight/50 hover:bg-canvas-highlight/30"
                  : "bg-[#0d0d1a]/90 text-canvas-muted border-canvas-accent hover:text-canvas-text hover:border-canvas-highlight/50"
              }`}
            >
              {mode === "simple" ? "Detailed" : "Simple"} Mode
            </button>
            <button
              onClick={handleCleanUp}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#0d0d1a]/90 text-canvas-muted border border-canvas-accent hover:text-canvas-text hover:border-canvas-highlight/50 transition-colors backdrop-blur-sm shadow-lg"
            >
              Clean Up View
            </button>

            {/* Jump to node */}
            <div data-tour="jump-node" className="relative">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0d0d1a]/90 border border-canvas-accent backdrop-blur-sm shadow-lg">
                <span className="text-[10px] text-canvas-muted">⎆</span>
                <input
                  type="text"
                  value={jumpInput}
                  onChange={(e) => handleJumpSearch(e.target.value)}
                  placeholder="Check node..."
                  className="w-24 bg-transparent text-[10px] text-canvas-text font-mono placeholder:text-canvas-muted/50 outline-none"
                />
              </div>
              {jumpSuggestions.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-[#0d0d1a]/98 border border-canvas-accent rounded-lg backdrop-blur-sm shadow-2xl z-50 overflow-hidden">
                  {jumpSuggestions.map((s) => {
                    const icon = s.type === "transition" ? "→" : s.type === "stinger" ? "◆" : s.type === "event" ? "★" : s.type === "parameter" ? "◎" : "♪";
                    const color = s.type === "transition" ? "text-red-400" : s.type === "stinger" ? "text-orange-400" : s.type === "event" ? "text-cyan-400" : s.type === "parameter" ? "text-purple-400" : "text-green-300";
                    return (
                      <button
                        key={s.idx}
                        onClick={() => handleJumpTo(nodes[s.idx].id)}
                        className="w-full px-3 py-1.5 text-left hover:bg-canvas-accent/30 transition-colors flex items-center gap-2"
                      >
                        <span className={`text-[11px] ${color}`}>{icon}</span>
                        <span className="text-[10px] text-canvas-text font-mono truncate">{s.label}</span>
                        <span className="text-[8px] text-canvas-muted ml-auto">{s.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Panel>
        {mode === "detailed" && <MiniMap
          nodeColor={(n) => {
            if (n.type === "parameter") return "#a855f7";
            if (n.type === "stinger") return "#f97316";
            if (n.type === "transition") return "#e94560";
            if (n.type === "event") return "#e94560";
            return "#0f3460";
          }}
          maskColor="rgba(13, 13, 26, 0.85)"
          className="!bg-[#0d0d1a] !border-canvas-accent !rounded-lg"
        />}
        {/* Transport bar */}
        <Panel position="bottom-center">
          <div className="flex flex-col items-center gap-2 mb-1">
            {/* Undo toast */}
            {undoToast && (
              <div className="flex items-center gap-3 px-4 py-2 bg-[#0d0d1a]/95 border border-canvas-accent rounded-lg backdrop-blur-sm shadow-2xl">
                <span className="text-[11px] text-canvas-text">
                  <span className="text-canvas-highlight font-semibold">{undoToast.newAsset}</span>
                  {" → "}
                  <span className="text-canvas-muted">{undoToast.nodeName}</span>
                </span>
                <button
                  onClick={handleUndo}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-900/30 border border-amber-500/40 rounded hover:bg-amber-500/20 transition-colors"
                >
                  Undo
                </button>
                <button
                  onClick={() => { setUndoToast(null); if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }}
                  className="text-canvas-muted hover:text-canvas-text text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <TransportBar
              sequencePlaying={sequencePlaying}
              sequenceNodeId={sequenceNodeId}
              sequenceNodeIndex={sequenceNodeIndex}
              sequenceTotalNodes={sequenceTotalNodes}
              sequenceQuickMode={sequenceQuickMode}
              sequenceOrder={sequenceOrderRef.current}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              onPlaySequence={handlePlaySequence}
              onStopAll={handleStopAll}
              onSkipNext={handleSkipNext}
              onToggleQuickMode={handleToggleQuickMode}
              onRewind={handleSequenceRewind}
              projectId={projectId}
            />
          </div>
        </Panel>
      </ReactFlow>
      {/* Edge right-click context menu */}
      {edgeMenu && (
        <div
          className="fixed z-[100] bg-[#0d0d1a]/98 border border-canvas-accent rounded-lg shadow-2xl backdrop-blur-sm overflow-hidden"
          style={{ left: edgeMenu.x, top: edgeMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDeleteEdge}
            className="w-full px-4 py-2 text-[11px] text-red-400 hover:bg-red-900/30 transition-colors text-left flex items-center gap-2"
          >
            <span>✕</span> Delete Connection
          </button>
        </div>
      )}
    </div>
    {detailNode && (
      <NodeDetailPanel
        node={detailNode}
        edges={edges}
        nodes={nodes}
        assets={level.assets}
        onClose={() => setDetailNode(null)}
      />
    )}
    </SequenceProvider>
    </PlayingNodeProvider>
  );
}
