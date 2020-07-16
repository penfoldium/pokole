import { Pool } from 'pg';
import { User } from './Pokole';

class DBQueries {
    constructor() {
        throw new Error("This class cannot be initiated.");
    }

    public static async add(db: Pool, table: string, columns: string[], values: any[]) {
        const expressions: string[] = [];

        // We add an element to the expressions array for every value, so we can have the values be escaped when added to the database
        for (let i = 0; i < values.length; i++) {
            expressions.push(`$${i + 1}`);
        }

        return await db.query(/* sql */`
            INSERT INTO ${table} (${columns.join(',')}) VALUES (${expressions.join(',')})
        `, [...values])
    }

    public static async getLink(db: Pool, link: string) {
        const { rows } = await db.query(/* sql */`
            SELECT * FROM links WHERE shortened=$1
        `, [link]);

        return rows;
    };

    public static async addLink(db: Pool, userID: number, url: string, shortlink: string) {
        return this.add(db, 'links', ['user_id', 'original', 'shortened', 'created_on'], [userID, url, shortlink, new Date()]);
    }

    public static async getUser(db: Pool, user: string, isEmail: boolean = false) {
        const [account] = await this.findUsers(db, isEmail ? '' : user, isEmail ? user : '');
        if (!account) return null;
        else return account as User;
    }

    public static async addUser(db: Pool, username: string, email: string, password: string) {
        return this.add(db, 'users', ['username', 'email', 'password', 'created_on'], [username, email, password, new Date()]);
    }

    public static async findUsers(db: Pool, username: string, email: string) {
        const { rows } = await db.query(/* sql */`
            SELECT * FROM users WHERE (LOWER(username)=LOWER($1)) OR (LOWER(email)=LOWER($2)) 
        `, [username, email]);
        return rows as User[];
    }
};

export { DBQueries };