const { getUsers } = require('../controllers/user-controller');
const { getHobbies } = require('../controllers/hobby-controller');

module.exports = (req, res) => {
    if (req.url === '/api/users') {
        getUsers(req, res);
        return;
    }

    if (req.url.match(/\/api\/users\/[0-9(a-f|A-F)]{8}-[0-9(a-f|A-F)]{4}-4[0-9(a-f|A-F)]{3}-[89ab][0-9(a-f|A-F)]{3}-[0-9(a-f|A-F)]{12}\/hobbies/)) {
        const segmentsUrl = req.url.split('/');
        const userId = segmentsUrl[segmentsUrl.length - 2];
        getHobbies(req, res, userId);
        return;
    }

    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ title: 'Not Found', message: 'Route not found' }));
}