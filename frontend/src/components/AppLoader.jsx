function AppLoader({ label = "Processing...", show }) {
  if (!show) {
    return null;
  }

  return (
    <div className="app-loader-overlay" role="status" aria-live="polite">
      <div className="app-loader-card">
        <span className="app-loader-spinner" aria-hidden="true"></span>
        <div className="app-loader-copy">
          <strong>{label}</strong>
          <span>Please wait</span>
        </div>
      </div>
    </div>
  );
}

export default AppLoader;
