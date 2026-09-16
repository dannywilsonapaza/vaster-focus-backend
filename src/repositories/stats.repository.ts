import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export interface DailyStudyRow {
  study_day: string;
  total_seconds: number;
  break_seconds: number;
  session_count: number;
}

export interface AllTimeSummaryRow {
  total_work_seconds: number;
  total_break_seconds: number;
  total_sessions: number;
}

export class StatsRepository {
  async getDailyStats(
    userId: string,
    from?: string,
    to?: string,
    limit: number = 30
  ): Promise<DailyStudyRow[]> {
    const conditions = [
      Prisma.sql`"userId" = ${userId}`,
      Prisma.sql`"status" = 'COMPLETED'::"SessionStatus"`,
    ];

    if (from) {
      conditions.push(
        Prisma.sql`(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Lima')::date >= ${from}::date`
      );
    }

    if (to) {
      conditions.push(
        Prisma.sql`(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Lima')::date <= ${to}::date`
      );
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    return prisma.$queryRaw<DailyStudyRow[]>`
      SELECT 
        TO_CHAR(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS study_day,
        COALESCE(SUM(CASE WHEN "type" = 'WORK'::"SessionType" THEN "durationSeconds" ELSE 0 END), 0)::int AS total_seconds,
        COALESCE(SUM(CASE WHEN "type" != 'WORK'::"SessionType" THEN "durationSeconds" ELSE 0 END), 0)::int AS break_seconds,
        COUNT(CASE WHEN "type" = 'WORK'::"SessionType" THEN 1 END)::int AS session_count
      FROM "Session"
      ${whereClause}
      GROUP BY study_day
      ORDER BY study_day DESC
      LIMIT ${limit};
    `;
  }

  async getAllCompletedWorkStudyDays(userId: string): Promise<string[]> {
    const rows = await prisma.$queryRaw<{ study_day: string }[]>`
      SELECT DISTINCT
        TO_CHAR(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS study_day
      FROM "Session"
      WHERE "userId" = ${userId}
        AND "status" = 'COMPLETED'::"SessionStatus"
        AND "type" = 'WORK'::"SessionType"
        AND "durationSeconds" > 0
      ORDER BY study_day ASC;
    `;

    return rows.map((r) => r.study_day);
  }

  async getAllTimeSummary(userId: string): Promise<AllTimeSummaryRow> {
    const rows = await prisma.$queryRaw<AllTimeSummaryRow[]>`
      SELECT 
        COALESCE(SUM(CASE WHEN "type" = 'WORK'::"SessionType" THEN "durationSeconds" ELSE 0 END), 0)::int AS total_work_seconds,
        COALESCE(SUM(CASE WHEN "type" != 'WORK'::"SessionType" THEN "durationSeconds" ELSE 0 END), 0)::int AS total_break_seconds,
        COUNT(CASE WHEN "type" = 'WORK'::"SessionType" THEN 1 END)::int AS total_sessions
      FROM "Session"
      WHERE "userId" = ${userId}
        AND "status" = 'COMPLETED'::"SessionStatus";
    `;

    return (
      rows[0] || {
        total_work_seconds: 0,
        total_break_seconds: 0,
        total_sessions: 0,
      }
    );
  }
}

export const statsRepository = new StatsRepository();
