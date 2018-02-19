#! /bin/bash

mongoimport --host mongodb --db user --collection users --type json --file /mongo-seed/user.json --jsonArray