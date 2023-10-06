#!/bin/bash
REPOSITORY=/home/ec2-user/build

cd $REPOSITORY

pm2 delete all

rm -rf build
