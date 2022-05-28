const EventEmitter = require('events');

class ColdEmitter extends EventEmitter {
    trigger(event) {
        setTimeout(() => {
            this.emit(event);
        }, 0);
    }
}

const a = new ColdEmitter();

a.trigger('wait');

a.on('wait', () => {
    console.log('still executed');
})
