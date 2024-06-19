import mysql from '../models/model_mysql.js';

const fetchWebConfig = () => {
  return new Promise((resolve, reject) => {
    const sqlFetchWebConfig = 'SELECT * FROM `web_configs` WHERE status_project = "Aktif"';
    mysql.conn.query(sqlFetchWebConfig, (err, dataWebConfig) => {
      if (err) {
        reject(err);
      } else {
        resolve(dataWebConfig.length > 0 ? dataWebConfig[0] : null);
      }
    });
  });
};

const updateWebConfigLocals = async (req, res, next) => {
  try {
    const webConfig = await fetchWebConfig();
    res.locals.web_config = webConfig || {};
    next();
  } catch (error) {
    console.error('Error fetching web config:', error);
    res.locals.web_config = {};
    next();
  }
};

const generateID = (prefix, panjang) => {
  const prefixID_TX = prefix;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = prefixID_TX;
  for (let i = 0; i < panjang; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const formatCurrency = (number) => {
  if (number === null || number === undefined) {
    return 'Rp 0'; 
  }
  return 'Rp ' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};


export default { generateID, fetchWebConfig, updateWebConfigLocals, formatCurrency };
