// ============================
//  Puerto
// ============================

process.env.PORT = process.env.PORT || 3000;


// ============================
//  Entorno
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ============================
//  Base de datos
// ============================

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/BD1';
} else {
    urlDB = 'mongodb://user1:Nimi1984@ds119734.mlab.com:19734/bd1';
}

process.env.URLDB = urlDB;