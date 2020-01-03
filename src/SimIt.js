/**
 * @author Conor Irwin <https://github.com/RetroVX> 
 * @license {@link http://opensource.org/licenses/MIT|MIT License}
 * @classdesc
 * Simulate keyboard and mouse events in the browser
 * @class SimIt
 * @version 1.0.0
 * @example
 * const simit = new SimIt();
 * 
 * simit.click(150, 150);
 */
export default class SimIt {

    constructor(element) {

        /**
         * Set the element to simulate keyboard/mouse events on. Defaults to window
         * @name SimIt.element
         */
        this.element = element || window || document;
    }


    /**
     * Runs through a sequence of steps in an asynchronous manner.
     * This can be a sequence of any supported keyboard/mouse events and callbacks.
     * @method SimIt.all
     * @async
     * @param {array} sequence - an array of objects containing the steps needed to simulate
     * @param {function} [onStart] - callback function that runs once the sequence is starting
     * @param {function} [onComplete] - callback function that runs once the sequence has completed
     * @example
     * simit.all([
     *     { keydown: 's' },
     *     { keyup: 'i' },
     *     { keypress: 'm' },
     *     { sleep: 1000 },
     *     { keydown: 'i' },
     *     { keydown: 't' }
     * ], onStart, onComplete);
     */
    async all(sequence, onStart, onComplete) {

        if(onStart === undefined || onStart === null) { onStart = function(){}; }
        if(onComplete === undefined || onComplete === null) { onComplete = function(){}; }

        onStart(sequence);

        const length = sequence.length;
        let stepCounter = 0;

        for(let step of sequence) {
            stepCounter++;

            await this._checkEvent(step);

            // sequence has finished
            if(stepCounter === length) {
                onComplete(sequence);
            }
        }
    }


    /**
     * Repeats a simulated event
     * @method SimIt.repeat
     * @async
     * @param {object} step - the step to simulate and repeat
     * @param {number} [amount=1] - how many times should the event be repeated?
     * @param {number} [delay=0] - how big the delay should be inbetween each repeated event
     * @example
     * // click at x 150, y 250, 10 times with a 500ms delay between each click
     * simit.repeat({ click: { x: 150, y: 250 } }, 10, 500);
     */
    async repeat(step, amount, delay) {
        if(amount === undefined || amount === null) { amount = 1; }
        if(delay === undefined || delay === null) { delay = 0; }

        for(let i = 0; i < amount; i++) {
            await this.sleep(delay);

            await this._checkEvent(step);
        }
    }


    /**
     * Delays the next step in a sequence by x ms
     * @method SimIt.sleep
     * @param {number} ms - milliseconds to delay by (1000 = 1 second)
     * @example
     * async function Hello() {
     *     await simit.sleep(1000);
     *     console.log('I will run after 1 second');
     * }
     * Hello();
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /**
     * Simulates a click event on the selected element or window
     * @method SimIt.click
     * @param {number} x - the clientX position to click
     * @param {number} y - the clientY position to click
     * @example
     * simit.click(150, 250);
     */
    click(x, y) {
        return this.element.dispatchEvent(new MouseEvent('click', {'clientX': x || 0, 'clientY': y || 0}));
    }


    /**
     * Simulates the keydown event on the selected element or window
     * @method SimIt.keydown
     * @param {string} key - the key string to simulate
     * @example
     * simit.keydown('a');
     */
    keydown(key) {
        return this.element.dispatchEvent(new KeyboardEvent('keydown', {'key': key || undefined}));
    }


    /**
     * Simulates the keyup event on the selected element or window
     * @method SimIt.keyup
     * @param {string} key - the key string to simulate
     * @example
     * simit.keyup('b');
     */
    keyup(key) {
        return this.element.dispatchEvent(new KeyboardEvent('keyup', {'key': key || undefined}));
    }


    /**
     * Simulates the keypress event on the selected element or window
     * @method SimIt.keypress
     * @param {string} key - the key string to simulate
     * @example
     * simit.keypress('c');
     */
    keypress(key) {
        return this.element.dispatchEvent(new KeyboardEvent('keypress', {'key': key || undefined}));
    }


    /**
     * Set the element to simulate with.
     * This method is chainable with every other method.
     * @method SimIt.setElement
     * @param {HTMLElement} element - the element to simulate with
     * @example
     * const element = document.querySelector('myElement');
     * simit.setElement(element);
     * 
     * simit.setElement(element).repeat({ keydown: 't' }, 5);
     */
    setElement(element) {
        this.element = element;

        return this;
    }
    

    /**
     * Internal method used during SimIt.all and SimIt.repeat.
     * Checks which type of event is needed and dispatches it.
     * @method SimIt._checkEvent
     * @async
     * @param {object} obj - the step object to check
     */
    async _checkEvent(obj) {
        if(obj.keydown) {
            this.keydown(obj.keydown);
        }
        else if(obj.keyup) {
            this.keyup(obj.keyup);
        }
        else if(obj.keypress) {
            this.keypress(obj.keypress);
        }
        else if(obj.click) {
            this.click(obj.click.x, obj.click.y);
        }
        else if(obj.sleep) {
            await this.sleep(obj.sleep);
        }
        else if(obj.callback) {
            await obj.callback();
        }
        else if(obj.repeat) {
            await this.repeat(obj.repeat.event, obj.repeat.amount, obj.repeat.delay);
        }
    }
}