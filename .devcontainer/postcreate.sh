#!/bin/bash
set -e

sudo apt-get update
sudo apt-get install -y lolcat

yarn install

mkdir -p ~/.ssh && chmod 700 ~/.ssh
