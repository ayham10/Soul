"use client";

type PerfumeSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
};

export default function PerfumeSearch({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "",
}: PerfumeSearchProps) {
  return (
    <>
      <style>{`
        .perfume-search {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }
        .perfume-search-input {
          width: 100%;
          min-height: 52px;
          padding: 14px 44px 14px 46px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 55%),
            var(--noir-card);
          border: 1px solid var(--line);
          color: var(--cream);
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        [dir="rtl"] .perfume-search-input {
          padding: 14px 46px 14px 44px;
        }
        .perfume-search-input::placeholder { color: #6f6655; }
        .perfume-search-input:focus {
          border-color: rgba(198, 161, 91, 0.55);
          box-shadow: 0 0 0 1px rgba(198, 161, 91, 0.18);
        }
        .perfume-search-icon,
        .perfume-search-clear {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          pointer-events: none;
        }
        .perfume-search-icon {
          inset-inline-start: 16px;
          width: 18px;
          height: 18px;
        }
        .perfume-search-clear {
          inset-inline-end: 10px;
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          cursor: pointer;
          pointer-events: auto;
          border-radius: 999px;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .perfume-search-clear:hover {
          color: var(--gold);
          background: rgba(198, 161, 91, 0.08);
        }
      `}</style>

      <div className={`perfume-search ${className}`.trim()}>
        <span className="perfume-search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16.5 16.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          className="perfume-search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
        {value && (
          <button
            type="button"
            className="perfume-search-clear"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </>
  );
}
