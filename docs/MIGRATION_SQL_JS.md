# Migration dari better-sqlite3 ke sql.js

## Masalah Production
`better-sqlite3` adalah native module yang memerlukan compilation. Di production server, jika environment berbeda atau build tools tidak lengkap, akan error:
```
Module did not self-register: '/root/repo/bani-fatmiyah/node_modules/better-sqlite3/build/Release/better_sqlite3.node'
```

## Solusi: Gunakan sql.js
`sql.js` adalah pure JavaScript SQLite implementation yang bekerja di mana saja.

## File yang Perlu Diubah

### 1. **src/lib/db.ts** (UTAMA)
Ubah import dari `better-sqlite3` ke `sql.js`:
```typescript
// FROM:
import Database from 'better-sqlite3';

// TO:
import initSqlJs from 'sql.js';
```

### 2. **src/app/api/admin/bulk-import/route.ts**
```typescript
// FROM:
import Database from 'better-sqlite3';

// TO:
import initSqlJs from 'sql.js';
```

### 3. **Scripts (Tidak perlu diubah untuk production)**
Jika scripts hanya dijalankan di development/local, bisa tetap gunakan `better-sqlite3`:
- `scripts/seed.ts`
- `scripts/seed.js`
- `scripts/seed-direct.js`
- `scripts/seed-final.js`
- `scripts/seed-now.js`
- `scripts/import-all.js`
- `scripts/bulk-import.js`
- `scripts/import-v3.js`
- `scripts/final-import.js`
- `scripts/check-db.js`

## Instalasi di Server

```bash
# 1. Install dependencies baru
npm install sql.js

# 2. Tambahkan ke package.json (sudah ada di repo)
# 3. Deploy kode yang sudah diubah
# 4. Jalankan: npm run build && npm start
```

## Catatan Penting
- `sql.js` bekerja di memory, tapi bisa di-persist ke file
- Database file harus tersimpan di writable directory (e.g., `/data/family.db`)
- Performa sama untuk dataset kecil-sedang
- Tidak perlu C++ compiler atau build tools di production


//teach me how to change sqlite3 or better-sqlite3 to sqlite.js To change from `sqlite3` or `better-sqlite3` to `sqlite.js`, you will need to follow these steps:
// 1. Uninstall the existing SQLite packages:
//    ```bash
//    npm uninstall sqlite3 better-sqlite3
//    ```
// 2. Install `sqlite.js`:
//    ```bash
//    npm install sqlite.js
//    ```
// 3. Update your code to use `sqlite.js` instead of the previous packages.
//    Here is an example of how to initialize and use `sqlite.js`:
//    ```javascript
//    import { Database } from 'sqlite.js';
//    const db = new Database('path/to/your/database.sqlite');
//    // Example of creating a table
//    db.exec(`CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY, name TEXT, parentIds TEXT)`);
//    // Example of inserting a member
//    db.exec(`INSERT INTO members (name, parentIds) VALUES ('John Doe',
//      '1,2')`);
//    // Example of querying members
//    const members = db.exec(`SELECT * FROM members`);
//    console.log(members);
/// 4. Make sure to handle any differences in API between `sqlite.js` and the previous packages, such as how queries are executed and how results are returned.
// 5. Test your application to ensure that everything is working correctly with the new SQLite library
//  Note: The above code snippets are just examples and may need to be adjusted based on your specific application structure and requirements.
// Remember to check the documentation for `sqlite.js` for any specific usage details or differences from the previous libraries you were using.
// For more detailed information, you can refer to the official documentation of `sqlite.js` and compare it with the documentation of `sqlite3` and `better-sqlite3` to understand the differences in API and functionality.
