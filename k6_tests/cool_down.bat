:: SMOKE TEST
set TEST_SLEEP_DURATION=1

set TEST_TYPE=1
set TEST_DURATION=10s
set NUMBER_OF_USERS=1
k6 run .\get_users.js 

