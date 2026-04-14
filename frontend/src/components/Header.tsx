import "./Header.css";

type HeaderProps = {
  onInfoClick: () => void;
};

export function Header({ onInfoClick }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__row">
        <div className="site-header__titles">
          <h1>RSA-QTest</h1>
        </div>
        <button
          type="button"
          className="info-trigger"
          onClick={onInfoClick}
          aria-label="Como funciona o desenvolvimento"
          title="Como funciona o desenvolvimento"
        >
          <span aria-hidden="true">!</span>
        </button>
      </div>
    </header>
  );
}
