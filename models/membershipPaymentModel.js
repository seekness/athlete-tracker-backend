const dbPool = require("../db/pool");

async function fetchEligibleAthletes(userId, role) {
  const query = `
    (
      SELECT DISTINCT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja
      FROM athletes a
      JOIN group_memberships gm ON a.id = gm.athlete_id
      JOIN program_group_assignments pga ON gm.group_id = pga.group_id
      WHERE a.aktivan = 1 AND (? = 'admin' OR
        pga.group_id IN (
          SELECT group_id FROM coach_group_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        )
      )
    )
    UNION
    (
      SELECT DISTINCT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja
      FROM athletes a
      JOIN program_athlete_assignments paa ON a.id = paa.athlete_id
      WHERE a.aktivan = 1 AND (? = 'admin' OR
        paa.athlete_id IN (
          SELECT athlete_id FROM coach_athlete_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        )
      )
    )
    ORDER BY prezime, ime
  `;
  const params = [role, userId, role, userId];
  const [rows] = await dbPool.query(query, params);
  return rows;
}

async function fetchMonthlyPayments(userId, role) {
  const query = `
    SELECT
      a.id AS athlete_id,
      a.ime,
      a.prezime,
      mp.payment_date,
      mp.payment_month,
      mp.amount_paid,
      mp.child_order,
      mp.note
    FROM athletes a
    JOIN membership_payments mp ON a.id = mp.athlete_id
    WHERE (
      ? = 'admin' OR
      a.id IN (
        SELECT gm.athlete_id
        FROM group_memberships gm
        JOIN coach_group_assignments cga ON gm.group_id = cga.group_id
        WHERE cga.coach_id = (SELECT id FROM trainers WHERE user_id = ?)
          AND a.aktivan = 1 AND a.is_paying_member = 1
      ) OR
      a.id IN (
        SELECT paa.athlete_id
        FROM program_athlete_assignments paa
        JOIN coach_athlete_assignments caa ON paa.athlete_id = caa.athlete_id
        WHERE caa.coach_id = (SELECT id FROM trainers WHERE user_id = ?)
          AND a.aktivan = 1 AND a.is_paying_member = 1
      )
    )
    ORDER BY a.prezime, a.ime, mp.payment_month DESC
  `;
  const params = [role, userId, userId];
  const [rows] = await dbPool.query(query, params);
  return rows;
}

async function insertPayment(data) {
  const [result] = await dbPool.query(
    `INSERT INTO membership_payments (athlete_id, payment_date, amount_paid, child_order, note, payment_month)
     VALUES (?, CURDATE(), ?, ?, ?, ?)`,
    [
      data.athlete_id,
      data.amount_paid,
      data.child_order,
      data.note,
      data.payment_month
    ]
  );
  return result.insertId;
}

async function fetchPaymentById(id) {
  const [rows] = await dbPool.query("SELECT * FROM membership_payments WHERE id = ?", [id]);
  return rows[0];
}

async function deletePaymentById(id) {
  await dbPool.query("DELETE FROM membership_payments WHERE id = ?", [id]);
}

module.exports = {
  fetchEligibleAthletes,
  fetchMonthlyPayments,
  insertPayment,
  deletePaymentById,
  fetchPaymentById
};
  