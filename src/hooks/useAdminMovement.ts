import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface MovementLog {
  path: string;
  timestamp: number;
}

export function useAdminMovementTracker() {
  const location = useLocation();

  useEffect(() => {
    const existing = localStorage.getItem('admin_movement_log');
    let parsed: MovementLog[] = [];
    try {
      if (existing) parsed = JSON.parse(existing);
    } catch (e) {}

    // Only track administrative interfaces
    if (location.pathname.startsWith('/admin')) {
      const last = parsed[0];
      if (!last || last.path !== location.pathname) {
          parsed.unshift({
            path: location.pathname,
            timestamp: Date.now()
          });
          
          parsed = parsed.slice(0, 50);
          localStorage.setItem('admin_movement_log', JSON.stringify(parsed));
          
          // Dispatch sync event so topbar/sidebar can rerender
          window.dispatchEvent(new Event('admin_movement_updated'));
      }
    }
  }, [location.pathname]);
}

export function useAdminMovementLogs() {
    const [logs, setLogs] = useState<MovementLog[]>([]);

    const refreshLogs = () => {
        const existing = localStorage.getItem('admin_movement_log');
        let parsed: MovementLog[] = [];
        try {
            if (existing) parsed = JSON.parse(existing);
        } catch (e) {}
        setLogs(parsed);
    };

    useEffect(() => {
        refreshLogs();
        window.addEventListener('admin_movement_updated', refreshLogs);
        return () => window.removeEventListener('admin_movement_updated', refreshLogs);
    }, []);

    return logs;
}

export function getTopFrequented(logs: MovementLog[], topN: number = 2) {
    const counts: Record<string, number> = {};
    logs.forEach(l => {
        counts[l.path] = (counts[l.path] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(x => x[0]);
}
