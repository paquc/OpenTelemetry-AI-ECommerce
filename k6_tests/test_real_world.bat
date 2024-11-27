:: SMOKE TEST
set TEST_TYPE=1
set TEST_SLEEP_DURATION=0
set TEST_DURATION=5s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=0
set TEST_DURATION=5s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

:: SPIKE Test
set TEST_TYPE=3
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=10s
set RAMP_TARGET=5
k6 run .\use_system.js 

:: BREAKPOINT test
set TEST_TYPE=4
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=10s
set RAMP_TARGET=100
k6 run .\use_system.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=5s
set RAMP_TARGET=150
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=0
set TEST_DURATION=5s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

