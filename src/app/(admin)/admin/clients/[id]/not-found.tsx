import Link from "next/link";

export default function ClientNotFound() {
  return (
    <div className="view">
      <div className="page-kicker">عميل</div>
      <h1 className="page-title">العميل غير موجود</h1>
      <p className="page-sub">قد يكون الحساب محذوفاً أو الرابط غير صحيح.</p>
      <Link className="btn" href="/admin">
        العودة إلى العملاء
      </Link>
    </div>
  );
}
