#!/bin/bash
echo "This script uses sudo to run the psql command as the user postgres (the database superuser)"

echo "creating user \"backendusr\" with password \"passwd\" (probably make this configurable in the future) and database \"ShareShopDB\""
sudo -u postgres psql -f createUser.sql

echo "import database"
sudo -u postgres psql -f ShareShopDB.sql -d shareshopdb -1

echo "cascading"
sudo -u postgres psql -f Cascading.sql -d shareshopdb -1

echo "done"
