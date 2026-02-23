import { Database } from 'bun:sqlite';
import { configureCustomSqlite, loadSqliteVec } from '../app/lib/sqlite-vec.ts';

function runVectorSmokeTest(): void {
  const configuredPath = configureCustomSqlite(Database.setCustomSQLite);
  if (configuredPath) {
    console.log(`Using custom SQLite: ${configuredPath}`);
  } else {
    console.log('No custom SQLite path found; trying Bun bundled SQLite');
  }

  const db = new Database(':memory:');

  try {
    loadSqliteVec(db);
    const version = db.query('select vec_version() as version').get();
    console.log('sqlite-vec loaded:', version);

    db.run('create virtual table vec_examples using vec0(sample_embedding float[3])');
    db.run(
      "insert into vec_examples(rowid, sample_embedding) values (1, '[0.1, 0.2, 0.3]'), (2, '[0.9, 0.8, 0.7]')"
    );

    const rows = db
      .query(
        "select rowid, distance from vec_examples where sample_embedding match '[0.1, 0.2, 0.31]' and k = 2 order by distance"
      )
      .all();

    console.log('KNN results:', rows);
    console.log('sqlite-vec Bun PoC passed');
  } finally {
    db.close();
  }
}

if (import.meta.main) {
  runVectorSmokeTest();
}
