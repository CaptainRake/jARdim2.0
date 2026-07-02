export default function GuideDialog({ visible, onContinue, onClose }) {
  if (!visible) return null;

  return (
    <div className="guide-overlay">
      <div className="guide-box">
        <button className="dialog-close" onClick={onClose}>×</button>

        <div className="guide-avatar">🌿</div>

        <h3>???</h3>

        <p>Nossa... acho que alguma coisa se mexeu ali perto...</p>

        <button onClick={onContinue}>Continuar</button>
      </div>
    </div>
  );
}