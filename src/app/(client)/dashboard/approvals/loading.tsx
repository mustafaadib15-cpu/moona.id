export default function ApprovalsLoading() {
  return (
    <div className="view" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="sk sk-line" />
      <div className="sk sk-line" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="sk sk-card" key={i} />
      ))}
    </div>
  );
}
