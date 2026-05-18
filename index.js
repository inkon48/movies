const express = require('express');
const pool = require('./db');
const insertMovie = require('./insert');


const app = express();

app.use(express.json());

app.get("/", async(req, res) => {
    res.send("<p>Welcome</p>");
});

app.get("/api/movies", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM movies");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching movies:", err);
        res.status(500).json({ error: "Failed to fetch movies" });
    }
});


app.get("/api/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "id must be a valid number" });
    }

    try {
        const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching movie:", err);
        res.status(500).json({ error: "Failed to fetch movie" });
    }
});


app.post("/api/movies", async (req, res) => {
    try {
        const movie = await insertMovie(req.body);
        res.status(201).json(movie);
    } catch (err) {
        console.error("Error creating movie:", err);

        if (
            err.message === "title, description, release_year, and genre are required" ||
            err.message === "release_year must be a valid number"
        ) {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: "Failed to create movie" });
    }
});


app.delete("/api/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "id must be a valid number" });
    }

    try {
        const result = await pool.query("DELETE FROM movies WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.json({
            message: "Movie deleted successfully",
            movie: result.rows[0],
        });
    } catch (err) {
        console.error("Error deleting movie:", err);
        res.status(500).json({ error: "Failed to delete movie" });
    }
});



app.put("/api/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { title, description, release_year, genre } = req.body;

    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "id must be a valid number" });
    }

    if (!title || !description || !release_year || !genre) {
        return res.status(400).json({
            error: "title, description, release_year, and genre are required"
        });
    }

    const releaseYear = Number(release_year);

    if (!Number.isInteger(releaseYear)) {
        return res.status(400).json({
            error: "release_year must be a valid number"
        });
    }

    const query = `
        UPDATE movies
        SET title = $1,
            description = $2,
            release_year = $3,
            genre = $4
        WHERE id = $5
        RETURNING *;
    `;

    const values = [title, description, releaseYear, genre, id];

    try {
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating movie:", err);
        res.status(500).json({ error: "Failed to update movie" });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
