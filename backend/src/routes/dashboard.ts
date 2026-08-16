import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/dashboard — All KPI data for the dashboard in one call
router.get('/', async (req, res) => {
  try {
    // Single query for all KPIs using subselects from DUAL (Oracle pattern)
    const [counts] = await query<{
      TOTAL_DISASTERS: number;
      ACTIVE_DISASTERS: number;
      TOTAL_VICTIMS: number;
      MISSING_VICTIMS: number;
      TOTAL_SHELTERS: number;
      TOTAL_PERSONNEL: number;
      TOTAL_WAREHOUSES: number;
      TOTAL_VEHICLES: number;
      AVAILABLE_VEHICLES: number;
      TOTAL_DONATIONS: number;
      TOTAL_DISTRIBUTIONS: number;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM DISASTER_EVENT)                          AS TOTAL_DISASTERS,
        (SELECT COUNT(*) FROM DISASTER_EVENT WHERE end_date IS NULL)   AS ACTIVE_DISASTERS,
        (SELECT COUNT(*) FROM VICTIM)                                  AS TOTAL_VICTIMS,
        (SELECT COUNT(*) FROM VICTIM WHERE missing_person = 'Y')       AS MISSING_VICTIMS,
        (SELECT COUNT(*) FROM SHELTER)                                 AS TOTAL_SHELTERS,
        (SELECT COUNT(*) FROM PERSONNEL)                               AS TOTAL_PERSONNEL,
        (SELECT COUNT(*) FROM WAREHOUSE)                               AS TOTAL_WAREHOUSES,
        (SELECT COUNT(*) FROM VEHICLE)                                 AS TOTAL_VEHICLES,
        (SELECT COUNT(*) FROM VEHICLE WHERE availability_status = 'Available') AS AVAILABLE_VEHICLES,
        (SELECT COUNT(*) FROM DONATION)                                AS TOTAL_DONATIONS,
        (SELECT COUNT(*) FROM DISTRIBUTION)                            AS TOTAL_DISTRIBUTIONS
      FROM DUAL
    `);

    // Recent disasters (last 5)
    const recentDisasters = await query(`
      SELECT disaster_name, disaster_type, division, district, start_date, end_date,
             (end_date - start_date) AS duration_days
      FROM DISASTER_EVENT
      ORDER BY start_date DESC
      FETCH FIRST 5 ROWS ONLY
    `);

    // Shelter capacity overview (top 5)
    const shelterStats = await query(`
      SELECT
        SH.shelter_id, SH.shelter_name, SH.capacity,
        COUNT(VSS.victim_id) AS current_occupancy,
        (SH.capacity - COUNT(VSS.victim_id)) AS available_capacity
      FROM SHELTER SH
      LEFT JOIN VICTIM_SHELTER_STAY VSS ON SH.shelter_id = VSS.shelter_id AND VSS.checkout_date IS NULL
      GROUP BY SH.shelter_id, SH.shelter_name, SH.capacity
      ORDER BY (SH.capacity - COUNT(VSS.victim_id)) ASC
      FETCH FIRST 5 ROWS ONLY
    `);

    res.json({
      data: {
        kpis: counts,
        recent_disasters: recentDisasters,
        shelter_stats: shelterStats,
      }
    });
  } catch (err: any) {
    const msg = process.env.NODE_ENV === 'development' ? err.message : 'Failed to fetch dashboard data';
    res.status(500).json({ error: msg });
  }
});

export default router;
