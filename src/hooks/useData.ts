import { useState, useEffect } from "react";
import type {
  DailyReportData,
  WeeklyReportData,
  IndexData,
} from "../types/data";

export function useIndex() {
  const [data, setData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIndex() {
      try {
        setLoading(true);
        const response = await fetch("/data/index.json");
        if (!response.ok) {
          throw new Error("Index not found");
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load index");
      } finally {
        setLoading(false);
      }
    }
    fetchIndex();
  }, []);

  return { data, loading, error };
}

export function useDailyData(date: string) {
  const [data, setData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let targetDate = date;

        // Handle "latest" alias
        if (date === "latest") {
          const indexResponse = await fetch("/data/index.json");
          if (!indexResponse.ok)
            throw new Error("Could not fetch index for latest report");
          const indexData: IndexData = await indexResponse.json();
          if (!indexData.latest.daily)
            throw new Error("No daily reports available");
          targetDate = indexData.latest.daily;
        }

        // Assuming data is served at /data/daily/YYYY-MM-DD.json
        const response = await fetch(`/data/daily/${targetDate}.json`);
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
        let targetWeek = week;

        // Handle "latest" alias for weekly
        if (week === "latest") {
          const indexResponse = await fetch("/data/index.json");
          if (!indexResponse.ok)
            throw new Error("Could not fetch index for latest report");
          const indexData: IndexData = await indexResponse.json();
          if (!indexData.latest.weekly)
            throw new Error("No weekly reports available");
          targetWeek = indexData.latest.weekly;
        }

        const response = await fetch(`/data/weekly/${targetWeek}.json`);
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
