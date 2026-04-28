import { useState, useEffect, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "./components/Canvas";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ProjectAssets } from "./components/ProjectAssets";
import { ExportModal } from "./components/ExportModal";
import { StatusReport } from "./components/StatusReport";
import { GameTutorial, hasTutorialBeenSeen } from "./components/GameTutorial";
import { WwiseSyncPanel } from "./components/WwiseSyncPanel";
import { SeguePanel } from "./components/SeguePanel";
import { GenerationModal, type GenerationRequestEvent } from "./components/GenerationModal";
import { DataImportPanel } from "./components/DataImportPanel";
import { AuthModal } from "./components/AuthModal";
import { ViewModeProvider } from "./context/ViewModeContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { Landing } from "./components/Landing";
import { stopAudition } from "./audio/synth";
import { projects as demoProjects } from "./data/projects";
import type { GameProject, GameLevel, MusicAsset } from "./data/projects";
import { saveProject, loadProject, listMyProjects, forkProject, type ProjectSummary } from "./lib/projects";
import { resolveShareToken } from "./lib/share";
import { ShareModal } from "./components/ShareModal";
import "./App.css";

// ─── Hash routing helpers ──────────────────────────────────────────────────
// `#app` shows the tool. `#app/p/{uuid}` shows a specific saved project.
function parseHash(): { route: "landing" | "app"; projectId: string | null } {
  const h = window.location.hash || "";
  if (!h.startsWith("#app")) return { route: "landing", projectId: null };
  const m = h.match(/^#app\/p\/([0-9a-f-]{36})/i);
  return { route: "app", projectId: m ? m[1] : null };
}

/** Read a `?share={token}` query param. Presence forces read-only app view. */
function getShareToken(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("share");
  } catch {
    return null;
  }
}

function ScoreCanvasApp() {
  const { user, signOut, configured } = useAuth();

  // ─── Project ownership ─────────────────────────────────────────────────
  // The current project is either a hardcoded demo (read-only-ish, no save)
  // or one loaded from the DB by uuid. App owns the working copy so it can
  // serialize for save when the user clicks Save.
  const [currentProject, setCurrentProject] = useState<GameProject>(demoProjects[0]);
  const [isUserProject, setIsUserProject] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "error">("idle");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const [selectedLevelId, setSelectedLevelId] = useState(currentProject.levels[0].id);
  const currentLevel = currentProject.levels.find((l) => l.id === selectedLevelId) ?? currentProject.levels[0];

  // ─── My Projects (sidebar list) ────────────────────────────────────────
  const [myProjects, setMyProjects] = useState<ProjectSummary[]>([]);
  const refreshMyProjects = useCallback(async () => {
    if (!user) { setMyProjects([]); return; }
    setMyProjects(await listMyProjects());
  }, [user]);

  useEffect(() => { refreshMyProjects(); }, [refreshMyProjects]);

  // ─── Modals + panels ───────────────────────────────────────────────────
  const [showProjectAssets, setShowProjectAssets] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStatusReport, setShowStatusReport] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWwiseSync, setShowWwiseSync] = useState(false);
  const [showSegue, setShowSegue] = useState(false);
  const [generationRequest, setGenerationRequest] = useState<GenerationRequestEvent | null>(null);
  const [importMode, setImportMode] = useState<"level" | "project" | null>(null);
  const [authReason, setAuthReason] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // ─── Window event listeners (open-segue, open-import, open-auth) ────────
  useEffect(() => {
    const onSegue = () => setShowSegue(true);
    const onImport = (e: Event) => {
      const detail = (e as CustomEvent<{ mode: "level" | "project" }>).detail;
      if (detail?.mode) setImportMode(detail.mode);
    };
    const onAuth = (e: Event) => {
      const detail = (e as CustomEvent<{ reason?: string }>).detail;
      setAuthReason(detail?.reason ?? null);
      setShowAuth(true);
    };
    const onGenerate = (e: Event) => {
      const detail = (e as CustomEvent<GenerationRequestEvent>).detail;
      if (detail?.asset && detail.kind) setGenerationRequest(detail);
    };
    window.addEventListener("open-segue", onSegue);
    window.addEventListener("open-import", onImport);
    window.addEventListener("open-auth", onAuth);
    window.addEventListener("segue-generate", onGenerate);
    return () => {
      window.removeEventListener("open-segue", onSegue);
      window.removeEventListener("open-import", onImport);
      window.removeEventListener("open-auth", onAuth);
      window.removeEventListener("segue-generate", onGenerate);
    };
  }, []);

  // ─── Auto-show tutorial on first visit ─────────────────────────────────
  useEffect(() => {
    if (!hasTutorialBeenSeen()) {
      const t = setTimeout(() => setShowTutorial(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  // ─── Share-token detection: ?share={token} → load read-only ───────────
  // Runs once on mount. If present, takes precedence over hash routing.
  useEffect(() => {
    const token = getShareToken();
    if (!token) return;
    let cancelled = false;
    (async () => {
      const projectId = await resolveShareToken(token);
      if (!projectId || cancelled) return;
      const p = await loadProject(projectId);
      if (!p || cancelled) return;
      stopAudition();
      setCurrentProject(p);
      setIsUserProject(true);
      setIsReadOnly(true);
      setSavedProjectId(p.id);
      setSavedAt(null);
      setSelectedLevelId(p.levels[0]?.id ?? "");
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── Hash routing → load project if `#app/p/{id}` ──────────────────────
  useEffect(() => {
    // Don't fight the share-token loader on the same mount
    if (getShareToken()) return;
    const { projectId } = parseHash();
    if (!projectId) return;
    let cancelled = false;
    loadProject(projectId).then((p) => {
      if (cancelled || !p) return;
      stopAudition();
      setCurrentProject(p);
      setIsUserProject(true);
      setSavedProjectId(p.id);
      setSavedAt(new Date());
      setSelectedLevelId(p.levels[0]?.id ?? "");
    });
    return () => { cancelled = true; };
  }, []);

  // Subscribe to hash changes for in-app navigation between user projects
  useEffect(() => {
    const onHash = () => {
      const { projectId } = parseHash();
      if (!projectId) return;
      loadProject(projectId).then((p) => {
        if (!p) return;
        stopAudition();
        setCurrentProject(p);
        setIsUserProject(true);
        setSavedProjectId(p.id);
        setSavedAt(new Date());
        setSelectedLevelId(p.levels[0]?.id ?? "");
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ─── Project / level selection ─────────────────────────────────────────
  const handleSelectDemoProject = useCallback((projectId: string) => {
    stopAudition();
    const proj = demoProjects.find((p) => p.id === projectId) ?? demoProjects[0];
    setCurrentProject(proj);
    setIsUserProject(false);
    setSavedProjectId(null);
    setSavedAt(null);
    setSelectedLevelId(proj.levels[0].id);
    // Drop any project route from the hash; just keep #app
    if (window.location.hash !== "#app") window.location.hash = "app";
  }, []);

  const handleOpenUserProject = useCallback((projectId: string) => {
    window.location.hash = `app/p/${projectId}`;
  }, []);

  // ─── Canvas → App: keep edits in sync for save ─────────────────────────
  const handleLevelEdit = useCallback((levelId: string, nodes: Node[], edges: Edge[]) => {
    setCurrentProject((prev) => ({
      ...prev,
      levels: prev.levels.map((l) => l.id === levelId ? { ...l, nodes, edges } : l) as GameLevel[],
    }));
  }, []);

  // ─── ProjectAssets → App: append a freshly-uploaded asset to a level ────
  // The actual save fires from the same setCurrentProject closure via the
  // existing autosave-on-save flow; we also fire saveProject() immediately
  // because uploads are too important to wait on debounce.
  const handleAddAsset = useCallback((levelId: string, asset: MusicAsset) => {
    setCurrentProject((prev) => {
      const next: GameProject = {
        ...prev,
        levels: prev.levels.map((l) =>
          l.id === levelId ? { ...l, assets: [...l.assets, asset] } : l
        ) as GameLevel[],
      };
      // Persist right away so a refresh doesn't lose the upload reference.
      // Fire-and-forget: any failure will bubble back via savingState handlers.
      if (configured && user && savedProjectId) {
        void saveProject({
          id: savedProjectId,
          name: next.name,
          subtitle: next.subtitle,
          levels: next.levels,
        }).then(() => setSavedAt(new Date())).catch((err) => {
          console.error("Failed to persist uploaded asset:", err);
        });
      }
      return next;
    });
  }, [configured, user, savedProjectId]);

  // ─── Save (manual; auto-save lands in Phase 5) ─────────────────────────
  const handleSave = useCallback(async () => {
    if (!configured) {
      setAuthReason("Save isn't configured on this deploy yet — but the demo + tutorial work.");
      setShowAuth(true);
      return;
    }
    if (!user) {
      setAuthReason("Sign in to save your project. Magic-link, no password.");
      setShowAuth(true);
      return;
    }
    setSavingState("saving");
    try {
      const id = await saveProject({
        id: savedProjectId ?? undefined,
        name: currentProject.name,
        subtitle: currentProject.subtitle,
        levels: currentProject.levels,
      });
      setSavedProjectId(id);
      setSavedAt(new Date());
      setSavingState("idle");
      setIsUserProject(true);
      // Promote URL to `#app/p/{id}` so reload re-loads the saved project
      if (parseHash().projectId !== id) {
        window.location.hash = `app/p/${id}`;
      }
      refreshMyProjects();
    } catch (err) {
      console.error(err);
      setSavingState("error");
      setTimeout(() => setSavingState("idle"), 3000);
    }
  }, [configured, user, savedProjectId, currentProject, refreshMyProjects]);

  const handleForkCurrent = useCallback(async () => {
    if (!configured) {
      setAuthReason("Fork-to-my-projects isn't configured on this deploy yet.");
      setShowAuth(true);
      return;
    }
    if (!user) {
      setAuthReason("Sign in to fork this demo into your own editable copy.");
      setShowAuth(true);
      return;
    }
    setSavingState("saving");
    try {
      const id = await saveProject(forkProject(currentProject));
      setSavingState("idle");
      window.location.hash = `app/p/${id}`;
      refreshMyProjects();
    } catch (err) {
      console.error(err);
      setSavingState("error");
      setTimeout(() => setSavingState("idle"), 3000);
    }
  }, [configured, user, currentProject, refreshMyProjects]);

  return (
    <ViewModeProvider>
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas-bg">
      {/* Read-only banner shown to anonymous viewers of a shared project */}
      {isReadOnly && (
        <div className="bg-canvas-highlight/15 border-b border-canvas-highlight/40 px-4 py-1.5 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-canvas-highlight">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a3 3 0 00-3 3v3H4a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1h-1V4a3 3 0 00-3-3zm-2 6V4a2 2 0 014 0v3H6z"/></svg>
            <span>Read-only · viewing a shared Score Canvas project</span>
          </div>
          <a
            href="/"
            className="ml-auto text-[10px] font-mono text-canvas-muted hover:text-canvas-highlight transition-colors"
          >
            Build your own at scorecanvas.io →
          </a>
        </div>
      )}
      <TopBar
        projectName={currentProject.name}
        levelName={currentLevel?.name ?? ""}
        levelSubtitle={currentLevel?.subtitle ?? ""}
        nodeCount={currentLevel?.nodes.length ?? 0}
        edgeCount={currentLevel?.edges.length ?? 0}
        assetCount={currentLevel?.assets.length ?? 0}
        onOpenProjectAssets={() => setShowProjectAssets(true)}
        onOpenExport={() => setShowExport(true)}
        onOpenStatusReport={() => setShowStatusReport(true)}
        onStartTour={() => setShowTutorial(true)}
        onOpenWwiseSync={() => setShowWwiseSync(true)}
        onOpenSegue={() => setShowSegue(true)}
        userEmail={user?.email ?? null}
        onSignIn={() => { setAuthReason(null); setShowAuth(true); }}
        onSignOut={signOut}
        onSave={handleSave}
        onFork={handleForkCurrent}
        onShare={() => setShowShare(true)}
        savingState={savingState}
        savedAt={savedAt}
        isUserProject={isUserProject}
        readOnly={isReadOnly}
        configured={configured}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={demoProjects}
          selectedProjectId={isUserProject ? "" : currentProject.id}
          onSelectProject={handleSelectDemoProject}
          levels={currentProject.levels}
          selectedLevelId={selectedLevelId}
          onSelectLevel={setSelectedLevelId}
          currentLevel={currentLevel}
          myProjects={myProjects}
          activeUserProjectId={isUserProject ? savedProjectId : null}
          onOpenUserProject={handleOpenUserProject}
          isSignedIn={!!user}
          onForkCurrent={handleForkCurrent}
          readOnly={isReadOnly}
        />
        <ReactFlowProvider>
          <Canvas
            level={currentLevel}
            projectId={currentProject.id}
            onLevelEdit={isUserProject && !isReadOnly ? handleLevelEdit : undefined}
            readOnly={isReadOnly}
          />
        </ReactFlowProvider>
      </div>
      {showProjectAssets && (
        <ProjectAssets
          levels={currentProject.levels}
          projectName={currentProject.name}
          onClose={() => setShowProjectAssets(false)}
          readOnly={isReadOnly}
          isUserProject={isUserProject}
          userId={user?.id ?? null}
          projectId={savedProjectId}
          onAddAsset={handleAddAsset}
          defaultUploadLevelId={selectedLevelId}
        />
      )}
      {showExport && currentLevel && (
        <ExportModal level={currentLevel} onClose={() => setShowExport(false)} />
      )}
      {showStatusReport && (
        <StatusReport levels={currentProject.levels} onClose={() => setShowStatusReport(false)} />
      )}
      {showTutorial && (
        <GameTutorial onDismiss={() => setShowTutorial(false)} />
      )}
      {showWwiseSync && (
        <WwiseSyncPanel onClose={() => setShowWwiseSync(false)} />
      )}
      {generationRequest && (
        <GenerationModal
          request={generationRequest}
          onClose={() => setGenerationRequest(null)}
        />
      )}
      {showSegue && (
        <SeguePanel onClose={() => setShowSegue(false)} />
      )}
      {importMode && (
        <DataImportPanel mode={importMode} onClose={() => setImportMode(null)} />
      )}
      {showAuth && (
        <AuthModal reason={authReason ?? undefined} onClose={() => setShowAuth(false)} />
      )}
      {showShare && savedProjectId && (
        <ShareModal
          projectId={savedProjectId}
          projectName={currentProject.name}
          onClose={() => setShowShare(false)}
        />
      )}
      {/* Waitlist CTA — fixed bottom-left */}
      <a
        href="#waitlist"
        onClick={(e) => { e.preventDefault(); window.location.hash = ""; setTimeout(() => { document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }); }, 100); }}
        className="fixed bottom-4 left-4 z-50 px-4 py-2 rounded-full bg-canvas-highlight text-white text-xs font-bold shadow-lg shadow-canvas-highlight/30 hover:bg-canvas-highlight/90 transition-all hover:scale-105 border border-canvas-highlight/50"
      >
        ✉ Join the Waitlist!
      </a>
    </div>
    </ViewModeProvider>
  );
}

export default function App() {
  // ?share={token} on any URL forces the app view (read-only). Otherwise the
  // hash decides — #app shows the tool, anything else shows the landing.
  const [view, setView] = useState<"landing" | "app">(() => {
    if (getShareToken()) return "app";
    return parseHash().route;
  });

  useEffect(() => {
    const onHashChange = () => {
      if (getShareToken()) { setView("app"); return; }
      setView(parseHash().route);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {view === "app" ? <ScoreCanvasApp /> : <Landing />}
      </AuthProvider>
    </ThemeProvider>
  );
}
