const pool = require("./db");

function printUsage() {
  console.log(
    'Usage: node insert.js "Title" "Description" release_year "Genre"'
  );
  console.log(
    'Example: node insert.js "Inception" "A mind-bending thriller about dreams." 2010 "Sci-Fi"'
  );
}

async function insertMovie(movie) {
  const { title, description, release_year, genre } = movie;

  if (!title || !description || !release_year || !genre) {
    throw new Error("title, description, release_year, and genre are required");
  }

  const releaseYear = Number(release_year);

  if (!Number.isInteger(releaseYear)) {
    throw new Error("release_year must be a valid number");
  }

  const query = `
    INSERT INTO movies (title, description, release_year, genre)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [title, description, releaseYear, genre];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function runFromCommandLine() {
  const [title, description, releaseYearInput, genre] = process.argv.slice(2);

  if (!title || !description || !releaseYearInput || !genre) {
    printUsage();
    process.exitCode = 1;
    await pool.end();
    return;
  }

  try {
    const movie = await insertMovie({
      title,
      description,
      release_year: releaseYearInput,
      genre,
    });
    console.log("Inserted Movie:", movie);
  } catch (err) {
    console.error("Error inserting data:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runFromCommandLine();
}

module.exports = insertMovie;
