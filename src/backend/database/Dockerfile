FROM postgres:17
WORKDIR .
# COPY createUser.sql /docker-entrypoint-initdb.d/01.sql    # done through the env vars instead
COPY ShareShopDB.sql /docker-entrypoint-initdb.d/02.sql
