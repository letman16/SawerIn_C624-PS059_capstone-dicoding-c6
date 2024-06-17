// app.js atau index.js

import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import flash from 'connect-flash';
import Utils from './controllers/utils.js'
import user from './controllers/user.js';
import transaksi_nyawer from './controllers/transaksi_nyawer.js';
import payment_gateway from './controllers/payment_gateway.js';
import admin from './controllers/admin.js';
import page from './controllers/page.js';

const app = express();
const hostname = '127.0.0.1';
const port = 3030;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'ini adalah kode secret###',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

app.use(flash());

// Update web_config on every request
app.use(Utils.updateWebConfigLocals);

// Global variables
app.use((req, res, next) => {
  res.locals.message = req.flash();
  res.locals.formatCurrency = Utils.formatCurrency;
  res.locals.web_config = res.locals.web_config || {}; // Fallback if web_config is null
  next();
});

// Routes
app.use(express.static("public"));
app.set("view engine", "ejs");

// Define your routes here
app.get("/", (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/penerima', page.penerima);
app.get('/:uname', transaksi_nyawer.nyawerUser);
app.post('/doNyawerUser', (req, res) => {
  transaksi_nyawer.doNyawerUser(req, res, res.locals.web_config.domain);
});
app.get('/bayar/:id_transaksi', transaksi_nyawer.bayarNyawerUser);
app.post('/cekTransaksiNyawer', transaksi_nyawer.cekTransaksiNyawer);

// Dashboard User
app.get('/user/dashboard', user.dashboardUser);
app.get('/user/saweran/:kategori', user.dashboardSaweran);
app.get('/user/saweran/:kat/:id_transaksi', user.detailSaweran);
app.get('/user/dompet', user.dashboardDompet);
app.post('/user/doTarikSaldoUser', user.doTarikSaldoUser);

app.get('/user/akun_bank', user.akunBank);
app.post('/user/akun_bank/doChangeAkunBank', user.doChangeAkunBank);
app.get('/user/profile', user.userProfile);
app.get('/user/profile/change', user.changeUserProfile);
app.post('/user/profile/doChangeProfile', user.doChangeProfile);

// Auth
app.post('/auth/doLoginUser', user.doLoginUser);
app.post('/auth/doRegisterUser', user.doRegisterUser);
app.post('/auth/logoutUser', user.logoutUser);

// Payment Gateway
app.get('/rd/:id_transaksi', payment_gateway.redirect);
app.post('/cb', payment_gateway.callback);

// Admin
app.get("/admin/dashboard", admin.dashboardAdmin);
app.get("/admin/transaksi_nyawer", admin.transaksi_nyawer);
app.get("/admin/transaksi_nyawer/:id_transaksi", admin.transaksi_nyawer_by_id);
app.post("/admin/transaksi_nyawer/cek_transaksi_nyawer", admin.cek_transaksi_nyawer);
app.get("/admin/user", admin.data_user);
app.get("/admin/user/:username", admin.data_user_by_uname);
app.post("/admin/user/doUpdateUser", admin.doUpdateUser);
app.get("/admin/dompet", admin.dompet);
app.get("/admin/dompet/:id_dompet", admin.dompet_by_id);
app.get("/admin/penarikan", admin.penarikan);
app.get("/admin/penarikan/:id_penarikan", admin.penarikan_by_id);
app.post("/admin/penarikan/doUpdatePenarikan", admin.doUpdatePenarikan);
app.get("/admin/metode_pembayaran", admin.metode_pembayaran);
app.get("/admin/metode_pembayaran/:id_metode_pembayaran", admin.metode_pembayaran_by_id);
app.post("/admin/metode_pembayaran/doUpdateMP", admin.doUpdateMP);
app.get("/auth/admin/login", admin.loginAdmin);
app.post("/auth/admin/doLoginAdmin", admin.doLoginAdmin);
app.get("/auth/admin/logout", admin.dologout);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
