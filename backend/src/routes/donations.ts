import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/donations — All donations with warehouse info
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        D.donation_id,
        D.donor_name,
        D.donor_id,
        D.contact_info,
        D.donation_type,
        D.amount_or_value,
        D.donation_date,
        D.warehouse_id,
        W.warehouse_name
      FROM DONATION D
      JOIN WAREHOUSE W ON D.warehouse_id = W.warehouse_id
      ORDER BY D.donation_date DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// POST /api/donations — Record new donation
router.post('/', async (req, res) => {
  const { donation_id, donor_name, donor_id, contact_info,
          donation_type, amount_or_value, donation_date, warehouse_id } = req.body;
  if (!donation_id || !donor_name || !donation_type || !warehouse_id) {
    return res.status(422).json({ error: 'Missing required fields' });
  }
  try {
    await query(
      `INSERT INTO DONATION (donation_id, donor_name, donor_id, contact_info, donation_type, amount_or_value, donation_date, warehouse_id)
       VALUES (:donation_id, :donor_name, :donor_id, :contact_info, :donation_type, :amount_or_value, TO_DATE(:donation_date, 'YYYY-MM-DD'), :warehouse_id)`,
      [donation_id, donor_name, donor_id, contact_info, donation_type, amount_or_value, donation_date, warehouse_id]
    );
    res.status(201).json({ message: 'Donation recorded', donation_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Donation ID already exists' });
    res.status(500).json({ error: 'Failed to record donation' });
  }
});

export default router;
