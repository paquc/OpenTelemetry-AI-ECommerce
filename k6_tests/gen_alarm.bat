:: Used to generate a constant load on the system and some errors
:: BREAKPOINT test
set TEST_SLEEP_DURATION=0

set TEST_TYPE=5
set RAMPS_UP_PERIOD=5s
set RAMP_TARGET=500
k6 run .\get_users.js

