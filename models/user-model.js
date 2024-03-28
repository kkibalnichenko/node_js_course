const { v4: uuidv4 } = require('uuid');
let users = require('../mocks/users.json');
const path = require('path');
const { writeToFile } = require('../utils');

const getAll = () => {
    return new Promise((resolve, reject) => {
        resolve(users);
    })
}

const getById = (id) => {
    return new Promise((resolve, reject) => {
        const user = users.data.find((user) => user.user.id === id);
        resolve(user);
    })
}

const create = (data) => {
    return new Promise((resolve, reject) => {
        const userId = uuidv4();
        const newUser = {
            user: {
                id: userId,
                name: data.name,
                email: data.email
            },
            links: {
                self: `/api/users/${userId}`,
                hobbies: `/api/users/${userId}/hobbies`
            }
        };
        users.data.push(newUser);
        writeToFile(path.join(__dirname, '../mocks/users.json'), users);
        resolve({
            data: newUser,
            error: null
        });
    })
}

const remove = (id) => {
    return new Promise((resolve, reject) => {
        const filteredUsersData = users.data.filter((user) => user.user.id !== id);
        users = { ...users, data: filteredUsersData };
        writeToFile(path.join(__dirname, '../mocks/users.json'), users);
        resolve();
    })
}

module.exports = { getAll, getById, create, remove };