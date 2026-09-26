// Help Message Model - PostgreSQL / Neon Data Access
const { query } = require('../config/db');

class HelpMessage {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.email = data.email || '';
        this.subject = data.subject || '';
        this.message = data.message || '';
        this.createdDate = data.createdDate || data.created_date || new Date();
    }

    static fromRow(row) {
        if (!row) return null;
        return new HelpMessage({
            id: row.id,
            name: row.name,
            email: row.email,
            subject: row.subject,
            message: row.message,
            created_date: row.created_date
        });
    }

    async save() {
        const sql = `
            INSERT INTO help_messages (name, email, subject, message, created_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const res = await query(sql, [this.name, this.email, this.subject, this.message, this.createdDate || new Date()]);
        if (res.rows.length > 0) {
            Object.assign(this, HelpMessage.fromRow(res.rows[0]));
        }
        return this;
    }
}

module.exports = HelpMessage;
