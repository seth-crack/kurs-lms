export default function Field({ label, hint, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="small muted">{hint}</div>}
    </div>
  );
}