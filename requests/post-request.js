const { createUser } = require('../controllers/user-controller');

module.exports = (req, res) => {
    if (req.url === '/api/users') {
        createUser(req, res);
        return;
    }

    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ title: 'Not Found', message: 'Route not found' }));
}