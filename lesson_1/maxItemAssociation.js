/*
Написать функцию maxItemAssociation(), получающую исторические данные покупок пользователей и возвращающую максимальный список рекомендаций.
Входные данные - массив исторических покупок пользователей [["a", "b"], ["a", "c"], ["d", "e"]]. То есть пользователь 1 купил "a" и "b". Пользователь 2 купил продукты "a", "c". Пользователь 3 купил продукты "d", "e".
Надо найти максимальную группу рекомендаций. Группа рекомендаций - это продукты, которые был куплены другими пользователями при условии, если они пересекаются с исходным списком.
Если количество рекомендаций в группах одинаковое - вернуть первую группу, из отсортированных в лексикографическом порядке.
Решение:
Группа рекомендаций 1 - ["a", "b", "c"]. Покупка "a" содержится в списке 2, поэтому весь список 2 может быть добавлен в рекомендации.
Группа рекомендаций 2 - ["d", "e"].
Ответ: ["a", "b", "c"].
Пример 2:
Входные данные: [
["q", "w", 'a'],
["a", "b"],
["a", "c"],
["q", "e"],
["q", "r"],
]
Ответ ["a", "b", "c", "e", "q", "r", "w"] - это максимальная по пересечениям группа. Можно видеть, что первый массив пересекается со всеми остальными, и потому результат является всем множеством значений.
*/

const maxItemAssociation = (purchases) => {
    let associations = [...purchases];

    for (let i = 0; i < associations.length; i++) {
        for (let j = i + 1; j < purchases.length; j++) {
            const itHasSame = purchases[j].filter(item => associations[i].includes(item)).length > 0;
            if (itHasSame) {
                associations[i].push(...purchases[j]);
            }
        }
    }

    let maxLength = 0;
    associations = associations.map(item => {
        const uniqueValues = Array.from(new Set(item));
        maxLength = Math.max(maxLength, uniqueValues.length);
        return uniqueValues;
    }).filter(item => item.length === maxLength);

    if (associations.length === 1) {
        return associations[0].sort();
    }

    associations = associations
        .map((item) => item.sort())
        .sort((item1, item2) => {
            return item1[0] < item2[0] ? -1: 1;
        });

    return associations[0];
};


console.log(maxItemAssociation([
    ["b", "a"],
    ["c", "a"],
    ["d", "e"],
]));

console.log(maxItemAssociation([
    ["q", "w", 'a'],
    ["a", "b"],
    ["a", "c"],
    ["q", "e"],
    ["q", "r"],
]));

console.log(maxItemAssociation([
    ["e", "f"],
    ["a", "b"],
    ["c", "d"],
]));
