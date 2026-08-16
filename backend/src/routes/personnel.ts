import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/personnel — All personnel with supervisor info
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        E.person_id,
        E.name,
        E.phone,
        E.designation,
        E.base_location,
        E.supervisor_id,
        M.name AS supervisor_name,
        CASE WHEN V.person_id IS NOT NULL THEN 'Volunteer'
             WHEN MS.person_id IS NOT NULL THEN 'Medical Staff'
             ELSE 'Personnel' END AS personnel_type,
        V.team AS volunteer_team,
        MS.specialization AS medical_specialization
      FROM PERSONNEL E
      LEFT JOIN PERSONNEL M ON E.supervisor_id = M.person_id
      LEFT JOIN VOLUNTEER V ON E.person_id = V.person_id
      LEFT JOIN MEDICAL_STAFF MS ON E.person_id = MS.person_id
      ORDER BY E.name
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
});

// GET /api/personnel/volunteers — All volunteers (ISA sub-entity)
router.get('/volunteers', async (req, res) => {
  try {
    const rows = await query(`
      SELECT P.person_id, P.name, P.phone, P.designation, P.base_location, V.team
      FROM VOLUNTEER V
      JOIN PERSONNEL P ON V.person_id = P.person_id
      ORDER BY P.name
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// GET /api/personnel/medical — All medical staff (ISA sub-entity)
router.get('/medical', async (req, res) => {
  try {
    const rows = await query(`
      SELECT P.person_id, P.name, P.phone, P.designation, P.base_location, MS.specialization, MS.since_date
      FROM MEDICAL_STAFF MS
      JOIN PERSONNEL P ON MS.person_id = P.person_id
      ORDER BY P.name
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medical staff' });
  }
});

// POST /api/personnel — Create personnel
router.post('/', async (req, res) => {
  const { person_id, name, phone, designation, base_location, supervisor_id,
          type, team, specialization, since_date } = req.body;
  if (!person_id || !name) return res.status(422).json({ error: 'Missing required fields' });

  try {
    // Insert base personnel record
    await query(
      `INSERT INTO PERSONNEL (person_id, name, phone, designation, base_location, supervisor_id)
       VALUES (:person_id, :name, :phone, :designation, :base_location, :supervisor_id)`,
      [person_id, name, phone, designation, base_location, supervisor_id || null]
    );

    // If volunteer: also insert into VOLUNTEER (ISA)
    if (type === 'volunteer') {
      await query(
        `INSERT INTO VOLUNTEER (person_id, team) VALUES (:person_id, :team)`,
        [person_id, team]
      );
    }
    // If medical staff: also insert into MEDICAL_STAFF (ISA)
    if (type === 'medical') {
      await query(
        `INSERT INTO MEDICAL_STAFF (person_id, specialization, since_date)
         VALUES (:person_id, :specialization, TO_DATE(:since_date, 'YYYY-MM-DD'))`,
        [person_id, specialization, since_date]
      );
    }

    res.status(201).json({ message: 'Personnel created', person_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Person ID already exists' });
    res.status(500).json({ error: 'Failed to create personnel' });
  }
});

export default router;
