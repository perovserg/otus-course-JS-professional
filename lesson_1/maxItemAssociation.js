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
