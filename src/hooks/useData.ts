import { useState, useEffect } from "react";
import type { DailyReportData, WeeklyReportData } from "../types/data";

export function useDailyData(date: string) {
  const [data, setData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Assuming data is served at /data/daily/YYYY-MM-DD.json
        const response = await fetch(`/data/daily/${date}.json`);
        if (!response.ok) {
          throw new Error("Report not found");
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    if (date) {
      fetchData();
    }
  }, [date]);

  return { data, loading, error };
}

export function useWeeklyData(week: string) {
  const [data, setData] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/data/weekly/${week}.json`);
        if (!response.ok) {
          throw new Error("Report not found");
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    if (week) {
      fetchData();
    }
  }, [week]);

  return { data, loading, error };
}
