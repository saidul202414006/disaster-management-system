import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

function safeDate(d: string | null | undefined): string | null {
  return (!d || d.trim() === '') ? null : d.trim();
}

// GET /api/distributions — Distribution log (DISTRIBUTES aggregation pattern)
// DISTRIBUTION (inner) ↔ WAREHOUSE + PERSONNEL + VEHICLE (outer, optional)
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        D.distribution_id,
        D.distribution_date,
        D.quantity,
        W.warehouse_id,
        W.warehouse_name,
        P.person_id,
        P.name AS personnel_name,
        VD.vehicle_id,
        V.vehicle_type,
        V.registration_no
      FROM DISTRIBUTION D
      JOIN WAREHOUSE W ON D.warehouse_id = W.warehouse_id
      JOIN PERSONNEL P ON D.person_id = P.person_id
      LEFT JOIN VEHICLE_DISTRIBUTION VD ON D.distribution_id = VD.distribution_id
      LEFT JOIN VEHICLE V ON VD.vehicle_id = V.vehicle_id
      ORDER BY D.distribution_date DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch distributions' });
  }
});

// POST /api/distributions — Record a distribution (BUG-05 fix: null date)
router.post('/', async (req, res) => {
  const { distribution_id, warehouse_id, person_id, distribution_date, quantity, vehicle_id } = req.body;
  if (!distribution_id || !warehouse_id || !person_id || !quantity) {
    return res.status(422).json({ error: 'Missing required fields: distribution_id, warehouse_id, person_id, quantity' });
  }

  const safeDistDate = safeDate(distribution_date) || new Date().toISOString().slice(0, 10);

  try {
    // Insert into DISTRIBUTION (inner aggregation table: WAREHOUSE manages PERSONNEL)
    await query(
      `INSERT INTO DISTRIBUTION (distribution_id, warehouse_id, person_id, distribution_date, quantity)
       VALUES (:distribution_id, :warehouse_id, :person_id, TO_DATE(:distribution_date, 'YYYY-MM-DD'), :quantity)`,
      [distribution_id, warehouse_id, person_id, safeDistDate, quantity]
    );

    // If a vehicle was used: record in VEHICLE_DISTRIBUTION (outer aggregation relation)
    if (vehicle_id && vehicle_id.trim()) {
      await query(
        `INSERT INTO VEHICLE_DISTRIBUTION (vehicle_id, distribution_id) VALUES (:vehicle_id, :distribution_id)`,
        [vehicle_id.trim(), distribution_id]
      );
    }

    res.status(201).json({ message: 'Distribution recorded', distribution_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Distribution ID already exists' });
    res.status(500).json({ error: 'Failed to record distribution' });
  }
});

export default router;
