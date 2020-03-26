Code om alvast aan de slag te kunnen met een zoekmachine voor Erfgoed
o  example.json   - Een paar voorbeelddocumenten in JSON vorm. Zodra we de text uit de erfgoed pdf's kunnen krijgen vervangen we deze *
o  prep.py        - Leest de JSON documenten in en stuurt ze naar Elastic
o  /webserver     - Folder met een tijdelijke webserver/interface

* Dan zullen ook een paar kleine aanpassingen in de webserver code nodig zijn omdat het data-model iets anders is


Om te runnen
o Start /elasticDownloadPath/bin/elasticsearch.bat
o python prep.py
o python /webserver/webserver/manage.py runserver
o Open /webserver/interface/google-custom-search.html
o De more like this knop in de interface geeft nu 0 resultaten omdat de testset zo klein is