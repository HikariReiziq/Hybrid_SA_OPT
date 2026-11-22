import { TopBar } from './components/layout/TopBar';
import { VideoTheaterShell } from './components/layout/VideoTheaterShell';
import { SandboxView } from './components/scenes/SandboxView';
import { Scene01ProblemWhy } from './components/scenes/Scene01ProblemWhy';
import { Scene02SaFundamentals } from './components/scenes/Scene02SaFundamentals';
import { Scene03TwoOptBridge } from './components/scenes/Scene03TwoOptBridge';
import { Scene04HybridRace } from './components/scenes/Scene04HybridRace';
import { Scene05CompareClosing } from './components/scenes/Scene05CompareClosing';
import { usePresentationStore } from './store/presentationStore';

function ActiveEpisodeScene({ sceneIndex, beatIndex }: { sceneIndex: number; beatIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return <Scene01ProblemWhy beat={beatIndex} />;
    case 1:
      return <Scene02SaFundamentals beat={beatIndex} />;
    case 2:
      return <Scene03TwoOptBridge beat={beatIndex} />;
    case 3:
      return <Scene04HybridRace beat={beatIndex} />;
    case 4:
    default:
      return <Scene05CompareClosing beat={beatIndex} />;
  }
}

export function App() {
  const viewMode = usePresentationStore((s) => s.viewMode);
  const sceneIndex = usePresentationStore((s) => s.sceneIndex);
  const beatIndex = usePresentationStore((s) => s.beatIndex);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[var(--coach-gold)] focus:px-3 focus:py-2 focus:text-xs focus:font-bold focus:text-[var(--coach-ink)]"
      >
        Lompat ke konten utama
      </a>

      <TopBar />

      <div id="main-content" className="flex flex-1 flex-col">
        {viewMode === 'video' ? (
          <VideoTheaterShell>
            <ActiveEpisodeScene sceneIndex={sceneIndex} beatIndex={beatIndex} />
          </VideoTheaterShell>
        ) : (
          <SandboxView />
        )}
      </div>
    </div>
  );
}

export default App;
