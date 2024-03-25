const fs = require('fs');

const writeToFile = (file, content) => {
    try {
        fs.writeFileSync(file, JSON.stringify(content), 'utf8');
    } catch(error) {
        console.error(error);
    }
}

const getBodyData = (req) => {
    return new Promise((resolve, reject) => {
        try {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', () => {
                resolve(body);
            });
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = { writeToFile, getBodyData }