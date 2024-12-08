:: SMOKE TEST
set TEST_TYPE=1
set TEST_SLEEP_DURATION=3
set TEST_DURATION=25000s
set NUMBER_OF_USERS=10
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=3
set TEST_DURATION=60000s
set NUMBER_OF_USERS=10
k6 run .\use_system.js 

:: SPIKE Test
set TEST_TYPE=3
set TEST_SLEEP_DURATION=2
set RAMPS_UP_PERIOD=36000s
set RAMP_TARGET=25
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=1
set RAMPS_UP_PERIOD=50000s
set RAMP_TARGET=100
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=3
set TEST_DURATION=1800s
set NUMBER_OF_USERS=10
k6 run .\use_system.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=3600s
set RAMP_TARGET=250
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=40000s
set NUMBER_OF_USERS=10
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=2
set RAMPS_UP_PERIOD=60000s
set RAMP_TARGET=250
k6 run .\use_system.js 

:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_TYPE=5
set TEST_SLEEP_DURATION=0
set RAMPS_UP_PERIOD=2000s
set RAMP_TARGET=350
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=2
set TEST_DURATION=10000s
set NUMBER_OF_USERS=10
k6 run .\use_system.js 

:: STRESS test  
set TEST_TYPE=4
set TEST_SLEEP_DURATION=1
set RAMPS_UP_PERIOD=12000s
set RAMP_TARGET=300
k6 run .\use_system.js 

set TEST_TYPE=1
set TEST_SLEEP_DURATION=5
set TEST_DURATION=3000s
set NUMBER_OF_USERS=1
k6 run .\use_system.js 


