:: SMOKE TEST
set TEST_SLEEP_DURATION=0

set TEST_TYPE=1
set TEST_DURATION=2s
set NUMBER_OF_USERS=1
k6 run .\get_users.js 

:: SPIKE Test
set TEST_TYPE=3
set RAMPS_UP_PERIOD=1s
set RAMP_TARGET=25
k6 run .\get_users.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set RAMPS_UP_PERIOD=5s
set RAMP_TARGET=450
k6 run .\get_users.js

set TEST_TYPE=1
set TEST_DURATION=5s
set NUMBER_OF_USERS=1
k6 run .\get_users.js 
