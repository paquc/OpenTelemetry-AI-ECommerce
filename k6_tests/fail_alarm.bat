:: Used to generate a constant load on the system and some errors

set TEST_TYPE=1
set TEST_SLEEP_DURATION=5
set TEST_DURATION=3600s
set NUMBER_OF_USERS=10
k6 run .\use_system.js 

:: BREAKPOINT test
set TEST_SLEEP_DURATION=0
set TEST_TYPE=5
set RAMPS_UP_PERIOD=5000s
set RAMP_TARGET=100
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=3
set TEST_DURATION=3600s
set NUMBER_OF_USERS=3
k6 run .\use_system.js 


