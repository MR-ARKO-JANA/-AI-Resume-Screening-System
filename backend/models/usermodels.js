// User Model - PostgreSQL / Neon Data Access
const { query } = require('../config/db');

class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this._id = data.id || null;
        this.name = data.name || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.company = data.company || '';
        this.jobTitle = data.job_title || data.jobTitle || '';
        this.created_at = data.created_at || new Date();
    }

    static fromRow(row) {
        if (!row) return null;
        const user = new User({
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            company: row.company,
            job_title: row.job_title,
            created_at: row.created_at
        });
        return user;
    }

    async save() {
        if (this.id) {
            const sql = `
                UPDATE users
                SET name = $1, email = $2, password = $3, company = $4, job_title = $5
                WHERE id = $6
                RETURNING *
            `;
            const res = await query(sql, [this.name, this.email, this.password, this.company, this.jobTitle, this.id]);
            if (res.rows.length > 0) {
                const u = User.fromRow(res.rows[0]);
                Object.assign(this, u);
            }
            return this;
        } else {
            const sql = `
                INSERT INTO users (name, email, password, company, job_title)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const res = await query(sql, [this.name, this.email, this.password, this.company, this.jobTitle]);
            if (res.rows.length > 0) {
                const u = User.fromRow(res.rows[0]);
                Object.assign(this, u);
            }
            return this;
        }
    }

    static async findOne(conditions = {}) {
        let sql = 'SELECT * FROM users';
        const params = [];
        const clauses = [];

        if (conditions._id || conditions.id) {
            params.push(conditions._id || conditions.id);
            clauses.push(`id = $${params.length}`);
        }
        if (conditions.email) {
            params.push(conditions.email);
            clauses.push(`LOWER(email) = LOWER($${params.length})`);
        }

        if (clauses.length > 0) {
            sql += ' WHERE ' + clauses.join(' AND ');
        }

        sql += ' LIMIT 1';

        const res = await query(sql, params);
        if (res.rows.length === 0) return null;

        const user = User.fromRow(res.rows[0]);
        // Chainable .select() support
        user.select = function() { return this; };
        return user;
    }

    static async findById(id) {
        if (!id) return null;
        return User.findOne({ id });
    }

    static async findOneAndUpdate(conditions, updateData, options = {}) {
        const user = await User.findOne(conditions);
        if (!user) return null;

        if (updateData.name !== undefined) user.name = updateData.name;
        if (updateData.company !== undefined) user.company = updateData.company;
        if (updateData.jobTitle !== undefined) user.jobTitle = updateData.jobTitle;
        if (updateData.password !== undefined) user.password = updateData.password;

        await user.save();
        return user;
    }

    static async deleteOne(conditions) {
        let sql = 'DELETE FROM users';
        const params = [];
        const clauses = [];

        if (conditions._id || conditions.id) {
            params.push(conditions._id || conditions.id);
            clauses.push(`id = $${params.length}`);
        } else if (conditions.email) {
            params.push(conditions.email);
            clauses.push(`email = $${params.length}`);
        }

        if (clauses.length > 0) {
            sql += ' WHERE ' + clauses.join(' AND ');
            await query(sql, params);
            return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
    }
}

module.exports = User;