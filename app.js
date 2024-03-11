'use strict';
const https = require('https');
const fs = require('fs');
const childProcess = require('child_process');
const os = require('os');

const port = 4000;
const options = { shell: 'powershell.exe' };
const winCommand = `Get-Process | Sort-Object CPU -Descending | Select-Object -Property Name, CPU, WorkingSet -First 1 | ForEach-Object { $_.Name + ' ' + $_.CPU + ' ' + $_.WorkingSet }`;
const macOSLinuxCommand = `ps -A -o %cpu,%mem,comm | sort -nr | head -n 1`;
const osType = os.type();
const server = https.createServer((req, res) => {
    res.writeHead(200);
});
const allowedOS = {
    windows: 'Windows_NT',
    linux: 'Linux',
    macOS: 'Darwin',
};
let stdoutGlobal;

const execProcess = (command) => {
    childProcess.exec(command, osType === allowedOS.windows ? options : null, (error, stdout, stderr) => {
        stdoutGlobal = stdout;
        console.clear();
        console.log(`${stdout}`);

        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }

        if (error !== null) {
            console.log(`error: ${error}`);
        }
    });
}

function runner() {
    if (osType === allowedOS.windows) {
        execProcess(winCommand);
    }

    if (osType === allowedOS.linux || osType === allowedOS.macOS) {
        execProcess(macOSLinuxCommand);
    }
}
setInterval(runner, 100);

function appendFile() {
    if (stdoutGlobal) {
        const unixTimestamp = Math.floor(new Date().getTime() / 1000);
        fs.appendFile('activityMonitor.log', `${unixTimestamp} : ${stdoutGlobal}\r`, (err) => {
            if (err) throw err;
        });
    }
}
setInterval(appendFile, 1000 * 60);

server.listen(port, () => {});