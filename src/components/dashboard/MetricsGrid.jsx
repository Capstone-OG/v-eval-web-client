import StudentSummaryCards from './StudentSummaryCards';

export default function MetricsGrid({ studentDashboard, onOpenRadar, onOpenDAG, onOpenZPD, onOpenAnalytics }) {
  return <div className="my-6"><StudentSummaryCards data={studentDashboard || {}} onOpenRadar={onOpenRadar} onOpenDAG={onOpenDAG} onOpenZPD={onOpenZPD} onOpenAnalytics={onOpenAnalytics} /></div>;
}