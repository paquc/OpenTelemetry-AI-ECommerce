:: SMOKE TEST
set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=1800s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=1800s
set NUMBER_OF_USERS=3
k6 run .\use_system.js 

:: SPIKE Test
set TEST_TYPE=3
set TEST_SLEEP_DURATION=2
set RAMPS_UP_PERIOD=1800s
set RAMP_TARGET=5
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=1000s
set RAMP_TARGET=200
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=3
set TEST_DURATION=1800s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=30s
set RAMP_TARGET=500
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=500s
set NUMBER_OF_USERS=3
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=2
set RAMPS_UP_PERIOD=60s
set RAMP_TARGET=100
k6 run .\use_system.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=1
set RAMPS_UP_PERIOD=20s
set RAMP_TARGET=100
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=1
set TEST_DURATION=600s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=1
set RAMPS_UP_PERIOD=120s
set RAMP_TARGET=50
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=100s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 


