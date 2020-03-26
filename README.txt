Code om alvast aan de slag te kunnen met een zoekmachine voor Erfgoed
o  ERFGOED.json   - de JSON documenten die de zoekmachine in moeten (te groot voor git)
o  prep.py        - Leest de JSON documenten in en stuurt ze naar Elastic
o  /webserver     - Folder met een tijdelijke webserver/interface

Dependencies
o  pip install django django-cors-headers elasticsearch elasticsearch-dsl
  download elasticsearch van de homepage

Om te runnen
o  Start /elasticDownloadPath/bin/elasticsearch.bat
o  python prep.py
o  python /webserver/webserver/manage.py runserver
o  Open /webserver/interface/google-custom-search.html