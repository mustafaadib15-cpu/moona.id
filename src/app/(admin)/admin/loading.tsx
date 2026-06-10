export default function AdminLoading() {
  return (
    <div className="view" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="sk sk-line" />
      <div className="sk sk-line" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="sk sk-card" key={i} />
      ))}
    </div>
  );
}
