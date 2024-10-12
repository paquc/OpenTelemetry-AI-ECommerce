function calculatePrimes(limit) {

    const primes = [];
    
    for (let i = 2; i <= limit; i++) {
        let isPrime = true;
        
        // Check if 'i' is prime
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }
        
        // If 'i' is prime, add it to the list
        if (isPrime) {
            primes.push(i);
        }
    }
    
    return primes;
}

// Call the function with a high limit to consume CPU
// console.log(calculatePrimes(1000000));  // Calculates primes up to 1,000,000

module.exports = 
{
    calculatePrimes,
};
