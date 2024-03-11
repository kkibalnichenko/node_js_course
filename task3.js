import events from 'events';
import fs from 'fs';
import readline from 'readline';
import csv from 'csvtojson';

const csvFilePath = './csv/example.csv';
const txtFilePath = './write-result.txt';

(async function csvFileReaderLineByLine() {
    try {
        if (fs.existsSync(txtFilePath)) {
            fs.unlink(txtFilePath, (err) => {
                if (err) throw err;
            });
        }

        const rl = readline.createInterface({
            input: fs.createReadStream(csvFilePath).pipe(csv()),
        });

        rl.on('line', (line) => {
            fs.appendFile(txtFilePath, `${line}\r`, (err) => {
                if (err) throw err;
            });
        });

        await events.once(rl, 'close');
    } catch (err) {
        console.error(err);
    }
})();