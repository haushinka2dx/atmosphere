#!/bin/sh

vertx_pid=`ps aux | grep "vert.x" | grep "atmosphere" | grep -v "grep" | awk '{ print $2; }'`
if [ ${#vertx_pid} -gt 0 ]; then
	kill $vertx_pid
fi
