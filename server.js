const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '/.env') });
const port = process.env.PORT || 8000;

const getRequest = require('./requests/get-request');
const postRequest = require('./requests/post-request');
const patchRequest = require('./requests/patch-request');
const deleteRequest = require('./requests/delete-request');

const server = http.createServer((req, res) => {
    switch (req.method) {
        case 'GET':
            getRequest(req, res);
            break;
        case 'POST':
            postRequest(req, res);
            break;
        case 'PATCH':
            patchRequest(req, res);
            break;
        case 'DELETE':
            deleteRequest(req, res);
            break;
        default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify({ title: 'Not Found', message: 'Route not found' }))
            res.end();
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});