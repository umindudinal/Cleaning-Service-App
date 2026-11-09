import { useEffect, useRef } from 'react';
import { supabase } from './supabase';

/**
 * Custom hook for live realtime data synchronization.
 * Uses Supabase WebSocket real-time changes + window focus refresh + adaptive interval.
 *
 * @param {string|string[]} tables - Single table name or array of table names to listen to (e.g. 'jobs', ['jobs', 'customers'])
 * @param {Function} onUpdate - Function to re-fetch or sync state
 * @param {number} pollIntervalMs - Optional fallback polling interval in ms (default: 8000ms)
 */
export function useRealtimeSubscription(tables, onUpdate, pollIntervalMs = 8000) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const tableList = Array.isArray(tables) ? tables : [tables];
    const channelName = `realtime-${tableList.join('-')}-${Date.now()}`;

    let channel = supabase.channel(channelName);

    // Subscribe to each table's postgres_changes
    tableList.forEach((tbl) => {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tbl },
        () => {
          if (onUpdateRef.current) {
            onUpdateRef.current();
          }
        }
      );
    });

    channel.subscribe();

    // Focus refresh: auto-sync whenever the user switches back to this tab
    const handleFocus = () => {
      if (onUpdateRef.current) {
        onUpdateRef.current();
      }
    };
    window.addEventListener('focus', handleFocus);

    // Adaptive fallback polling (runs in the background to ensure consistency)
    let intervalId = null;
    if (pollIntervalMs > 0) {
      intervalId = setInterval(() => {
        // Only poll if tab is visible to save battery/bandwidth
        if (!document.hidden && onUpdateRef.current) {
          onUpdateRef.current();
        }
      }, pollIntervalMs);
    }

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      if (intervalId) clearInterval(intervalId);
    };
  }, [JSON.stringify(tables), pollIntervalMs]);
}

