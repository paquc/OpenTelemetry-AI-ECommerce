:: SMOKE TEST
set TEST_TYPE=1
set TEST_SLEEP_DURATION=1
set TEST_DURATION=30s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

:: SPIKE Test
set TEST_TYPE=3
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=20s
set RAMP_TARGET=5
k6 run .\use_system.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=5s
set RAMP_TARGET=10
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=20s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

