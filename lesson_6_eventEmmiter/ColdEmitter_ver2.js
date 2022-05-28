const EventEmitter = require('events')

class ColdEmitter extends EventEmitter {
    constructor() {
        super();
        this.events = [];
        this.existedListeners = {};
        this.trigger = this.trigger.bind(this);
        this.on('newListener', (eventName, listener) => {
            if (!this.existedListeners[eventName]) {
                this.existedListeners[eventName] = true;
                this.addListener(eventName, listener);
                this.events.forEach((event) => {
                    if (event === eventName) {
                        //listener();
                        this.emit(event);
                    }
                });
                this.events = [];
            }
        });
    }

    on(event, callback) {
        super.emit('newListener', (event))
        super.on(event, callback);
    }

    emit(event, ...args) {
        this.events.push(event);
        super.emit(event, ...args);
    }

}

const a = new ColdEmitter()

a.trigger('wait')
a.trigger('wait')
a.trigger('wait')

a.on('wait', () => {
    console.log('still executed')
})
