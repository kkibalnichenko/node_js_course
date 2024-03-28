const { getAll, create, getById, remove } = require('../models/user-model');
const { getBodyData } = require('../utils');

const getUsers = async (req, res) => {
    try {
        const users = await getAll();

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(users.data));
    } catch (error) {
        console.log(error);
    }
}

const createUser = async (req, res) => {
    try {
        const body = await getBodyData(req);
        const { name, email } = JSON.parse(body);
        const user = { name, email };
        const newUser = await create(user);

        res.writeHead(201, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(newUser));
    } catch (error) {
        console.log(error);
    }
}

const deleteUser = async (req, res, userId) => {
    try {
        const user = await getById(userId);

        if (!user) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ data: null, error: `User with id ${userId} doesn't exist` }));
        } else {
            await remove(userId);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ data: { success: true }, error: null }));
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getUsers, createUser, deleteUser };