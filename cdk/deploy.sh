#!/bin/bash
##
## Use this script to deploy the app to a personal sandbox account
##

echo "$(date) deploying to sandbox..."

cdk deploy AppStack --profile sandbox --outputs-file=outputs.json

echo "$(date) done);"
