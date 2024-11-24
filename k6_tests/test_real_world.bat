:: SMOKE TEST
set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=10s
set NUMBER_OF_USERS=1
k6 run .\get_users.js 

:: SPIKE Test
set TEST_TYPE=3
set TEST_SLEEP_DURATION=2
set RAMPS_UP_PERIOD=20s
set RAMP_TARGET=20
k6 run .\get_users.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=5s
set RAMP_TARGET=50
k6 run .\get_users.js

set TEST_TYPE=1
set TEST_SLEEP_DURATION=1
set TEST_DURATION=5s
set NUMBER_OF_USERS=1
k6 run .\get_users.js 
