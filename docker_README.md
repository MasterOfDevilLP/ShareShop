# Prerequisites
Es werden Docker und docker-compose benötigt, sowie die dafür benötigten Rechte (unter linux sollte der verwendete Nutzer idealerweise in der Gruppe `docker` sein, damit nicht alle Befehle als root ausgeführt werden müssen).

# Usage
Das `docker-compose.yml`-File liegt in `src/`.  
Zum staren der Container: `docker compose up` im Ordner `src` ausführen, beenden mit Strg+C.  
Bei Änderungen am Code müssen die entsprechenden Images neu gebaut werden mit `docker compose build`. Dabei sollten nur die nötigen Schritte ausgeführt werden (maven-dependencies sollten z.B. nur neu heruntergeladen werden, falls sich `pom.xml` verändert hat).

# Development
Bei Änderungen am Java-Code sollte ein einfacher Rebuild mit `docker compose build` reichen.  
Bei Änderungen an der Datenbank kann diese entweder neu aufgesetzt werden, wofür der Ordner `postgres` im cwd gelöscht (dieser enthält die Datenbank) und das `Dockerfile` in `src/backend/database` angepasst werden muss, oder die Datenbank wird migriert.

Zum migrieren kann das SQL-Script auf der Datenbank ausgeführt werden mit `cat <script>.sql | docker compose exec db psql -U backendusr -d shareshopdb` (wenn nichts gepiped wird kann so auch eine SQL-Shell gestartet werden). Dabei muss das cwd auch `src/` sein.