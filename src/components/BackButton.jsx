import { Link } from 'react-router-dom';

export default function BackButton({ to = '/', label = 'Back' }) {
  return (
    <Link to={to} className="back-btn">
      <span className="back-btn-arrow">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4.5 7 9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {label}
    </Link>
  );
}
