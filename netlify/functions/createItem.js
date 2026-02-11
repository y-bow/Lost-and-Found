import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method not allowed'
    };
  }

  try {
    const {
      type,
      category,
      title,
      description,
      location,
      date,
      contactName,
      contactNumber
    } = JSON.parse(event.body);

    const query = `
      INSERT INTO items 
      (type, category, title, description, location, date, contact_name, contact_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      type,
      category,
      title,
      description,
      location,
      date,
      contactName,
      contactNumber
    ]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result.rows[0]),
    };

  } catch (error) {
    console.error("Create Item Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
