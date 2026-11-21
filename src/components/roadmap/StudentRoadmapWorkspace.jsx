import ConnectedRoadmapPage from './ConnectedRoadmapPage';

export default function StudentRoadmapWorkspace({
  curriculum,
  onNavigateDiagnostic,
  onNavigateDashboard,
  onNavigateTuition,
  onOpenAiTutorWithContext
}) {
  return (
    <ConnectedRoadmapPage
      curriculum={curriculum}
      onNavigateDiagnostic={onNavigateDiagnostic}
      onNavigateDashboard={onNavigateDashboard}
      onNavigateTuition={onNavigateTuition}
      onOpenAiTutorWithContext={onOpenAiTutorWithContext}
    />
  );
}
