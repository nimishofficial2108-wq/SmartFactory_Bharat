import React, { useState } from 'react';
import { FactoryProvider, useFactory } from './context/FactoryContext';
import { AIIntelligenceProvider } from './context/AIIntelligenceContext';
import { NamastePreloader } from './components/NamastePreloader';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { AnomalyThresholdModal } from './components/ai-intelligence/AnomalyThresholdModal';

import { DashboardScreen } from './screens/DashboardScreen';
import { MachineDetailScreen } from './screens/MachineDetailScreen';
import { DevicePairingScreen } from './screens/DevicePairingScreen';
import { DigitalTwinScreen } from './screens/DigitalTwinScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { MachineMonitorScreen } from './screens/MachineMonitorScreen';
import { AIDigitalTwinScreen } from './screens/AIDigitalTwinScreen';
import { CarbonMonitorScreen } from './screens/CarbonMonitorScreen';
import { SolarSyncScreen } from './screens/SolarSyncScreen';
import { ThermoRouteScreen } from './screens/ThermoRouteScreen';
import { FuelFlexScreen } from './screens/FuelFlexScreen';

const MainLayout: React.FC = () => {
  const { currentNav, setCurrentNav, showPreloader, theme } = useFactory();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <div
      className={`${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f7f7f8] text-slate-800'
      } min-h-screen flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900 transition-colors`}
    >
      {/* Namaste Preloader */}
      {showPreloader && <NamastePreloader />}

      {/* Persistent ChatGPT Style App Header */}
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)} />

      {/* Main Body Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Navigation Sidebar (ChatGPT style collapsible) */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />

        {/* Dynamic Screen Content */}
        <main
          className={`flex-1 ${
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          } flex flex-col min-w-0 min-h-[calc(100vh-4rem)] transition-all duration-200`}
        >
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-grid-light dark:bg-grid-pattern/30">
            {currentNav === 'dashboard' && <DashboardScreen />}
            {currentNav === 'machinemonitor' && (
              <MachineMonitorScreen
                onNavigateToDigitalTwin={() => setCurrentNav('aidigitaltwin')}
                onNavigateToCarbonMonitor={() => setCurrentNav('carbonmonitor')}
              />
            )}
            {currentNav === 'aidigitaltwin' && (
              <AIDigitalTwinScreen
                onNavigateToMonitor={() => setCurrentNav('machinemonitor')}
                onNavigateToCarbonMonitor={() => setCurrentNav('carbonmonitor')}
              />
            )}
            {currentNav === 'carbonmonitor' && (
              <CarbonMonitorScreen
                onNavigateToMonitor={() => setCurrentNav('machinemonitor')}
                onNavigateToDigitalTwin={() => setCurrentNav('aidigitaltwin')}
              />
            )}
            {currentNav === 'solarsync' && <SolarSyncScreen />}
            {currentNav === 'thermoroute' && <ThermoRouteScreen />}
            {currentNav === 'fuelflex' && <FuelFlexScreen />}
            {currentNav === 'machines' && <MachineDetailScreen />}
            {currentNav === 'pair' && <DevicePairingScreen />}
            {currentNav === 'digitaltwin' && <DigitalTwinScreen />}
            {currentNav === 'alerts' && <AlertsScreen />}
            {currentNav === 'reports' && <ReportsScreen />}
            {currentNav === 'settings' && <SettingsScreen />}
          </div>
        </main>
      </div>

      {/* Persistent AI Assistant Drawer (Docked Right / Floating) */}
      <AIAssistantDrawer />

      {/* Onboarding & Guided Tour Modal */}
      <OnboardingModal />

      {/* Anomaly Threshold & Sensitivity Configuration Modal */}
      <AnomalyThresholdModal />
    </div>
  );
};

export default function App() {
  return (
    <FactoryProvider>
      <AIIntelligenceProvider>
        <MainLayout />
      </AIIntelligenceProvider>
    </FactoryProvider>
  );
}
