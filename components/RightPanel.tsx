import dynamic from 'next/dynamic';

const TrainingPanel = dynamic(() => import('../app/(spa)/panels/TrainingPanel'));

export default function RightPanel() {
  return (
    <aside className="w-[420px] border-l border-[#444] h-screen overflow-auto">
      <div className="sticky top-0 bg-[#1E1E1E] p-3 border-b border-[#444]">
        <h2 className="text-lg">Status</h2>
      </div>
      {/* Tabs could be added here; for now mount Training by default */}
      {/* @ts-expect-error Async Server Component */}
      <TrainingPanel />
    </aside>
  );
}


