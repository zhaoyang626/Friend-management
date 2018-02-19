FROM mongo
COPY user.json /user.json
CMD mongoimport --host mongodb --db user --collection users --type json --file /user.json --jsonArray