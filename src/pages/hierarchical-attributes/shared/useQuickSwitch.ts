import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Phase 6 dual-direction prototype: keyboard quick-switch between the two routes.
 * Backslash (\) cycles landing → /d1 → /d2 → /d1 (per intake P6-Q8).
 */
export default function useQuickSwitch() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '\\') return;
      // Ignore when focused in editable elements.
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;

      e.preventDefault();
      const path = location.pathname.replace(/\/$/, '');
      if (path.endsWith('/d1')) {
        navigate('/hierarchical-attributes/d2');
      } else if (path.endsWith('/d2')) {
        navigate('/hierarchical-attributes/d1');
      } else if (path.endsWith('/state-matrix')) {
        navigate('/hierarchical-attributes/d1');
      } else {
        navigate('/hierarchical-attributes/d1');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, location.pathname]);
}
