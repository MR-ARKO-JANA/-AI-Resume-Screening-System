// Resume Model - PostgreSQL / Neon Data Access
const { query } = require('../config/db');

class Resume {
    constructor(data = {}) {
        this.id = data.id || null;
        this._id = data.id || null;
        this.userId = data.userId || data.user_id || null;
        this.fileName = data.fileName || data.file_name || '';
        this.filePath = data.filePath || data.file_path || '';
        this.uploadDate = data.uploadDate || data.upload_date || new Date();
    }

    static fromRow(row) {
        if (!row) return null;
        return new Resume({
            id: row.id,
            userId: row.user_id,
            fileName: row.file_name,
            filePath: row.file_path,
            uploadDate: row.upload_date
        });
    }

    async save() {
        if (this.id) {
            const sql = `
                UPDATE resumes
                SET user_id = $1, file_name = $2, file_path = $3
                WHERE id = $4
                RETURNING *
            `;
            const res = await query(sql, [this.userId, this.fileName, this.filePath, this.id]);
            if (res.rows.length > 0) {
                Object.assign(this, Resume.fromRow(res.rows[0]));
            }
            return this;
        } else {
            const sql = `
                INSERT INTO resumes (user_id, file_name, file_path, upload_date)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const res = await query(sql, [this.userId, this.fileName, this.filePath, this.uploadDate || new Date()]);
            if (res.rows.length > 0) {
                Object.assign(this, Resume.fromRow(res.rows[0]));
            }
            return this;
        }
    }

    static async findById(id) {
        if (!id) return null;
        const res = await query('SELECT * FROM resumes WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return Resume.fromRow(res.rows[0]);
    }

    static async find(conditions = {}) {
        let sql = 'SELECT * FROM resumes';
        const params = [];
        const clauses = [];

        if (conditions.userId || conditions.user_id) {
            params.push(conditions.userId || conditions.user_id);
            clauses.push(`user_id = $${params.length}`);
        }

        if (clauses.length > 0) {
            sql += ' WHERE ' + clauses.join(' AND ');
        }
        sql += ' ORDER BY upload_date DESC';

        const res = await query(sql, params);
        return res.rows.map(row => Resume.fromRow(row));
    }

    static async deleteMany(conditions = {}) {
        let sql = 'DELETE FROM resumes';
        const params = [];
        const clauses = [];

        if (conditions.userId || conditions.user_id) {
            params.push(conditions.userId || conditions.user_id);
            clauses.push(`user_id = $${params.length}`);
        }

        if (clauses.length > 0) {
            sql += ' WHERE ' + clauses.join(' AND ');
            const res = await query(sql, params);
            return { deletedCount: res.rowCount };
        }
        return { deletedCount: 0 };
    }
}

module.exports = Resume;
