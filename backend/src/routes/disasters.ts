import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// Helper: safely convert date string to Oracle-compatible value
// Returns null if date is empty/undefined, otherwise passes the string
function safeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  return dateStr.trim();
}

// GET /api/disasters — All disaster events (supports ?type=Flood&division=Sylhet&status=active&search=...)
router.get('/', async (req, res) => {
  try {
    const { type, division, status, search } = req.query as Record<string, string>;
    const conditions: string[] = [];
    const params: any[] = [];

    if (type && type !== 'all') {
      conditions.push(`disaster_type = :type`);
      params.push(type);
    }
    if (division && division !== 'all') {
      conditions.push(`division = :division`);
      params.push(division);
    }
    if (status === 'active') {
      conditions.push(`end_date IS NULL`);
    } else if (status === 'resolved') {
      conditions.push(`end_date IS NOT NULL`);
    }
    if (search) {
      conditions.push(`(LOWER(disaster_name) LIKE :search1 OR LOWER(division) LIKE :search2 OR LOWER(district) LIKE :search3)`);
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await query(`
      SELECT
        disaster_name,
        disaster_type,
        division,
        district,
        start_date,
        end_date,
        (end_date - start_date) AS duration_days
      FROM DISASTER_EVENT
      ${whereClause}
      ORDER BY start_date DESC
    `, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disasters' });
  }
});

// GET /api/disasters/:name — Single disaster with victim/shelter counts
router.get('/:name', async (req, res) => {
  try {
    const [disaster] = await query(
      `SELECT disaster_name, disaster_type, division, district, start_date, end_date,
              (end_date - start_date) AS duration_days
       FROM DISASTER_EVENT
       WHERE disaster_name = :name`,
      [req.params.name]
    );
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });

    const [{ TOTAL_VICTIMS }] = await query<{ TOTAL_VICTIMS: number }>(
      `SELECT COUNT(victim_id) AS TOTAL_VICTIMS FROM VICTIM WHERE disaster_name = :name`,
      [req.params.name]
    );
    const [{ TOTAL_SHELTERS }] = await query<{ TOTAL_SHELTERS: number }>(
      `SELECT COUNT(shelter_id) AS TOTAL_SHELTERS FROM SHELTER WHERE disaster_name = :name`,
      [req.params.name]
    );

    res.json({ data: { ...disaster, total_victims: TOTAL_VICTIMS, total_shelters: TOTAL_SHELTERS } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disaster' });
  }
});

// POST /api/disasters — Create new disaster (BUG-04 fix: safe NULL date handling)
router.post('/', async (req, res) => {
  const { disaster_name, disaster_type, division, district, start_date, end_date } = req.body;
  if (!disaster_name || !disaster_type || !division || !district || !start_date) {
    return res.status(422).json({ error: 'Missing required fields: disaster_name, disaster_type, division, district, start_date' });
  }

  const safeEndDate = safeDate(end_date);

  try {
    await query(
      // BUG-04 fix: Use CASE to handle null end_date safely in Oracle
      `INSERT INTO DISASTER_EVENT (disaster_name, disaster_type, division, district, start_date, end_date)
       VALUES (
         :disaster_name, :disaster_type, :division, :district,
         TO_DATE(:start_date, 'YYYY-MM-DD'),
         CASE WHEN :end_date IS NULL THEN NULL ELSE TO_DATE(:end_date, 'YYYY-MM-DD') END
       )`,
      [disaster_name, disaster_type, division, district, start_date, safeEndDate, safeEndDate]
    );
    res.status(201).json({ message: 'Disaster event created', disaster_name });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'A disaster with this name already exists' });
    res.status(500).json({ error: 'Failed to create disaster' });
  }
});

// PUT /api/disasters/:name — Update disaster (e.g. mark end_date to close it)
router.put('/:name', async (req, res) => {
  const { end_date, disaster_type, division, district } = req.body;
  const safeEndDate = safeDate(end_date);
  try {
    await query(
      `UPDATE DISASTER_EVENT
       SET end_date = CASE WHEN :end_date IS NULL THEN NULL ELSE TO_DATE(:end_date, 'YYYY-MM-DD') END,
           disaster_type = :disaster_type,
           division = :division,
           district = :district
       WHERE disaster_name = :name`,
      [safeEndDate, safeEndDate, disaster_type, division, district, req.params.name]
    );
    res.json({ message: 'Disaster updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update disaster' });
  }
});

export default router;
