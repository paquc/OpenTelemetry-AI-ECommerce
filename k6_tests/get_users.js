import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const testDuration = __ENV.TEST_DURATION;
const numberOfUsers = __ENV.NUMBER_OF_USERS;
const testType = parseInt(__ENV.TEST_TYPE, 10);

//set RAMPS_UP_PERIOD=10s
const rampUpPeriod = __ENV.RAMPS_UP_PERIOD;
// set RAMP_TARGET=5000
const rampTarget = __ENV.RAMP_TARGET;

let options;

// // SMOKE test
if (testType === 1) {
  options = {
    vus: numberOfUsers,
    duration: testDuration,
  };
}

// SMOKE test type 2
if (testType === 2) {
  options = {
    stages: [
      { duration: '30s', target: 20 },
      { duration: '1m30s', target: 10 },
      { duration: '20s', target: 0 },
    ],
  };
}

// SPIKE Test
if (testType === 3) {
  options = {
      // Key configurations for spike in this section
      stages: [
        { duration: rampUpPeriod, target: rampTarget },   // fast ramp-up to a high point
        // No plateau
        { duration: '5s', target: 0 },      // quick ramp-down to 0 users
      ],
    };
}

// STRESS test  
if (testType === 4) {
  options = {
      // Key configurations for Stress in this section
      stages: [
        { duration: '10m', target: 200 }, // traffic ramp-up from 1 to a higher 200 users over 10 minutes.
        { duration: '30m', target: 200 }, // stay at higher 200 users for 30 minutes
        { duration: '5m', target: 0 }, // ramp-down to 0 users
      ],
    };
}

// BREAKPOINT test
if (testType === 5) {
  options = {
    // Key configurations for breakpoint in this section
    executor: 'ramping-arrival-rate', //Assure load increase if the system slows
    stages: [
      { duration: rampUpPeriod, target: rampTarget }, // just slowly ramp-up to a HUGE load
    ],
  };  
}

export { options };



// Function that will call the /userslist endpoint and check if the response contains the expected number of users
function listUsers(numberOfUsers, print) {
  const res = http.get('http://localhost:9000/userslist');
  const users = JSON.parse(res.body);
  if (print)
    console.log(users);
  check(res, { [`contains ${numberOfUsers} users`]: (r) => JSON.parse(r.body).length === numberOfUsers });
  // sleep(randomIntBetween(0, 1));
}



export default function () {
  listUsers(6, false);
}