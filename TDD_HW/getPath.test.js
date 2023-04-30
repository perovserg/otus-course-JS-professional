const fs = require('fs');
const { JSDOM } = require('jsdom');
const { getPath } = require('./getPath');

describe('getPath returns unique selector for node', () => {
    const html = fs.readFileSync(__dirname+'/index.html');
    const { document } = (new JSDOM(html)).window;

    it('throws error if node is empty', () => {
        expect(() => {
            getPath();
        }).toThrow('node is empty');
    });

    const nodes = Array.from(document.querySelectorAll('*'))

    for (const node of nodes) {
        const { localName } = node;
        it(`for node '${localName}'' returns string`, () => {
            expect(typeof getPath(node)).toBe('string')
        });

        it(`for node '${localName}' returns not empty string`, () => {
            expect(getPath(node).length).not.toBe(0)
        })

        it(`for node '${localName}' querySelectorAll returns only one node`, () => {
            expect(document.querySelectorAll(getPath(node)).length).toBe(1);
        })

        it(`for node '${localName}' querySelector returns the same node`, () => {
            expect(document.querySelector(getPath(node))).toBe(node);
        })
    }
});
