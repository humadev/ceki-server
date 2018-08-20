var dcConfig = {
    client: 'mysql',
    connection: {
        host: "localhost",
        user: 'root',
        password: '',
        database: 'ceki'
    },
    plain: true
};

exports.connection = require('knex')(dcConfig);