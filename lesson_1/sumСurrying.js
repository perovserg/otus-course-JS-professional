// const sum = (function() {
//     let acc = 0;
//     const innerFunc = (number) => {
//         acc += number || 0;
//         if (number === undefined) {
//             const result = acc;
//             acc = 0; // todo: есть ли способ избежать этого костыля для обнуления счетчика?
//             return result;
//         }
//         return innerFunc;
//     };
//     return innerFunc;
// })();

const sum = (num) => (num2) => num2 === undefined ? num : sum(num + num2);

console.log(sum(1)(2)(3)(4)(5)()); // 15
console.log(sum(10)(20)()) // 30
console.log(sum(1)(2)(3)(4)(5)(0)(-10)()) // 5
console.log(sum(7)(8)(9)(0)()) //24
