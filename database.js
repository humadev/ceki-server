var dcConfig = {
      client: 'mysql',
      connection: {
            host: 'localhost',
            user: 'humadevo_ceki',
            password: 'HuM4.ceki',
            database: 'humadevo_ceki'
      },
      plain: true
};

exports.connection = require('knex')(dcConfig);
