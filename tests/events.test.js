const SimIt = require('../dist/simit.js');

const sim = new SimIt();

describe('Testing the individual keyboard and mouse events', () => {

    test('SimIt.keydown should emit a keydown event with the key being "a"', () => {

        const keydown = sim.keydown('a');

        window.addEventListener('keydown', (e) => {

            expect(e.key).toEqual('a');
        })

    })

    test('SimIt.keyup should emit a keyup event with the key being "a"', () => {

        const keyup = sim.keyup('a');

        window.addEventListener('keyup', (e) => {

            expect(e.key).toEqual('a');
        })

    })

    test('SimIt.keypress should emit a keypress event with the key being "a"', () => {

        const keypress = sim.keypress('a');

        window.addEventListener('keypress', (e) => {

            expect(e.key).toEqual('a');
        })

    })

    test('SimIt.click should emit a mouse click event with the clientX and Y being 100, 150', () => {

        const click = sim.click(100, 150);

        window.addEventListener('click', (e) => {

            expect(e.clientX).toEqual(100);
            expect(e.clientY).toEqual(150);

        })

    })

    test('SimIt.sleep should pause for 1 second then continue', async () => {

        const start = new Date().getTime();
        await sim.sleep(1000);
        const now = new Date().getTime();
        expect((now - start)).toBe(1001);

    })


})