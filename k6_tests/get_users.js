import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 10,
  // A string specifying the total duration of the test run.
  duration: '1s',
};

// export const options = {
//   stages: [
//     { duration: '30s', target: 20 },
//     { duration: '1m30s', target: 10 },
//     { duration: '20s', target: 0 },
//   ],
// };
function listUsers(numberOfUsers, print) {
  const res = http.get('http://localhost:9000/userslist');
  const users = JSON.parse(res.body);
  if (print)
    console.log(users);
  check(res, { [`contains ${numberOfUsers} users`]: (r) => JSON.parse(r.body).length === numberOfUsers });
  sleep(1);
}

export default function () {
  listUsers(2, true);
  sleep(1);
}