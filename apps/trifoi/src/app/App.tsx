import { ModeSelector } from "../components/ModeSelector";
import { ModePill } from "../components/ModePill";
import { PresenceStrip } from "../components/PresenceStrip";
import { CrucibleRecorder } from "../components/CrucibleRecorder";
import { SignalScope } from "../components/SignalScope";
import { MODES } from "./modes";
import { useMode } from "./useMode";

export default function App() {
  const { mode, modeId, setMode } = useMode();

  return (
    <div className="relative min-h-screen bg-[#0b0b0a] px-5 py-8 text-[#f2eee6]">
      <ModePill mode={mode} />
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <header className="flex items-center text-xs uppercase tracking-[0.3em] text-white/60">
          <span>TRIFOI ☘️ 🍄 ⚜️</span>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-7">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">MODE SELECT</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[0.08em]">Pick your state</h1>
          <p className="mt-2 text-sm text-white/60">
            One tap. One state. Stored locally.
          </p>

          <div className="mt-6">
            <ModeSelector modes={MODES} activeId={modeId} onSelect={setMode} />
          </div>
        </section>

        <SignalScope modeId={modeId} />

        <PresenceStrip />

        <footer className="text-center text-[10px] uppercase tracking-[0.3em] text-white/40">
          Trifoi • local mode only
        </footer>
      </div>
      <CrucibleRecorder />
    </div>
  );
}
