/*
Написать функцию
promiseReduce(asyncFunctions, reduce, initialValue)
asyncFunctions - массив асинхронных функций, возвращающих промис
reduce(memo, value) - функция, которая будет вызвана для каждого успешно завершившегося промиса.
initialValue - стартовое значение для функции reduce
promiseReduce последовательно вызывает переданные асинхронные функции
и выполняет reduce функцию сразу при получении результата до вызова следующей асинхронной функции. Функция promiseReduce должна возвращать промис с конечным результатом.
*/

const fn1 = (value) => () => {
    console.log('fn1 >> value => ', value)
    return Promise.resolve(value)
}
const fn2 = (value) => () => new Promise(resolve => {
    console.log('fn2 >> value => ', value)
    setTimeout(() => resolve(value), 1000)
})

const promiseReduce = async (asyncFunctions, reduce, initialValue) => {
    let acc = initialValue;
    for (const fn of asyncFunctions) {
        const value = await fn();
        acc = reduce(acc, value);
    }
    return acc;
};

promiseReduce(
    [
        fn1(2),
        fn2(3),
        fn1(4),
    ],
    function (memo, value) {
        console.log('reduce')
        return memo * value
    },
    1
).then(console.log);
