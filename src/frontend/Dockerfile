FROM nginx

WORKDIR .
COPY Einkaufsliste/ /usr/share/nginx/html/Einkaufsliste
COPY Login/ /usr/share/nginx/html/Login
COPY Startseitendesign/ /usr/share/nginx/html/Startseitendesign
COPY config-docker.js /usr/share/nginx/html/config.js
COPY index.html /usr/share/nginx/html/index.html
COPY Logout/ /usr/share/nginx/html/Logout
COPY invite/ /usr/share/nginx/html/invite

COPY nginx.conf /etc/nginx/conf.d/default.conf
