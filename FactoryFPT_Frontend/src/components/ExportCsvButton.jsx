export default function ExportCsvButton({ label, onClick }) {
  return (
    <button className="secondary-button" onClick={onClick}>
      ↓ {label}
    </button>
  );
}