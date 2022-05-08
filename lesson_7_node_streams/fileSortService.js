/*

Необходимо отсортировать большой файл со случайными целыми числами, размером 100 МБ,
в условиях ограниченной оперативной памяти - 50 МБ. Решение должно быть построено с использованием потоков.
Для решения задачи можно использовать алгоритм “Сортировка слиянием”.
Процесс можно разделить на 3 этапа.
Этап 0 Любым удобным вам способом создаем исходный файл с числами размером 100 МБ.
Этап 1 Исходный файл с числами необходимо разбить на несколько файлов поменьше,
предварительно отсортировав их независимо друг от друга.
Этап 2 Необходимо создать механизм чтения чисел сразу из нескольких файлов (потоков).
Читать данные из потоков следует по принципу pause/resume.
Этап 3 Необходимо создать цикл, который будет работать с данными сразу из всех потоков.
Такой цикл будет прерван только тогда, когда будут полностью прочитаны все файлы.
В цикле следует искать наименьшее значение и записывать его в итоговый файл. 1 итерация = 1 число
Для проверки решения, скрипт необходимо запустить командой
$ node --max-old-space-size=50 script.js

*/

const path = require('path');
const fs =require('fs');

const megaByte = 1000000;

// const unsortedFileSize = 1; // in Mb
// const chunkSize = 0.1; // in Mb
// const highWaterMark = 1024; // in bytes

const unsortedFileSize = 100; // in Mb
const chunkSize = 10; // in Mb
const highWaterMark = 64 * 1024; // in bytes

const fillUnsortedFile = (unsortedFilePath) => {
    let multiplier = 100;
    let part = 0.1;
    while (true) {
        try {
            const { size: fileSizeInBytes } = fs.statSync(unsortedFilePath);
            const fileSizeInMegaBytes = Math.trunc(fileSizeInBytes / megaByte);
            if (fileSizeInMegaBytes >= unsortedFileSize * part) {
                console.log(`Unsorted file filled to: ${fileSizeInMegaBytes} Mb`);
                part += 0.1;
            }
            if (fileSizeInBytes > unsortedFileSize * megaByte) {
                return;
            }
        } catch (e) {
            console.log('unsorted file doesn\'t exist');
        }

        const num = Math.round(Math.random() * multiplier++);
        fs.appendFileSync(unsortedFilePath, num + ' ');
    }
};

const getSorted = (str) => {
    const arrayOfNumbers = str.split(' ').map(Number);
    arrayOfNumbers.sort((a, b) => a-b);
    return arrayOfNumbers.join(' ');
};

const sortAndWriteToFile = (str, fileName) => {
    const sorted = getSorted(str);
    fs.writeFileSync(fileName, sorted);
    console.log('created file: ', fileName);
};

const checkChunkDir = (chunkDir) => {
    if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir);
    }
}

const getChunkFileNameGetter = (chunkDir, chunkPrefix) => (fileNameCount) => {
    return path.join(chunkDir, `${chunkPrefix}${fileNameCount}.txt`);
};

const getMainAndTail = (str, prevTail) => {
    const lastIndex = str.lastIndexOf(' ');
    if (lastIndex === -1) {
        return { main: str, tail: '' };
    }
    const main = prevTail + str.slice(0, lastIndex);
    const tail = str.slice(lastIndex + 1);
    return { main, tail };
};

const readSplitSort = (unsortedFilePath, chunkDir, chunkPrefix) => {
    checkChunkDir(chunkDir);
    return new Promise((resolve) => {
        let fileNameCount = 1;
        const readStream = fs.createReadStream(unsortedFilePath, { highWaterMark });
        let bufferString = '';
        let prevTail = '';
        const getChunkFileName = getChunkFileNameGetter(chunkDir, chunkPrefix);
        readStream.on('data', (chunk) => {
            const sizeInBytes = Buffer.byteLength(bufferString, 'utf8');
            if (sizeInBytes > chunkSize * megaByte) {
                const { main, tail } = getMainAndTail(bufferString.toString(), prevTail);
                prevTail = tail;
                sortAndWriteToFile(main, getChunkFileName(fileNameCount));
                fileNameCount++;
                bufferString = chunk;
            } else {
                bufferString += chunk;
            }
        });
        readStream.on('end', () => {
            const { main, tail } = getMainAndTail(bufferString.toString(), prevTail);
            prevTail = tail;
            sortAndWriteToFile(main, getChunkFileName(fileNameCount));
            bufferString = '';
            resolve();
        });
    });
}

const addListeners = (obj) => {
    obj.stream.on('data', (data) => {
        obj.stream.pause();
        const tailBuffer = Buffer.from(obj.tail, 'utf-8');
        const dataWithPrevTail = Buffer.concat([tailBuffer, data]).toString();
        obj.tail = dataWithPrevTail;
        obj.length = dataWithPrevTail.length;
        obj.padding = false;
    });
    obj.stream.on('end', () => {
        obj.done = true;
        obj.padding = false;
    });
};

const getChunksStreams = (chunkDir, chunkPrefix) => {
    const result = {};
    const files = fs.readdirSync(chunkDir);
    for (let filename of files) {
        if (filename.includes(chunkPrefix)) {
            result[filename] = {
                stream: fs.createReadStream(path.join(chunkDir, filename), { highWaterMark }),
                tail: '',
                length: 0,
                num: undefined,
                done: false,
                padding: false,
            }
            addListeners(result[filename]);
        }
    }
    return result;
};

const getNextNumAndTail = (str) => {
    const index = str.indexOf(' ');
    if (index === -1) {
        return { num: parseInt(str, 10), tail: '' };
    }
    const num = str.slice(0, index);
    const tail = str.slice(index + 1);
    return { num: parseInt(num, 10), tail };
};

const hasSomethingUnDone = (chunksStreams) => {
    for (let file in chunksStreams) {
        if (chunksStreams[file].done === false || chunksStreams[file].tail.length) {
            return true;
        }
    }
    return false;
}

const waitPadding =(obj) => {
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if (!obj.padding) {
                clearInterval(intervalId);
                resolve();
            }
        }, 1);
    });
};

const readChunksSortWriteToFile = async (chunkDir, chunkPrefix, resultFilePath) => {
    const chunksStreams = getChunksStreams(chunkDir, chunkPrefix);


    while (hasSomethingUnDone(chunksStreams)) {
        let min = Infinity;
        for (let file in chunksStreams) {
            if (chunksStreams[file].tail.length <= chunksStreams[file].length * 0.1 && !chunksStreams[file].done) {
                chunksStreams[file].padding = true;
                chunksStreams[file].stream.resume();
                await waitPadding(chunksStreams[file]);
            }

            if (chunksStreams[file].num === undefined && chunksStreams[file].tail.length) {
                const { num, tail } = getNextNumAndTail(chunksStreams[file].tail);
                chunksStreams[file].num = num;
                chunksStreams[file].tail = tail;
            }

            min = Math.min(min, chunksStreams[file].num ?? Infinity);
        }
        for (let file in chunksStreams) {
            if (chunksStreams[file].num === min) {
                fs.appendFileSync(resultFilePath, min + ' ');
                chunksStreams[file].num = undefined;
                min = Infinity;
                break;
            }
        }
    }
};

(async function main() {
    console.time('main');
    fillUnsortedFile(path.join(__dirname, 'unsorted.txt'));
    await readSplitSort(path.join(__dirname, 'unsorted.txt'), path.join(__dirname, 'sortedChunks'), 'chunk');
    await readChunksSortWriteToFile(
        path.join(__dirname, 'sortedChunks'),
        'chunk',
        path.join(__dirname, 'sorted.txt'),
    );
    console.log('<< finish >>');
    console.timeEnd('main');
})();
