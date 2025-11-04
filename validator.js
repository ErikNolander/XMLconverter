const rules = {
    B: ['O', 'C', 'A'],
    O: ['T', 'A'],
    C: ['T', 'A']
};

//kolla antal delar per typ och jämföra med content lenght? B = 1, A = 3, O = 1, C = 2, T = 2
function fileValidator(records) {
    for (let i = 0; i < records.length - 1; i++) {
        const currentType = records[i].type;
        const nextType = records[i + 1].type;
        const allowedNext = rules[currentType];
        if (allowedNext && !allowedNext.includes(nextType)) {
            throw new Error(`Validation error at line ${i + 2}: ${nextType} cannot follow ${currentType}`);
        }
    }   
}


module.exports = {
    fileValidator
};