import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

function safeDate(d: string | null | undefined): string | null {
  return (!d || d.trim() === '') ? null : d.trim();
}

// GET /api/victims — All victims (supports ?search=name)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query as { search?: string };
    const params: any[] = [];
    let whereClause = '';
    if (search) {
      whereClause = `WHERE LOWER(V.household_head_name) LIKE :search1 OR LOWER(V.victim_id) LIKE :search2`;
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s);
    }
    const rows = await query(`
      SELECT
        V.victim_id,
        V.household_head_name,
        V.gender,
        V.nid_number,
        V.reported_date,
        V.last_known_location,
        V.missing_person,
        V.special_needs,
        V.disaster_name,
        D.disaster_type,
        D.division
      FROM VICTIM V
      JOIN DISASTER_EVENT D ON V.disaster_name = D.disaster_name
      ${whereClause}
      ORDER BY V.reported_date DESC
    `, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch victims' });
  }
});

// GET /api/victims/:id — Single victim with family members and phones
router.get('/:id', async (req, res) => {
  try {
    const [victim] = await query(
      `SELECT V.*, D.disaster_type, D.division
       FROM VICTIM V JOIN DISASTER_EVENT D ON V.disaster_name = D.disaster_name
       WHERE V.victim_id = :id`,
      [req.params.id]
    );
    if (!victim) return res.status(404).json({ error: 'Victim not found' });

    const phonesRows = await query<{ PHONE: string }>(
      `SELECT phone FROM VICTIM_PHONE WHERE victim_id = :id ORDER BY phone`,
      [req.params.id]
    );
    const family = await query(
      `SELECT member_seq_no, name FROM FAMILY_MEMBER WHERE victim_id = :id ORDER BY member_seq_no`,
      [req.params.id]
    );

    res.json({
      data: {
        ...victim,
        phones: phonesRows.map((r) => r.PHONE),
        family_members: family,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch victim' });
  }
});


// POST /api/victims — Register new victim (BUG-06 fix: null date handling)
router.post('/', async (req, res) => {
  const { victim_id, household_head_name, gender, nid_number, reported_date,
          last_known_location, missing_person, special_needs, disaster_name, phones, family_members } = req.body;

  if (!victim_id || !household_head_name || !disaster_name) {
    return res.status(422).json({ error: 'Missing required fields: victim_id, household_head_name, disaster_name' });
  }

  const safeDateReported = safeDate(reported_date);

  try {
    await query(
      `INSERT INTO VICTIM (victim_id, household_head_name, gender, nid_number, reported_date, last_known_location, missing_person, special_needs, disaster_name)
       VALUES (:victim_id, :household_head_name, :gender, :nid_number,
         CASE WHEN :reported_date IS NULL THEN SYSDATE ELSE TO_DATE(:reported_date, 'YYYY-MM-DD') END,
         :last_known_location, :missing_person, :special_needs, :disaster_name)`,
      [victim_id, household_head_name, gender || null, nid_number || null,
       safeDateReported, safeDateReported,
       last_known_location || null, missing_person || 'N', special_needs || null, disaster_name]
    );

    // Insert phones (multivalued attribute)
    if (phones && Array.isArray(phones)) {
      for (const phone of phones) {
        if (phone && phone.trim()) {
          await query(
            `INSERT INTO VICTIM_PHONE (victim_id, phone) VALUES (:victim_id, :phone)`,
            [victim_id, phone.trim()]
          );
        }
      }
    }

    // Insert family members (weak entity)
    if (family_members && Array.isArray(family_members)) {
      for (let i = 0; i < family_members.length; i++) {
        if (family_members[i] && family_members[i].trim()) {
          await query(
            `INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES (:victim_id, :seq, :name)`,
            [victim_id, i + 1, family_members[i].trim()]
          );
        }
      }
    }

    res.status(201).json({ message: 'Victim registered', victim_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Victim ID or NID already exists' });
    res.status(500).json({ error: 'Failed to register victim' });
  }
});

export default router;
