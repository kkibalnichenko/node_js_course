import { EventEmitter } from "./task1.js";

export class WithTime extends EventEmitter {
    execute(asyncFunc, ...args) {
        // emit event start, end, data received
        // call asyncFunc with args specified
        // compute the time it takes to execute asyncFunc
        this.emit('begin');
        console.time('execute');
        this.on('data', (data) => console.log('data received:', data));
        asyncFunc(...args, (err, data) => {
            if (err) {
                return this.emit('error', err);
            }

            this.emit('data', data);
            console.timeEnd('execute');
            this.emit('end');
        });
    }
}

export const fetchFromUrl = (url, cb) => {
    fetch(url)
        .then((response) => response.json())
        .then(function(data) {
            cb(null, data);
        });
}