import { StatsRepository, statsRepository } from '../repositories/stats.repository.js';
import { DailyStatsQueryInput } from '../schemas/stats.schema.js';

export interface DailyStatItem {
  studyDay: string;
  totalSeconds: number;
  breakSeconds: number;
  sessionCount: number;
}

export interface StatsSummary {
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  totalSessions: number;
  currentStreak: number;
  bestStreak: number;
  studiedToday: boolean;
}

export function getLimaDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

export function shiftDayString(dateStr: string, offsetDays: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function calculateStreaks(
  studyDaysAscending: string[],
  referenceDate: Date = new Date()
): { currentStreak: number; bestStreak: number; studiedToday: boolean } {
  if (studyDaysAscending.length === 0) {
    return { currentStreak: 0, bestStreak: 0, studiedToday: false };
  }

  const daySet = new Set(studyDaysAscending);
  const todayStr = getLimaDateString(referenceDate);
  const yesterdayStr = shiftDayString(todayStr, -1);

  const studiedToday = daySet.has(todayStr);

  // 1. Current streak calculation (with grace window)
  let currentStreak = 0;
  let startCheckDay = '';

  if (studiedToday) {
    startCheckDay = todayStr;
  } else if (daySet.has(yesterdayStr)) {
    // Grace window: studied yesterday, today still has time
    startCheckDay = yesterdayStr;
  }

  if (startCheckDay) {
    let checkDay = startCheckDay;
    while (daySet.has(checkDay)) {
      currentStreak++;
      checkDay = shiftDayString(checkDay, -1);
    }
  }

  // 2. Best streak calculation across all recorded days
  let bestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < studyDaysAscending.length; i++) {
    const prevDay = studyDaysAscending[i - 1];
    const currDay = studyDaysAscending[i];
    const expectedCurr = shiftDayString(prevDay, 1);

    if (currDay === expectedCurr) {
      runningStreak++;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
    } else if (currDay !== prevDay) {
      runningStreak = 1;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    studiedToday,
  };
}

export class StatsService {
  constructor(private repo: StatsRepository = statsRepository) {}

  async getDailyStats(
    userId: string,
    query: DailyStatsQueryInput
  ): Promise<DailyStatItem[]> {
    const rows = await this.repo.getDailyStats(
      userId,
      query.from,
      query.to,
      query.limit
    );

    return rows.map((r) => ({
      studyDay: r.study_day,
      totalSeconds: Number(r.total_seconds),
      breakSeconds: Number(r.break_seconds),
      sessionCount: Number(r.session_count),
    }));
  }

  async getSummary(userId: string, referenceDate: Date = new Date()): Promise<StatsSummary> {
    const [allTime, studyDays] = await Promise.all([
      this.repo.getAllTimeSummary(userId),
      this.repo.getAllCompletedWorkStudyDays(userId),
    ]);

    const streaks = calculateStreaks(studyDays, referenceDate);

    return {
      totalWorkSeconds: Number(allTime.total_work_seconds),
      totalBreakSeconds: Number(allTime.total_break_seconds),
      totalSessions: Number(allTime.total_sessions),
      currentStreak: streaks.currentStreak,
      bestStreak: streaks.bestStreak,
      studiedToday: streaks.studiedToday,
    };
  }
}

export const statsService = new StatsService();
