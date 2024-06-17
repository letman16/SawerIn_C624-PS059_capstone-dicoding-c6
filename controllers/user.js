import User from "../models/user.js";
import Dompet from "../models/dompet.js";
import mysql from "../models/model_mysql.js";

import Utils from "../controllers/utils.js";

const totalSaldo = (user_id) => {
  return new Promise((resolve, reject) => {
    let sqlSumSaldo =
      "SELECT sum(nominal) as totalSaldo FROM dompets where id_user='" +
      user_id +
      "'";
    mysql.conn.query(sqlSumSaldo, (err, sumSaldo) => {
      if (err) reject(err);
      if (sumSaldo) {
        resolve(sumSaldo[0]["totalSaldo"]);
      } else {
        reject(null);
      }
    });
  });
};

const akunBank = async (req, res) => {
  try {
    if (req.session.user) {
      const id_user = req.session.user.user_id;
      mysql.conn.query(
        "SELECT akun_bank FROM users where user_id='" + id_user + "'",
        (err, dataAkunBank) => {
          if (err) throw err;
          res.render("user/akun_bank", {
            user: req.session.user,
            dataAkunBank,
          });
        }
      );
    } else {
      req.flash("info", "Maaf, Anda harus Login.");
      res.redirect(303, "/");
    }
  } catch (error) {
    console.error(error);
  }
};

const doChangeAkunBank = (req, res) => {
  if (req.session.user) {
    const id_user = req.session.user.user_id;
    const dataBodyAB = req.body.dataKonfirmasiAkunBank;

    if (
      Object.values(dataBodyAB).every(
        (val) => val !== null && val !== undefined && val !== ""
      )
    ) {
      User.findOne({ where: { user_id: id_user } }).then((userAkunBank) => {
        if (userAkunBank) {
          if (userAkunBank.password == dataBodyAB.password_check_valid) {
            if (userAkunBank.status_user == "Aktif") {
              const dataKonfirmasiAkunBank = {
                bank: dataBodyAB.nama_bank,
                no_rekening: dataBodyAB.no_rekening,
                nama_rekening: dataBodyAB.nama_rekening,
                status: false,
              };
              User.update(
                { akun_bank: dataKonfirmasiAkunBank },
                { where: { user_id: id_user } }
              )
                .then((updateAkunBank) => {
                  const statusAkunBank = "OK";
                  res.json({
                    status: 200,
                    error: null,
                    statusAkunBank,
                    dataKonfirmasiAkunBank,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.json({
                    status: 500,
                    error: err.message,
                    statusAkunBank: "Error updating account bank.",
                  });
                });
            } else {
              const statusAkunBank =
                "Status User " + userAkunBank.status_user + ".";
              res.json({ status: 200, error: null, statusAkunBank });
            }
          } else {
            const statusAkunBank = "Konfirmasi Password tidak Benar.";
            res.json({ status: 200, error: null, statusAkunBank });
          }
        } else {
          const statusAkunBank = "User tidak Terdaftar.";
          res.json({ status: 200, error: null, statusAkunBank });
        }
      });
    } else {
      res.json({
        status: 400,
        error: "All fields are required.",
        statusAkunBank: "Please fill out all fields.",
      });
    }
  } else {
    req.flash("info", "Maaf, Anda harus Login.");
    res.redirect(303, "/");
  }
};

const userProfile = async (req, res) => {
  try {
    if (req.session.user) {
      const id_user = req.session.user.user_id;

      const Saldo = await totalSaldo(id_user);
      mysql.conn.query(
        "SELECT * FROM users where user_id='" + id_user + "'",
        (err, dataUser) => {
          if (err) throw err;
          if (dataUser.length == 1) {
            res.render("user/profile", {
              user: req.session.user,
              Saldo,
              dataUser,
            });
          } else {
            req.flash("info", "Maaf, User tidak Terdaftar.");
            res.redirect(303, "/user/dashboard");
          }
        }
      );
    } else {
      req.flash("info", "Maaf, Anda harus Login.");
      res.redirect(303, "/");
    }
  } catch (error) {
    console.error(error);
  }
};

const changeUserProfile = async (req, res) => {
  try {
    if (req.session.user) {
      const id_user = req.session.user.user_id;

      const Saldo = await totalSaldo(id_user);
      mysql.conn.query(
        "SELECT * FROM users where user_id='" + id_user + "'",
        (err, dataUser) => {
          if (err) throw err;
          if (dataUser.length == 1) {
            res.render("user/change_profile", {
              user: req.session.user,
              Saldo,
              dataUser,
            });
          } else {
            req.flash("info", "Maaf, User tidak Terdaftar.");
            res.redirect(303, "/user/dashboard");
          }
        }
      );
    } else {
      req.flash("info", "Maaf, Anda harus Login.");
      res.redirect(303, "/");
    }
  } catch (error) {
    console.error(error);
  }
};

const doChangeProfile = (req, res) => {
  if (req.session.user) {
    const id_user = req.session.user.user_id;
    const dataBodyCP = req.body.dataChangeProfile;

    if (
      Object.values(dataBodyCP).every(
        (val) => val !== null && val !== undefined && val !== ""
      )
    ) {
      User.findOne({ where: { user_id: id_user } }).then((userProfile) => {
        if (userProfile) {
          if (userProfile.password == dataBodyCP.password_check_valid) {
            if (userProfile.status_user == "Aktif") {
              const dataChangeProfile = {
                nama_user: dataBodyCP.nama_user,
                password: dataBodyCP.password,
              };

              User.update(dataChangeProfile, { where: { user_id: id_user } })
                .then((updateUser) => {
                  const statusChangeProfile = "OK";
                  res.json({
                    status: 200,
                    error: null,
                    statusChangeProfile,
                    dataChangeProfile,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.json({
                    status: 500,
                    error: err.message,
                    statusChangeProfile: "Error updating user.",
                  });
                });
            } else {
              const statusChangeProfile =
                "Status User " + userProfile.status_user + ".";
              res.json({ status: 200, error: null, statusChangeProfile });
            }
          } else {
            const statusChangeProfile = "Konfirmasi Password tidak Benar.";
            res.json({ status: 200, error: null, statusChangeProfile });
          }
        } else {
          const statusChangeProfile = "User tidak Terdaftar.";
          res.json({ status: 200, error: null, statusChangeProfile });
        }
      });
    } else {
      res.json({
        status: 400,
        error: "All fields are required.",
        statusChangeProfile: "Please fill out all fields.",
      });
    }
  } else {
    req.flash("info", "Maaf, Anda harus Login.");
    res.redirect(303, "/");
  }
};

const dashboardUser = async (req, res) => {
  try {
    if (req.session.user) {
      const id_user = req.session.user.user_id;
      const Saldo = await totalSaldo(id_user);

      let sqlTrxIn =
        "SELECT SUM(nominal) AS sumTrx, COUNT(*) AS countTrx FROM transaksi_nyawers WHERE status_transaksi = 'Sukses' AND user_id_penerima = ?";
      let sqlTrxOut =
        "SELECT SUM(nominal) AS sumTrx, COUNT(*) AS countTrx FROM transaksi_nyawers WHERE status_transaksi = 'Sukses' AND user_id_pengirim = ?";

      mysql.conn.query(sqlTrxIn, [id_user], (err, resultTrxIn) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error in retrieving incoming transaction");
        }
        mysql.conn.query(sqlTrxOut, [id_user], (err, resultTrxOut) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error in retrieving outgoing transaction");
          }

          const sumTrxIn = resultTrxIn[0].sumTrx || 0;
          const sumTrxOut = resultTrxOut[0].sumTrx || 0;
          const countTrxIn = resultTrxIn[0].countTrx || 0;
          const countTrxOut = resultTrxOut[0].countTrx || 0;

          res.render("user/dashboard_user", {
            user: req.session.user,
            Saldo,
            sumTrxIn,
            sumTrxOut,
            countTrxIn,
            countTrxOut,
          });
        });
      });
    } else {
      req.flash("info", "Maaf, Anda harus Login.");
      res.redirect(303, "/");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const dashboardSaweran = (req, res) => {
  const kategori = req.params.kategori;

  if (req.session.user) {
    const id_user = req.session.user.user_id;
    if (kategori) {
      if (kategori == "masuk") {
        let sqlTNUser =
          "SELECT * FROM transaksi_nyawers tn INNER JOIN users u ON tn.user_id_penerima = u.user_id INNER JOIN metode_pembayarans mp ON tn.metode_pembayaran_id = mp.id_mp WHERE u.user_id='" +
          id_user +
          "'";
        mysql.conn.query(sqlTNUser, (err, saweranMasuk) => {
          if (err) throw err;
          if (saweranMasuk) {
            res.render("user/saweran_masuk", {
              user: req.session.user,
              saweranMasuk,
            });
          }
        });
      } else if (kategori == "keluar") {
        let sqlTNUser =
          "SELECT * FROM transaksi_nyawers tn INNER JOIN users u ON tn.user_id_penerima = u.user_id INNER JOIN metode_pembayarans mp ON tn.metode_pembayaran_id = mp.id_mp WHERE tn.user_id_pengirim='" +
          id_user +
          "'";
        mysql.conn.query(sqlTNUser, (err, saweranKeluar) => {
          if (err) throw err;
          if (saweranKeluar) {
            res.render("user/saweran_keluar", {
              user: req.session.user,
              saweranKeluar,
            });
          }
        });
      } else {
        req.flash(
          "info",
          "Parameter Kategori Saweran tidak Terdaftar / tidak Valid."
        );
        res.redirect(303, "/user/dashboard");
      }
    } else {
      req.flash("info", "Parameter Kategori Saweran tidak Ada.");
      res.redirect(303, "/user/dashboard");
    }
  } else {
    req.flash("info", "Maaf, Anda harus Login.");
    res.redirect(303, "/");
  }
};

const detailSaweran = (req, res) => {
  if (req.session.user) {
    const id_user = req.session.user.user_id;
    const kat = req.params.kat;
    const id_transaksi = req.params.id_transaksi;
    if (kat == "masuk") {
      let sqlTNUser =
        "SELECT * FROM transaksi_nyawers tn INNER JOIN users u ON tn.user_id_penerima = u.user_id INNER JOIN users up ON tn.user_id_pengirim = up.user_id INNER JOIN metode_pembayarans mp ON tn.metode_pembayaran_id = mp.id_mp WHERE u.user_id='" +
        id_user +
        "' and tn.id_transaksi='" +
        id_transaksi +
        "'";
      mysql.conn.query(sqlTNUser, (err, detailSaweranByID) => {
        if (err) throw err;
        if (detailSaweranByID.length === 1) {
          res.render("user/detail_saweran", {
            user: req.session.user,
            detailSaweranByID,
            kat: "masuk",
          });
        } else {
          req.flash("info", "Maaf, Transaksi Sawer ini tidak Ada.");
          res.redirect(303, "/user/saweran/masuk");
        }
      });
    } else if (kat == "keluar") {
      let sqlTNUser =
        "SELECT * FROM transaksi_nyawers tn INNER JOIN users u ON tn.user_id_penerima = u.user_id INNER JOIN metode_pembayarans mp ON tn.metode_pembayaran_id = mp.id_mp WHERE tn.user_id_pengirim='" +
        id_user +
        "' and tn.id_transaksi='" +
        id_transaksi +
        "'";
      mysql.conn.query(sqlTNUser, (err, detailSaweranByID) => {
        if (err) throw err;
        if (detailSaweranByID.length === 1) {
          res.render("user/detail_saweran", {
            user: req.session.user,
            detailSaweranByID,
            kat: "keluar",
          });
        } else {
          req.flash("info", "Maaf, Transaksi Sawer ini tidak Ada.");
          res.redirect(303, "/user/saweran/keluar");
        }
      });
    } else {
      req.flash("info", "Maaf, Parameter tidak Diketahui.");
      res.redirect(303, "/user/dashboard");
    }
  } else {
    req.flash("info", "Maaf, Anda harus Login.");
    res.redirect(303, "/");
  }
};
const doTarikSaldoUser = async (req, res) => {
  try {
    if (req.session.user) {
      const id_user = req.session.user.user_id;
      const total_saldo = await totalSaldo(id_user);
      const dataBodyTarikSaldoUser = req.body.dataTarikSaldo;
      User.findOne({ where: { user_id: id_user } }).then((userWD) => {
        if (userWD) {
          if (userWD.status_user == "Aktif") {
            const akunBank = userWD.akun_bank;
            console.log(akunBank);
            if (akunBank != null && akunBank.status === true) {
              if (dataBodyTarikSaldoUser.nominal >= 10000) {
                if (
                  parseInt(total_saldo) >=
                  parseInt(dataBodyTarikSaldoUser.nominal)
                ) {
                  const dataTarikSaldoUser = {
                    id_dompet: Utils.generateID("", 8),
                    id_user: userWD.user_id,
                    reff_transaksi: Utils.generateID("WD-", 10),
                    nama_transaksi: "Penarikan saldo",
                    penyesuaian: "Debit",
                    nominal: "-" + dataBodyTarikSaldoUser.nominal,
                    waktu_transaksi_dompet: new Date().toISOString(),
                    status_transaksi_dompet: "Pending",
                  };
                  Dompet.create(dataTarikSaldoUser).then((createPenarikan) => {
                    if (createPenarikan) {
                      const statusPenarikanSaldo = "OK";
                      res.json({
                        status: 200,
                        error: null,
                        statusPenarikanSaldo,
                      });
                    }
                  });
                } else {
                  const statusPenarikanSaldo = "Saldo tidak Cukup.";
                  res.json({ status: 200, error: null, statusPenarikanSaldo });
                }
              } else {
                const statusPenarikanSaldo =
                  "Minimal Penarikan Saldo Rp 10.000.";
                res.json({ status: 200, error: null, statusPenarikanSaldo });
              }
            } else {
              const statusPenarikanSaldo =
                "Akun Bank Tidak Terverifikasi atau Belum Diatur";
              res.json({ status: 200, error: null, statusPenarikanSaldo });
            }
          } else {
            const statusPenarikanSaldo = "User tidak Aktif.";
            res.json({ status: 200, error: null, statusPenarikanSaldo });
          }
        } else {
          const statusPenarikanSaldo = "User tidak Terdaftar.";
          res.json({ status: 200, error: null, statusPenarikanSaldo });
        }
      });
    } else {
      const statusPenarikanSaldo = "Anda harus Login dahulu.";
      res.json({ status: 200, error: null, statusPenarikanSaldo });
    }
  } catch (error) {
    console.error(error);
  }
};

const dashboardDompet = async (req, res) => {
  try {
    if (req.session.user) {
      const id_user = req.session.user.user_id;

      const Saldo = await totalSaldo(id_user);

      let sqlDompetUser =
        "SELECT * FROM dompets d INNER JOIN users u ON d.id_user = u.user_id  WHERE d.id_user='" +
        id_user +
        "'";
      mysql.conn.query(sqlDompetUser, (err, dompetUser) => {
        if (err) throw err;
        mysql.conn.query(
          "SELECT * FROM users where user_id='" + id_user + "'",
          (err, dataUser) => {
            if (err) throw err;
            if (dataUser.length == 1) {
              if (dompetUser) {
                res.render("user/dompet", {
                  user: req.session.user,
                  dompetUser,
                  Saldo,
                  dataUser,
                });
              }
            }
          }
        );
      });
    } else {
      req.flash("info", "Maaf, Anda harus Login.");
      res.redirect(303, "/");
    }
  } catch (error) {
    console.error(error);
  }
};

const doLoginUser = (req, res) => {
  const dataBodyLogin = req.body.dataLogin;
  // do Login User 1
  User.findOne({ where: { username: dataBodyLogin.username } }).then((user) => {
    if (user) {
      // do Login User 2
      if (user.password == dataBodyLogin.password) {
        // do Login User 3 - Cek Status User
        if (user.status_user == "Aktif") {
          // Login Sukses

          req.session.user = user;
          const statusLogin = "OK";
          // res.redirect('/');
          res.json({ status: 200, error: null, user, statusLogin });
        } else {
          // User tidak Aktif
          const statusLogin = "User tidak Aktif";
          res.json({ status: 200, error: null, statusLogin });
        }
      } else {
        // Password tidak Benar
        const statusLogin = "Username / Password tidak Benar";
        res.json({ status: 200, error: null, statusLogin });
      }
    } else {
      // Username tidak Terdaftar
      const statusLogin = "Username / Password tidak Benar";
      res.json({ status: 200, error: null, statusLogin });
    }
  });
};

const checkAndaUpdateNoTelp = (noTelp) => {
  if (noTelp.substring(0, 2) === "08") {
    noTelp = "628" + noTelp.substring(2);
    console.log("Nomor telepon baru: ", noTelp);
  } else {
    console.log("Nomor telepon tidak perlu diubah: ", noTelp);
  }

  return noTelp;
};
const doRegisterUser = (req, res) => {
  const dataBodyRegister = req.body.dataRegister;

  console.log(checkAndaUpdateNoTelp(dataBodyRegister.no_telp));
  // do Register User 1
  User.findOne({ where: { username: dataBodyRegister.username } }).then(
    (user) => {
      if (!user) {
        User.findOne({ where: { email: dataBodyRegister.email } }).then(
          (emailUser) => {
            if (!emailUser) {
              User.findOne({
                where: {
                  no_telp: checkAndaUpdateNoTelp(dataBodyRegister.no_telp),
                },
              }).then((noTelpUser) => {
                if (!noTelpUser) {
                  const dataRegister = {
                    user_id: Utils.generateID("", 4),
                    nama_user: dataBodyRegister.nama_user,
                    username: dataBodyRegister.username,
                    email: dataBodyRegister.email,
                    no_telp: checkAndaUpdateNoTelp(dataBodyRegister.no_telp),
                    password: dataBodyRegister.password,
                    status_user: "Aktif",
                  };

                  User.create(dataRegister).then((result) => {
                    if (result) {
                      const statusRegister = "OK";
                      res.json({
                        status: 200,
                        error: null,
                        dataRegister,
                        statusRegister,
                      });
                    }
                  });
                } else {
                  // No. Telp tidak Terdaftar
                  const statusRegister = "No. Telp sudah Terdaftar";
                  res.json({ status: 200, error: null, statusRegister });
                }
              });
            } else {
              // Email tidak Terdaftar
              const statusRegister = "Email sudah Terdaftar";
              res.json({ status: 200, error: null, statusRegister });
            }
          }
        );
      } else {
        // Username tidak Terdaftar
        const statusRegister = "Username sudah Terdaftar";
        res.json({ status: 200, error: null, statusRegister });
      }
    }
  );
};

const logoutUser = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      const statusLogoutUser = "Gagal";
      res.json({ status: 200, error: null, statusLogoutUser });
    } else {
      const statusLogoutUser = "OK";
      res.json({ status: 200, error: null, statusLogoutUser });
    }
  });
};

export default {
  userProfile,
  changeUserProfile,
  doChangeProfile,
  doLoginUser,
  doRegisterUser,
  logoutUser,
  dashboardUser,
  dashboardSaweran,
  dashboardDompet,
  doTarikSaldoUser,
  detailSaweran,
  akunBank,
  doChangeAkunBank,
};
