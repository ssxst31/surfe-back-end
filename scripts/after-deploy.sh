#!/bin/bash
REPOSITORY=/home/ec2-user/build

cd $REPOSITORY

sudo npm i

pm2 start dist/bundle.js