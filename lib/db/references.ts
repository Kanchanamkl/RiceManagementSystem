import { query } from './connection';

export async function getRiceTypes() {
  const result = await query(
    'SELECT * FROM rice_types ORDER BY name'
  );

  return result.rows;
}

export async function getDistricts() {
  const result = await query(
    'SELECT * FROM districts ORDER BY name'
  );

  return result.rows;
}

export async function getSeasons() {
  const result = await query(
    'SELECT * FROM seasons ORDER BY start_date DESC'
  );

  return result.rows;
}
