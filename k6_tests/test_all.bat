:: SMOKE TEST
set TEST_TYPE=1
set TEST_DURATION=10s
set NUMBER_OF_USERS=100
@REM k6 run .\get_users.js 

:: SPIKE Test
set TEST_TYPE=3
set RAMPS_UP_PERIOD=20s
set RAMP_TARGET=2000
@REM k6 run .\get_users.js 

:: BREAKPOINT test
set TEST_TYPE=5
set RAMPS_UP_PERIOD=20s
set RAMP_TARGET=2000
k6 run .\get_users.js

