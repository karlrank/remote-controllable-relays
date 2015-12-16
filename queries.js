
module.exports = {
    tokens: {
        create: `
            CREATE TABLE IF NOT EXISTS tokens (
                id INTEGER PRIMARY KEY,
                created DATETIME DEFAULT (datetime('now')),
                remote_address TEXT,
                user_agent TEXT,
                token TEXT NOT NULL
            );`,
        all: `SELECT * FROM tokens;`,
        getToken: `
        SELECT * FROM tokens
        WHERE token = ?
        `,
        newToken: `
        INSERT INTO tokens
        (remote_address, user_agent, token)
        VALUES (?, ?, ?);
        `
    }
};