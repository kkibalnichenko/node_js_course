export class EventEmitter {
    listeners = {};  // key-value pair

    addListener(eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName] = [...this.listeners[eventName], fn];

        return this;
    }

    on(eventName, fn) {
        return this.addListener(eventName, fn);
    }

    removeListener(eventName, fn) {
        let listener = this.listeners[eventName];
        if (!listener || !listener.length) return this;

        listener = listener.filter(event => event !== fn);
        this.listeners = {...this.listeners, [eventName]: listener};

        return this;
    }

    off(eventName, fn) {
        return this.removeListener(eventName, fn);
    }

    once(eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        const wrapper = () => {
            fn();
            this.off(eventName, wrapper);
        }
        this.listeners[eventName] = [...this.listeners[eventName], wrapper];

        return this;
    }

    emit(eventName, ...args) {
        let fns = this.listeners[eventName];
        if (!fns) return false;
        fns.forEach((f) => {
            f(...args);
        });

        return true;
    }

    listenerCount(eventName) {
        return (this.listeners[eventName] || []).length;
    }

    rawListeners(eventName) {
        return this.listeners[eventName];
    }
}