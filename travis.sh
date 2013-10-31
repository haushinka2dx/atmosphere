#!/bin/bash

ROOT_DIR=`pwd`
TRAVIS_DIR="$ROOT_DIR/travis"
VERTX_DIR="$TRAVIS_DIR/vertx"
VERTX_VERSION=2.0.2-final
VERTX_NAME="vert.x-$VERTX_VERSION"

STATUS_SUCCESS=0
STATUS_FAIL=1

throw_error() {
  msg=$1
  echo "[ERROR] $msg" 1>&2
  exit $STATUS_FAIL
}

setup_directory() {
  dir=$1
  if [[ ! -e $dir ]]; then
    echo "mkdir $dir"
    mkdir -p $dir
  elif [[ ! -d $dir ]]; then
    throw_error "$dir already exists but is not a directory"
  fi
}

install_vertx() {
  if [[ ! -e $VERTX_DIR ]]; then
    throw_error "$VERTX_DIR is not found"
  elif [[ ! -d $VERTX_DIR ]]; then
    throw_error "$VERTX_DIR already exists but is not a directory"
  fi
  wget http://dl.bintray.com/vertx/downloads/$VERTX_NAME.tar.gz -P $VERTX_DIR

  compression_file=$VERTX_DIR/$VERTX_NAME.tar.gz
  if [[ ! -e $compression_file ]]; then
    throw_error "file not found $compression_file"
  fi
  tar xvzf $compression_file -C $VERTX_DIR

  export PATH=$VERTX_DIR/$VERTX_NAME/bin:$PATH
}

run_spec() {
  result_file="$TRAVIS_DIR/test_result.txt"
  ./run-spec.sh > $result_file
  cat $result_file

  is_passed=`tail -n 1 $result_file | grep 'SUCCESS'`
  if [ -n "$is_passed" ]; then
    exit $STATUS_SUCCESS
  else
    exit $STATUS_FAIL
  fi
}

main() {
  setup_directory $VERTX_DIR
  install_vertx
  run_spec
}

main
