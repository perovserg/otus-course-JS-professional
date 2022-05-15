const fs = require('fs');
const path = require('path');

class FileTree {
    rootPath;
    treeObject = {
        files: [],
        dirs: [],
    };
    constructor(rootPath) {
        this.rootPath = rootPath;
    }

    checkPath(checkedPath) {
        return new Promise((resolve, reject) => {
            fs.stat(checkedPath, (err, stats) => {
                if (err) reject(err);
                if (stats.isDirectory()) {
                    this.treeObject.dirs.push(checkedPath);
                    this.get(checkedPath)
                        .then(() => resolve());
                } else {
                    this.treeObject.files.push(checkedPath);
                    resolve();
                }
            });
        });
    }

    get(currentPath = this.rootPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(currentPath, async (err, files) => {
                if (err) reject(err);
                await Promise.all(files.map(file => this.checkPath(path.join(currentPath, file))));
                resolve(this.treeObject);
            });
        });
    }
}

const args = require('minimist')(process.argv.slice(2));

const rootPath = path.join(__dirname, args.path || '');

const fileTree = new FileTree(rootPath);

(async function() {
    const tree = await fileTree.get();

    console.log('tree => ', tree);
})()
