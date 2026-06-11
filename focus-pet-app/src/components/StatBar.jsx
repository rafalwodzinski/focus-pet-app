function StatBar({ gain = 0, label, value = 0, max = 100, tone = 'mint' }) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="stat-bar">
      <div className="stat-bar__header">
        <span>{label} {Math.round(value)}/{max}</span>
        {gain > 0 ? <strong className={`stat-bar__gain stat-bar__gain--${tone}`}>+{gain}</strong> : null}
      </div>
      <div className="stat-bar__track" aria-label={`${label}: ${value} z ${max}`}>
        <div className={`stat-bar__value stat-bar__value--${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default StatBar;
