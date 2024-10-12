function consumeMemory(sizeInMB) {

    const oneMB = 1024 * 1024; // 1 MB in bytes
    const numElements = sizeInMB * oneMB / 8; // Number of 8-byte elements (size of a double in JavaScript)
    const largeArray = new Array(numElements);
    
    for (let i = 0; i < numElements; i++) {
        largeArray[i] = Math.random(); // Fill the array with random numbers to consume memory
    }

    console.log(`Allocated approximately ${sizeInMB} MB of memory.`);
    
    return largeArray; // Return the array to keep it in memory
}

module.exports = 
{
    consumeMemory,
};