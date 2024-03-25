const { receiveHobbies, update } = require('../models/hobby-model');
const { getById } = require('../models/user-model');
const { getBodyData } = require('../utils');

const getHobbies = async (req, res, userId) => {
    try {
        const user = await getById(userId);
        const hobbies = await receiveHobbies(userId);

        if (!user) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ data: null, error: `User with id ${userId} doesn't exist` }));
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(hobbies));
    } catch (error) {
        console.log(error);
    }
}

const updateHobbies = async (req, res, userId) => {
    try {
        const user = await getById(userId);

        if (!user) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ data: null, error: `User with id ${userId} doesn't exist` }));
        } else {
            const body = await getBodyData(req);
            const { hobbies } = JSON.parse(body);
            const response = await update(user, userId, hobbies);

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response));
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getHobbies, updateHobbies };