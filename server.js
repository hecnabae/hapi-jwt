var Hapi = require('hapi'),
    jwt = require('jsonwebtoken'),
    server = new Hapi.Server();

server.connection({port: 8080});


var accounts = {
    123: {
        id: 123,
        user: 'john',
        fullName: 'John Doe',
        scope: ['a', 'b']
    }
};


var privateKey = 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc';

// Use this token to build your request with the 'Authorization' header.
// Ex:
//     Authorization: Bearer <token>
var token = jwt.sign({accountId: 123}, privateKey, {algorithm: 'HS256'});


var validate = function (request, decodedToken, callback) {

    var error,
        credentials = accounts[decodedToken.accountId] || {};

    if (!credentials) {
        return callback(error, false, credentials);
    }

    return callback(error, true, credentials)
};


server.register(require('hapi-auth-jwt'), function (error) {

    server.auth.strategy('token', 'jwt', {
        key: privateKey,
        validateFunc: validate,
        verifyOptions: {algorithms: ['HS256']}  // only allow HS256 algorithm
    });

    server.route({
        method: 'GET',
        path: '/token',
        config: {
            auth: false,
            handler: function (request, reply) {
                console.log('token');
                reply({res: token});
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'token',
            handler: function (request, reply) {
                console.log('token');
                reply({res: 'auth ok'});
            }
        }
    });

    // With scope requirements
    server.route({
        method: 'GET',
        path: '/withScope',
        config: {
            auth: {
                strategy: 'token',
                scope: ['a']
            },
            handler: function (request, reply) {
                console.log('token');
                reply({res: 'ok'});
            }
        }
    });
});


server.start(function () {
    console.log('Servidor arrancado ', server.info.uri);
});