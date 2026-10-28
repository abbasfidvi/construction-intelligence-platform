import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { SafetyMonitor } from './components/SafetyMonitor';
import { CrackAnalyzer } from './components/CrackAnalyzer';
import { ProjectPlanner } from './components/ProjectPlanner';
import { ValuationAppraiser } from './components/ValuationAppraiser';
import { DailySiteAssistant } from './components/DailySiteAssistant';
import { WeatherAdvisory } from './components/WeatherAdvisory';
import { KnowledgeAssistant } from './components/KnowledgeAssistant';
import { fetchHealth, fetchSamplePresets } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('safety');
  const [activeSite, setActiveSite] = useState<string>('Skyline Apex Tower - Phase III');
  const [aiStatus, setAiStatus] = useState<string>('connected');
  const [samplePresets, setSamplePresets] = useState<any>(null);

  useEffect(() => {
    // Check health & fetch presets
    fetchHealth()
      .then((data) => setAiStatus(data.ai_status))
      .catch(() => setAiStatus('offline_mock'));

    fetchSamplePresets()
      .then((data) => setSamplePresets(data))
      .catch((err) => console.warn('Could not load sample presets:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        aiStatus={aiStatus}
        activeSite={activeSite}
        setActiveSite={setActiveSite}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'safety' && <SafetyMonitor sampleData={samplePresets} />}
          {activeTab === 'crack' && <CrackAnalyzer sampleData={samplePresets} />}
          {activeTab === 'planner' && <ProjectPlanner sampleData={samplePresets} />}
          {activeTab === 'valuation' && <ValuationAppraiser sampleData={samplePresets} />}
          {activeTab === 'daily-site' && <DailySiteAssistant sampleData={samplePresets} />}
          {activeTab === 'weather' && <WeatherAdvisory sampleData={samplePresets} />}
          {activeTab === 'knowledge' && <KnowledgeAssistant />}
        </main>
      </div>
    </div>
  );
}

export default App;
