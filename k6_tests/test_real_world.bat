:: SMOKE TEST
set TEST_TYPE=1
set TEST_SLEEP_DURATION=3
set TEST_DURATION=6000s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=3
set TEST_DURATION=6000s
set NUMBER_OF_USERS=5
k6 run .\use_system.js 

:: SPIKE Test
set TEST_TYPE=3
set TEST_SLEEP_DURATION=2
set RAMPS_UP_PERIOD=3600s
set RAMP_TARGET=5
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=1
set RAMPS_UP_PERIOD=5000s
set RAMP_TARGET=50
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
set RAMPS_UP_PERIOD=500s
set RAMP_TARGET=200
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=4000s
set NUMBER_OF_USERS=5
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=2
set RAMPS_UP_PERIOD=6000s
set RAMP_TARGET=100
k6 run .\use_system.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=200s
set RAMP_TARGET=100
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=1000s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=1
set RAMPS_UP_PERIOD=1200s
set RAMP_TARGET=50
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=4
set TEST_DURATION=3000s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 


