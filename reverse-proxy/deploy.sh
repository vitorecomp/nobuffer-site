#!/bin/bash

home_path=$1

echo "Copying files to the sites-avaiable"

rm /etc/nginx/sites-available/*
cp *.dev /etc/nginx/sites-available/

echo "Creating the symbolic links"

rm -f /etc/nginx/sites-enabled/*

for file in `ls *.dev`; do
    echo "creating the symbolic link of $file"
    ln -s /etc/nginx/sites-available/$file /etc/nginx/sites-enabled/$file
done

echo "working on the certbot"

mkdir -p $home_path/logs
mkdir -p $home_path/cert-bot
mkdir -p $home_path/ssl-certs

for file in `ls *.dev`; do
    echo "add the certification to $file"
done





