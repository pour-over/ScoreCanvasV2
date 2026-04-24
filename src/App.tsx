import { useState, useEffect } from "react";
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
import { ViewModeProvider } from "./context/ViewModeContext";
import { Landing } from "./components/Landing";
import { stopAudition } from "./audio/synth";
import { projects } from "./data/projects";
import "./App.css";

function ScoreCanvasApp() {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const currentProject = projects.find((p) => p.id === selectedProjectId) ?? projects[0];

  const [selectedLevelId, setSelectedLevelId] = useState(currentProject.levels[0].id);
  const currentLevel = currentProject.levels.find((l) => l.id === selectedLevelId) ?? currentProject.levels[0];

  const [showProjectAssets, setShowProjectAssets] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStatusReport, setShowStatusReport] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWwiseSync, setShowWwiseSync] = useState(false);
  const [showSegue, setShowSegue] = useState(false);

  // Listen for window event so any mock AI button anywhere in the app can open SEGUE
  useEffect(() => {
    const handler = () => setShowSegue(true);
    window.addEventListener("open-segue", handler);
    return () => window.removeEventListener("open-segue", handler);
  }, []);

  // Launch GameTutorial on first visit (localStorage-gated)
  useEffect(() => {
    if (!hasTutorialBeenSeen()) {
      const timer = setTimeout(() => setShowTutorial(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectProject = (projectId: string) => {
    stopAudition(); // fade out current audio before switching
    setSelectedProjectId(projectId);
    const proj = projects.find((p) => p.id === projectId) ?? projects[0];
    setSelectedLevelId(proj.levels[0].id);
  };

  return (
    <ViewModeProvider>
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas-bg">
      <TopBar
        projectName={currentProject.name}
        levelName={currentLevel.name}
        levelSubtitle={currentLevel.subtitle}
        nodeCount={currentLevel.nodes.length}
        edgeCount={currentLevel.edges.length}
        assetCount={currentLevel.assets.length}
        onOpenProjectAssets={() => setShowProjectAssets(true)}
        onOpenExport={() => setShowExport(true)}
        onOpenStatusReport={() => setShowStatusReport(true)}
        onStartTour={() => setShowTutorial(true)}
        onOpenWwiseSync={() => setShowWwiseSync(true)}
        onOpenSegue={() => setShowSegue(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          levels={currentProject.levels}
          selectedLevelId={selectedLevelId}
          onSelectLevel={setSelectedLevelId}
          currentLevel={currentLevel}
        />
        <ReactFlowProvider>
          <Canvas level={currentLevel} projectId={currentProject.id} />
        </ReactFlowProvider>
      </div>
      {showProjectAssets && (
        <ProjectAssets levels={currentProject.levels} projectName={currentProject.name} onClose={() => setShowProjectAssets(false)} />
      )}
      {showExport && (
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
      {showSegue && (
        <SeguePanel onClose={() => setShowSegue(false)} />
      )}
      {/* Waitlist CTA — fixed bottom-right */}
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
  const [view, setView] = useState<"landing" | "app">(() => {
    return window.location.hash === "#app" ? "app" : "landing";
  });

  useEffect(() => {
    const onHashChange = () => {
      setView(window.location.hash === "#app" ? "app" : "landing");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (view === "app") {
    return <ScoreCanvasApp />;
  }

  return <Landing />;
}
