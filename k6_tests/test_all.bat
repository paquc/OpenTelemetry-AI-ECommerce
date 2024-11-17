:: SMOKE TEST
set TEST_TYPE=1
set TEST_DURATION=20s
set NUMBER_OF_USERS=1
k6 run .\get_users.js 

:: SPIKE Test
set TEST_TYPE=3
set RAMPS_UP_PERIOD=60s
set RAMP_TARGET=500
@REM k6 run .\get_users.js 

:: BREAKPOINT test
set TEST_TYPE=5
set RAMPS_UP_PERIOD=60s
set RAMP_TARGET=1000
@REM k6 run .\get_users.js

