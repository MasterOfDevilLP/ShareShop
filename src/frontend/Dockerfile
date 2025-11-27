FROM nginx

WORKDIR .
COPY Einkaufsliste/ /usr/share/nginx/html/Einkaufsliste
COPY Login/ /usr/share/nginx/html/Login
COPY Startseitendesign/ /usr/share/nginx/html/Startseitendesign
COPY config-docker.js /usr/share/nginx/html/config.js

COPY nginx.conf /etc/nginx/conf.d/default.conf
