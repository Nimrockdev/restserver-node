// ============================
//  Puerto
// ============================

process.env.PORT = process.env.PORT || 3000;


// ============================
//  Entorno
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ============================
//  Vencimiento del token
// ============================
/* 60s 60m 24m 24h, 30 DÍAS*/

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;



// ============================
//  Seed de autentificación
// ============================
/* En heroku utilizamos process.env.SEED */
process.env.SEED = process.env.SEED || 'seed-de-desarrollo';


// ============================
//  Base de datos
// ============================

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/BD1';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;