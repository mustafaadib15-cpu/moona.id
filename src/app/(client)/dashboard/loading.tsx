export default function DashboardLoading() {
  return (
    <div className="view" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="sk sk-line" />
      <div className="sk sk-line" />
      <div className="stat-grid">
        <div className="sk sk-stat" />
        <div className="sk sk-stat" />
        <div className="sk sk-stat" />
        <div className="sk sk-stat" />
      </div>
      <div className="panel">
        <div className="sk sk-line" />
        <div className="sk sk-line" />
        <div className="sk sk-line" />
      </div>
    </div>
  );
}
