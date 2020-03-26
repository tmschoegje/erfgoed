pip install django django-cors-headers elasticsearch_dsl

To run, go to /webserver and run 
	python manage.py runserver
	
To visit site, then open /interface/google-search.html

Most logic of the webserver (e.g. talking with the Elastic instance) is in /webserver/queryme/query.py