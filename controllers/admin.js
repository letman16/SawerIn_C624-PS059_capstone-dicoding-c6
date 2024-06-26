import Users from "../models/user.js";
import Transaksi_Nyawer from "../models/transaksi_nyawer.js";
import Admin from "../models/admin.js";
import Dompet from "../models/dompet.js";
import mysql from "../models/model_mysql.js";
import Metode_Pembayaran from "../models/metode_pembayaran.js";

import Utils from "../controllers/utils.js";
import md5 from "md5";
import crypto from "crypto";
import axios from "axios";

const dashboardAdmin = (req, res) => {
  if (req.session.admin) {
    // Mengambil jumlah nominal transaksi dari database
    let sqlTrx =
      "SELECT SUM(nominal) AS sumTrx, COUNT(*) AS countTrx FROM transaksi_nyawers WHERE status_transaksi = 'Sukses'";
    mysql.conn.query(sqlTrx, (err, resultTrx) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error in retrieving transaction sum");
      }

      const sumTrx = resultTrx[0].sumTrx || 0;
      const countTrx = resultTrx[0].countTrx || 0;

      // Mengambil jumlah pengguna dari database
      let sqlSumUsers = "SELECT COUNT(*) AS sumUsers FROM users";
      mysql.conn.query(sqlSumUsers, (err, resultSumUsers) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error in retrieving user count");
        }

        const sumUsers = resultSumUsers[0].sumUsers;

        // Mengambil jumlah penarikan tertunda dari database
        let sqlWdPending =
          "SELECT SUM(nominal) AS sumWDPending, COUNT(*) AS countWDPending FROM dompets WHERE status_transaksi_dompet = 'Pending'";
        mysql.conn.query(sqlWdPending, (err, resultSumWdPending) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .send("Error in retrieving pending withdrawal sum");
          }

          const sumWDPending =
            Math.abs(resultSumWdPending[0].sumWDPending) || 0;
          const countWDPending = resultSumWdPending[0].countWDPending || 0;

          res.render("admin/dashboard_admin", {
            admin: req.session.admin,
            dataDashboard: {
              countTrx,
              sumTrx,
              sumUsers,
              countWDPending,
              sumWDPending,
            },
          });
        });
      });
    });
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const transaksi_nyawer = (req, res) => {
  if (req.session.admin) {
    let sql_trx_nyawer =
      "SELECT * FROM transaksi_nyawers tn INNER JOIN users u ON tn.user_id_penerima = u.user_id INNER JOIN metode_pembayarans mp ON tn.metode_pembayaran_id = mp.id_mp";
    mysql.conn.query(sql_trx_nyawer, (err, trx_nyawer) => {
      if (err) throw err;
      res.render("admin/transaksi_nyawer/transaksi_nyawer", {
        admin: req.session.admin,
        trx_nyawer,
      });
    });
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const transaksi_nyawer_by_id = (req, res) => {
  if (req.session.admin) {
    const id_trx = req.params.id_transaksi;
    if (id_trx) {
      let sql_trx_nyawer =
        "SELECT * FROM transaksi_nyawers tn INNER JOIN users u ON tn.user_id_penerima = u.user_id INNER JOIN metode_pembayarans mp ON tn.metode_pembayaran_id = mp.id_mp where tn.id_transaksi='" +
        id_trx +
        "'";
      mysql.conn.query(sql_trx_nyawer, (err, trx_nyawer_by_id) => {
        if (err) throw err;
        if (trx_nyawer_by_id.length === 1) {
          res.render("admin/transaksi_nyawer/transaksi_nyawer_by_id", {
            admin: req.session.admin,
            trx_nyawer_by_id,
          });
        } else {
          req.flash("info", "Transaksi Sawer tidak Terdaftar.");
          res.redirect(303, "/admin/transaksi_nyawer");
        }
      });
    } else {
      // Parameter ID Transaksi tidak Ada
      req.flash("info", "Parameter Transaksi Sawer tidak Ada.");
      res.redirect(303, "/admin/transaksi_nyawer");
    }
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const cek_transaksi_nyawer = (req, res) => {
  const dataBody = req.body.dataCekTransaksi;
  Transaksi_Nyawer.findOne({
    where: { id_transaksi: dataBody.id_transaksi },
  }).then((trx_nyawer) => {
    if (trx_nyawer) {
      const data = {
        merchantcode: "DS14804",
        merchantOrderId: trx_nyawer.id_transaksi,
        signature: md5(
          "DS14804" +
            trx_nyawer.id_transaksi +
            "4feb989c8424feacd7f4f09b0068230b"
        ),
      };

      axios
        .post(
          "https://sandbox.duitku.com/webapi/api/merchant/transactionStatus",
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((responsePG) => {
          if (responsePG.data) {
            const dataPembayaranTransaksiNyawer = {
              pg: responsePG.data,
              sistem: trx_nyawer,
            };
            res.json({
              status: 200,
              error: null,
              dataPembayaranTransaksiNyawer,
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
};

const data_user = (req, res) => {
  if (req.session.admin) {
    let sql_data_user = "SELECT * FROM users";
    mysql.conn.query(sql_data_user, (err, data_user) => {
      if (err) throw err;
      res.render("admin/user/data_user", {
        admin: req.session.admin,
        data_user,
      });
    });
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const data_user_by_uname = (req, res) => {
  if (req.session.admin) {
    const username = req.params.username;
    if (username) {
      let sql_data_user =
        "SELECT * FROM users u where u.username='" + username + "'";
      mysql.conn.query(sql_data_user, (err, data_user_by_uname) => {
        if (err) throw err;
        if (data_user_by_uname.length === 1) {
          res.render("admin/user/data_user_by_uname", {
            admin: req.session.admin,
            data_user_by_uname,
          });
        } else {
          req.flash("info", "User tidak Terdaftar.");
          res.redirect(303, "/admin/user");
        }
      });
    } else {
      // Parameter ID Transaksi tidak Ada
      req.flash("info", "Parameter User tidak Ada.");
      res.redirect(303, "/admin/user");
    }
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const doUpdateUser = (req, res) => {
    const dataBody = req.body.dataUser;
  
    let dataUser;
  
    // Cek apakah semua key dalam dataBody.akun_bank undefined atau tidak
    if (
      !dataBody.akun_bank ||
      (
        !dataBody.akun_bank.bank &&
        !dataBody.akun_bank.no_rekening &&
        !dataBody.akun_bank.nama_rekening &&
        !dataBody.akun_bank.status
      )
    ) {
      dataUser = {
        nama_user: dataBody.nama_user,
        password: dataBody.password,
        akun_bank: null,
        status_user: dataBody.status_user,
      };
    } else {
      dataUser = {
        nama_user: dataBody.nama_user,
        password: dataBody.password,
        akun_bank: dataBody.akun_bank,
        status_user: dataBody.status_user,
      };
    }
  
    Users.update(dataUser, { where: { user_id: dataBody.user_id } }).then(
      (updateUser) => {
        if (updateUser) {
          const statusUpdate = "OK";
          res.json({ status: 200, error: null, dataUser, statusUpdate });
        }
      }
    ).catch(error => {
      console.error('Error updating user:', error);
      res.json({ status: 500, error: 'Terjadi kesalahan saat memperbarui data.' });
    });
  };
  

// Metode Pembayaran
const metode_pembayaran = (req, res) => {
  if (req.session.admin) {
    let sql_metode_pembayaran = "SELECT * FROM metode_pembayarans";
    mysql.conn.query(sql_metode_pembayaran, (err, metode_pembayaran) => {
      if (err) throw err;
      res.render("admin/metode_pembayaran/metode_pembayaran", {
        admin: req.session.admin,
        metode_pembayaran,
      });
    });
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const metode_pembayaran_by_id = (req, res) => {
  if (req.session.admin) {
    const id_mp = req.params.id_metode_pembayaran;
    if (id_mp) {
      let sql_metode_pembayaran =
        "SELECT * FROM metode_pembayarans mp where mp.id_mp='" + id_mp + "'";
      mysql.conn.query(
        sql_metode_pembayaran,
        (err, metode_pembayaran_by_id) => {
          if (err) throw err;
          if (metode_pembayaran_by_id.length === 1) {
            res.render("admin/metode_pembayaran/metode_pembayaran_by_id", {
              admin: req.session.admin,
              metode_pembayaran_by_id,
            });
          } else {
            req.flash("info", "Metode Pembayaran tidak Terdaftar.");
            res.redirect(303, "/admin/metode_pembayaran");
          }
        }
      );
    } else {
      req.flash("info", "Parameter Metode Pembayaran tidak Ada.");
      res.redirect(303, "/admin/metode_pembayaran");
      // Parameter ID Transaksi tidak Ada
    }
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const doUpdateMP = (req, res) => {
  const dataBody = req.body.dataMP;

  const dataMP = {
    nama_mp: dataBody.nama_mp,
    biaya_mp: dataBody.biaya_mp,
    penyesuaian_biaya: dataBody.penyesuaian_biaya,
    publish: dataBody.publish,
    status_mp: dataBody.status_mp,
  };
  Metode_Pembayaran.update(dataMP, { where: { id_mp: dataBody.id_mp } }).then(
    (updateMP) => {
      if (updateMP) {
        const statusUpdate = "OK";
        res.json({ status: 200, error: null, dataMP, statusUpdate });
      }
    }
  );
};

// Dompet
const dompet = (req, res) => {
  if (req.session.admin) {
    let sql_dompet =
      "SELECT * FROM dompets d INNER JOIN users u ON d.id_user = u.user_id";
    mysql.conn.query(sql_dompet, (err, dompet) => {
      if (err) throw err;
      res.render("admin/dompet/dompet", { admin: req.session.admin, dompet });
    });
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const dompet_by_id = (req, res) => {
  if (req.session.admin) {
    const id_dompet = req.params.id_dompet;
    if (id_dompet) {
      let sql_dompet =
        "SELECT * FROM dompets d INNER JOIN users u ON d.id_user = u.user_id where d.id_dompet='" +
        id_dompet +
        "'";
      mysql.conn.query(sql_dompet, (err, dompet_by_id) => {
        if (err) throw err;
        if (dompet_by_id.length === 1) {
          res.render("admin/dompet/dompet_by_id", {
            admin: req.session.admin,
            dompet_by_id,
          });
        } else {
          req.flash("info", "Transaksi Dompet tidak Terdaftar.");
          res.redirect(303, "/admin/dompet");
        }
      });
    } else {
      // Parameter ID Transaksi tidak Ada
      req.flash("info", "Parameter Dompet tidak Ada.");
      res.redirect(303, "/admin/dompet");
    }
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

// Penarikan
const penarikan = (req, res) => {
  if (req.session.admin) {
    let sql_penarikan =
      "SELECT * FROM dompets d INNER JOIN users u ON d.id_user = u.user_id where d.penyesuaian = 'Debit' ";
    mysql.conn.query(sql_penarikan, (err, penarikan) => {
      if (err) throw err;
      res.render("admin/penarikan/penarikan", {
        admin: req.session.admin,
        penarikan,
      });
    });
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const penarikan_by_id = (req, res) => {
  if (req.session.admin) {
    const id_penarikan = req.params.id_penarikan;
    if (id_penarikan) {
      let sql_penarikan =
        "SELECT * FROM dompets d INNER JOIN users u ON d.id_user = u.user_id where d.id_dompet='" +
        id_penarikan +
        "' and d.penyesuaian = 'Debit'";
      mysql.conn.query(sql_penarikan, (err, penarikan_by_id) => {
        if (err) throw err;
        if (penarikan_by_id.length === 1) {
          res.render("admin/penarikan/penarikan_by_id", {
            admin: req.session.admin,
            penarikan_by_id,
          });
        } else {
          req.flash("info", "Transaksi Penarikan tidak Terdaftar.");
          res.redirect(303, "/admin/penarikan");
        }
      });
    } else {
      // Parameter ID Transaksi tidak Ada
      req.flash("info", "Paramter Transaksi Dompet tidak Ada.");
      res.redirect(303, "/admin/penarikan");
    }
  } else {
    req.flash("info", "Admin harus Login.");
    res.redirect(303, "/auth/admin/login");
  }
};

const doUpdatePenarikan = (req, res) => {
  const dataBody = req.body.dataPenarikan;

  const dataPenarikan = {
    status_transaksi_dompet: dataBody.status_penarikan,
  };
  mysql.conn.query(
    "SELECT * FROM dompets d INNER JOIN users u ON d.id_user = u.user_id where d.reff_transaksi='" +
      dataBody.reff_transaksi +
      "'",
    (err, trxDompetUser) => {
      if (err) throw err;
      if (trxDompetUser) {
        if (trxDompetUser[0].status_transaksi_dompet == "Pending") {
          Dompet.update(dataPenarikan, {
            where: { reff_transaksi: dataBody.reff_transaksi },
          }).then((updateMP) => {
            if (updateMP) {
              if (dataPenarikan.status_transaksi_dompet == "Gagal") {
                const dataRefundDompet = {
                  id_dompet: Utils.generateID("", 8),
                  id_user: trxDompetUser[0].id_user,
                  reff_transaksi: Utils.generateID("RF-", 7),
                  nama_transaksi:
                    "Pengembalian saldo dari Penarikan " +
                    trxDompetUser[0].reff_transaksi,
                  penyesuaian: "Credit",
                  nominal: Math.abs(parseInt(trxDompetUser[0].nominal)),
                  waktu_transaksi_dompet: new Date().toISOString(),
                  status_transaksi_dompet: "Sukses",
                };

                Dompet.create(dataRefundDompet).then((refundDompet) => {
                  const statusUpdate = "OK";
                  res.json({
                    status: 200,
                    error: null,
                    dataPenarikan,
                    statusUpdate,
                  });
                });
              } else {
                const statusUpdate = "OK";
                res.json({
                  status: 200,
                  error: null,
                  dataPenarikan,
                  statusUpdate,
                });
              }
            }
          });
        } else {
          const statusUpdate = "Penarikan saldo sudah tidak dapat diupdate";
          res.json({ status: 200, error: null, dataPenarikan, statusUpdate });
        }
      }
    }
  );
};

const loginAdmin = (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/auth/login", { admin: req.session.admin });
  }
};

const doLoginAdmin = (req, res) => {
  const dataBody = req.body.dataLoginAdmin;
  Admin.findOne({ where: { username_admin: dataBody.username_admin } }).then(
    (adminLogin) => {
      if (adminLogin) {
        if (adminLogin.status_admin == "Aktif") {
          const hashPassword = crypto
            .createHash("md5")
            .update(dataBody.password_admin)
            .digest("hex");

          if (adminLogin.password_admin == hashPassword) {
            req.session.admin = adminLogin;
            const statusLoginAdmin = "OK";
            res.json({
              status: 200,
              error: null,
              statusLoginAdmin,
              adminLogin,
            });
          } else {
            const statusLoginAdmin = "Username / Password tidak valid.";
            res.json({ status: 200, error: null, statusLoginAdmin });
          }
        } else {
          const statusLoginAdmin = "Status Admin tidak Aktif";
          res.json({ status: 200, error: null, statusLoginAdmin });
        }
      } else {
        const statusLoginAdmin = "Username tidak Terdaftar.";
        res.json({ status: 200, error: null, statusLoginAdmin });
      }
    }
  );
};

const dologout = (req, res) => {
  if (req.session.admin) {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/auth/admin/login");
      }
    });
  } else {
    res.redirect("/");
  }
};

export default {
  dashboardAdmin,
  transaksi_nyawer,
  transaksi_nyawer_by_id,
  cek_transaksi_nyawer,
  data_user,
  data_user_by_uname,
  doUpdateUser,
  metode_pembayaran,
  metode_pembayaran_by_id,
  doUpdateMP,
  dompet,
  dompet_by_id,
  penarikan,
  penarikan_by_id,
  doUpdatePenarikan,
  loginAdmin,
  doLoginAdmin,
  dologout,
};
