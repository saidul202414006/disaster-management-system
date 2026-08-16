import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// ─────────────────────────────────────────────
// IMPORTANT: /checkin MUST come before /:id
// Otherwise Express matches "checkin" as the :id parameter
// ─────────────────────────────────────────────

// POST /api/shelters/checkin — Victim checks into shelter (BUG-03 fix: before /:id)
router.post('/checkin', async (req, res) => {
  const { victim_id, shelter_id, checkin_date } = req.body;
  if (!victim_id || !shelter_id) return res.status(422).json({ error: 'Missing required fields' });
  try {
    const date = checkin_date || new Date().toISOString().slice(0, 10);
    await query(
      `INSERT INTO VICTIM_SHELTER_STAY (victim_id, shelter_id, checkin_date)
       VALUES (:victim_id, :shelter_id, TO_DATE(:checkin_date, 'YYYY-MM-DD'))`,
      [victim_id, shelter_id, date]
    );
    res.status(201).json({ message: 'Victim checked in', victim_id, shelter_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Victim already checked into this shelter' });
    res.status(500).json({ error: 'Failed to check in victim' });
  }
});

// POST /api/shelters/checkout — Victim checks out of shelter
router.post('/checkout', async (req, res) => {
  const { victim_id, shelter_id, checkout_date } = req.body;
  if (!victim_id || !shelter_id) return res.status(422).json({ error: 'Missing required fields' });
  try {
    const date = checkout_date || new Date().toISOString().slice(0, 10);
    await query(
      `UPDATE VICTIM_SHELTER_STAY
       SET checkout_date = TO_DATE(:checkout_date, 'YYYY-MM-DD')
       WHERE victim_id = :victim_id AND shelter_id = :shelter_id AND checkout_date IS NULL`,
      [date, victim_id, shelter_id]
    );
    res.json({ message: 'Victim checked out' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check out victim' });
  }
});

// GET /api/shelters — All shelters with derived available_capacity
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        SH.shelter_id,
        SH.shelter_name,
        SH.current_status,
        SH.contact_person_name,
        SH.contact_person_phone,
        SH.address_line,
        SH.longitude,
        SH.latitude,
        SH.capacity,
        SH.disaster_name,
        D.division,
        D.district,
        COUNT(VSS.victim_id) AS current_occupancy,
        (SH.capacity - COUNT(VSS.victim_id)) AS available_capacity
      FROM SHELTER SH
      LEFT JOIN DISASTER_EVENT D ON SH.disaster_name = D.disaster_name
      LEFT JOIN VICTIM_SHELTER_STAY VSS ON SH.shelter_id = VSS.shelter_id AND VSS.checkout_date IS NULL
      GROUP BY
        SH.shelter_id, SH.shelter_name, SH.current_status,
        SH.contact_person_name, SH.contact_person_phone,
        SH.address_line, SH.longitude, SH.latitude,
        SH.capacity, SH.disaster_name, D.division, D.district
      ORDER BY SH.shelter_name
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shelters' });
  }
});

// GET /api/shelters/:id — Single shelter with current victims
router.get('/:id', async (req, res) => {
  try {
    const [shelter] = await query(
      `SELECT SH.*,
              NVL(D.division, 'N/A') AS division,
              NVL(D.district, 'N/A') AS district,
              (SH.capacity - NVL((SELECT COUNT(*) FROM VICTIM_SHELTER_STAY VSS WHERE VSS.shelter_id = SH.shelter_id AND VSS.checkout_date IS NULL), 0)) AS available_capacity
       FROM SHELTER SH
       LEFT JOIN DISASTER_EVENT D ON SH.disaster_name = D.disaster_name
       WHERE SH.shelter_id = :id`,
      [req.params.id]
    );
    if (!shelter) return res.status(404).json({ error: 'Shelter not found' });

    const victims = await query(
      `SELECT V.victim_id, V.household_head_name, VSS.checkin_date
       FROM VICTIM_SHELTER_STAY VSS
       JOIN VICTIM V ON VSS.victim_id = V.victim_id
       WHERE VSS.shelter_id = :id AND VSS.checkout_date IS NULL
       ORDER BY VSS.checkin_date`,
      [req.params.id]
    );

    res.json({ data: { ...shelter, current_victims: victims } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shelter' });
  }
});

// POST /api/shelters — Create shelter
router.post('/', async (req, res) => {
  const { shelter_id, shelter_name, current_status, contact_person_name,
          contact_person_phone, address_line, longitude, latitude, capacity, disaster_name } = req.body;
  if (!shelter_id || !shelter_name || !capacity) {
    return res.status(422).json({ error: 'Missing required fields: shelter_id, shelter_name, capacity' });
  }
  try {
    await query(
      `INSERT INTO SHELTER (shelter_id, shelter_name, current_status, contact_person_name, contact_person_phone, address_line, longitude, latitude, capacity, disaster_name)
       VALUES (:shelter_id, :shelter_name, :current_status, :contact_person_name, :contact_person_phone, :address_line, :longitude, :latitude, :capacity, :disaster_name)`,
      [shelter_id, shelter_name, current_status || 'Open', contact_person_name || null,
       contact_person_phone || null, address_line || null, longitude || null,
       latitude || null, capacity, disaster_name || null]
    );
    res.status(201).json({ message: 'Shelter created', shelter_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Shelter ID already exists' });
    res.status(500).json({ error: 'Failed to create shelter' });
  }
});

// GET /api/shelters/stays/:victim_id — Shelter stay history for a victim
router.get('/stays/:victim_id', async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        VSS.victim_id,
        VSS.shelter_id,
        VSS.checkin_date,
        VSS.checkout_date,
        S.shelter_name,
        S.current_status,
        S.address_line,
        S.contact_person_phone
      FROM VICTIM_SHELTER_STAY VSS
      JOIN SHELTER S ON VSS.shelter_id = S.shelter_id
      WHERE VSS.victim_id = :victim_id
      ORDER BY VSS.checkin_date DESC
    `, [req.params.victim_id]);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shelter stays' });
  }
});

export default router;

