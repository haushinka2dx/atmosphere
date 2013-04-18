#!/bin/sh

vertx_pid=`ps aux | grep "vert.x" | grep "atmos_server.js" | grep -v "grep" | awk '{ print $2; }'`
if [ ${#vertx_pid} -gt 0 ]; then
	kill $vertx_pid
fi
