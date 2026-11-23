import ConnectedRoadmapPage from './ConnectedRoadmapPage';

export default function StudentRoadmapWorkspace({
  viewMode = 'map',
  initialNodeId = null,
  onOpenPlarNode,
  onBackToRoadmap,
  onNavigateDiagnostic,
  onNavigateDashboard,
  onNavigateTuition,
  onOpenAiTutorWithContext
}) {
  return (
    <ConnectedRoadmapPage
      viewMode={viewMode}
      initialNodeId={initialNodeId}
      onOpenPlarNode={onOpenPlarNode}
      onBackToRoadmap={onBackToRoadmap}
      onNavigateDiagnostic={onNavigateDiagnostic}
      onNavigateDashboard={onNavigateDashboard}
      onNavigateTuition={onNavigateTuition}
      onOpenAiTutorWithContext={onOpenAiTutorWithContext}
    />
  );
}
