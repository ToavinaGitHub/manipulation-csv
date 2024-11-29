module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "",
    DB: "csv_database",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging : false
  };
  