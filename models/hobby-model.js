const path = require('path');
let hobbies = require('../mocks/hobbies.json');
const { writeToFile } = require('../utils');

const receiveHobbies = (id) => {
    return new Promise((resolve, reject) => {
        const hobby = hobbies.data.find((hobby) => hobby.links.user === `/api/users/${id}`);
        resolve({
            data: hobby,
            error: null
        });
    })
}

const update = (user, id, updatedHobbies) => {
    return new Promise((resolve, reject) => {
        const index = hobbies.data.findIndex((hobby) => hobby.links.user === `/api/users/${id}`);
        let newHobbies = [...hobbies.data[index].hobbies, ...updatedHobbies];
        newHobbies = [...new Set(newHobbies)];
        hobbies.data[index] = { ...hobbies.data[index], hobbies: newHobbies };
        writeToFile(path.join(__dirname, '../mocks/hobbies.json'), hobbies);
        resolve({
            data: user,
            error: null
        });
    })
}

module.exports = { receiveHobbies, update };