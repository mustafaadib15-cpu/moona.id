"use client";

export default function ClientError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="view">
      <div className="page-kicker">خطأ</div>
      <h1 className="page-title">حدث خطأ غير متوقع</h1>
      <p className="page-sub">
        يرجى المحاولة مرة أخرى. إذا استمر الخطأ، تواصل مع فريق مُنى.
      </p>
      <button className="btn" type="button" onClick={reset}>
        إعادة المحاولة
      </button>
    </div>
  );
}
