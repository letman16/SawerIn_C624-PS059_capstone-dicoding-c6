import Transaksi_Nyawer from "../models/transaksi_nyawer.js";
import Dompet from "../models/dompet.js";
import Utils from "../controllers/utils.js";
import axios from "axios";
import md5 from "md5";

const redirect = async (req, res) => {
  const id_transaksi = req.params.id_transaksi;

  try {
    if (!id_transaksi) {
      throw new Error("Parameter ID Transaksi Sawer tidak Ada.");
    }

    const transaksiNyawerByID = await Transaksi_Nyawer.findOne({
      where: { id_transaksi: id_transaksi },
    });
    if (!transaksiNyawerByID) {
      throw new Error("Transaksi Sawer tidak Ditemukan.");
    }

    if (
      transaksiNyawerByID.status_transaksi !== "Pending - Menunggu Pembayaran"
    ) {
      req.flash(
        "info",
        `Transaksi Sawer telah ${transaksiNyawerByID.status_transaksi}.`
      );
      return res.redirect(303, "/bayar/" + id_transaksi);
    } else {
      const data = {
        merchantcode: "DS14804",
        merchantOrderId: transaksiNyawerByID.id_transaksi,
        signature: md5(
          "DS14804" +
            transaksiNyawerByID.id_transaksi +
            "4feb989c8424feacd7f4f09b0068230b"
        ),
      };

      const responsePG = await axios.post(
        "https://sandbox.duitku.com/webapi/api/merchant/transactionStatus",
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (responsePG.data.statusCode === "01") {
        req.flash("info", "Transaksi Sawer Pending - Menunggu Pembayaran");
        return res.redirect(303, "/bayar/" + id_transaksi);
      }

      if (responsePG.data.statusCode === "00") {
        req.flash("success", "Transaksi Sawer telah Sukses.");
        return res.redirect(303, "/bayar/" + id_transaksi);
      }

      if (responsePG.data.statusCode === "02") {
        await Transaksi_Nyawer.update(
          { status_transaksi: "Gagal - Dibatalkan System" },
          { where: { id_transaksi: transaksiNyawerByID.id_transaksi } }
        );

        req.flash("info", "Transaksi Sawer telah Gagal - Dibatalkan System.");
        return res.redirect(303, "/bayar/" + id_transaksi);
      }
    }
  } catch (error) {
    console.error(error);
    req.flash("info", error.message);
    res.redirect(303, "/");
  }
};

const callback = async (req, res) => {
  try {
    const apiKey = "4feb989c8424feacd7f4f09b0068230b";
    const merchantCode = req.body.merchantCode || null;
    const amount = req.body.amount || null;
    const merchantOrderId = req.body.merchantOrderId || null;
    const productDetail = req.body.productDetail || null;
    const additionalParam = req.body.additionalParam || null;
    const paymentMethod = req.body.paymentCode || null;
    const resultCode = req.body.resultCode || null;
    const merchantUserId = req.body.merchantUserId || null;
    const reference = req.body.reference || null;
    const signature = req.body.signature || null;
    const publisherOrderId = req.body.publisherOrderId || null;
    const spUserHash = req.body.spUserHash || null;
    const settlementDate = req.body.settlementDate || null;
    const issuerCode = req.body.issuerCode || null;

    if (!merchantCode || !amount || !merchantOrderId || !signature) {
      throw new Error("Bad Parameter");
    }

    const params = merchantCode + amount + merchantOrderId + apiKey;
    const calcSignature = md5(params);

    if (signature !== calcSignature) {
      throw new Error("Bad Signature");
    }

    // Validasi transaksi
    const transaksiNyawerByID = await Transaksi_Nyawer.findOne({
      where: { id_transaksi: merchantOrderId },
    });
    if (!transaksiNyawerByID) {
      throw new Error("Transaksi Sawer tidak Ditemukan.");
    }

    if (
      transaksiNyawerByID.status_transaksi !== "Pending - Menunggu Pembayaran"
    ) {
      throw new Error(
        `Transaksi Sawer telah ${transaksiNyawerByID.status_transaksi}.`
      );
    } else {
      // Update transaksi dan insert saldo
      await Transaksi_Nyawer.update(
        { status_transaksi: "Sukses" },
        { where: { id_transaksi: transaksiNyawerByID.id_transaksi } }
      );

      const cekTransaksiDompet = await Dompet.findOne({
        where: { reff_transaksi: transaksiNyawerByID.id_transaksi },
      });

      if (!cekTransaksiDompet) {
        const dataDompet = {
          id_dompet: Utils.generateID("", 8),
          id_user: transaksiNyawerByID.user_id_penerima,
          reff_transaksi: transaksiNyawerByID.id_transaksi,
          nama_transaksi:
            "Penambahan saldo dari " + transaksiNyawerByID.nama_pengirim,
          penyesuaian: "Credit",
          nominal: transaksiNyawerByID.total_terima,
          waktu_transaksi_dompet: new Date().toISOString(),
          status_transaksi_dompet: "Sukses",
        };

        await Dompet.create(dataDompet);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
};

export default { redirect, callback };
