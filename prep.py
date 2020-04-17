# using data.json, we use the python bulk helper to index these files in elastic
# https://elasticsearch-py.readthedocs.io/en/master/helpers.html

# Windows install: first install and start elastic (bin/elastic.bat)
# Also pip install elasticsearch (for the python libraries)

# Prepare data.json using Apache Tika or https://github.com/axa-group/Parsr

import os
import sys
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from pathlib import Path
import json
from time import sleep

#Name of the Elastic index
indexName = '30-3-erfgoed'
indexFile = '30-3-erfgoed.json'

print(Path.cwd())

def gendata():
	with open(str(Path.cwd() / indexFile)) as f:
		#demo example: there is only one line..
		contents = f.read()	
		
		#deal with non UTF-8 chars (not necessary anymore)
			#contents = json.dumps(contents)#unicode(contents, errors='ignore')
		
		jsline = json.loads(contents)
		for doc in jsline:
			fulltext = ""
			for page in jsline[doc]['Teksten per pagina']:
				fulltext += jsline[doc]['Teksten per pagina'][page][0]
			
			print(jsline[doc]['Documentnaam'])
			print(fulltext)			
			yield {
				"_index": indexName,
				"_type":"document",
				"_source": {
					"title":jsline[doc]['Documentnaam'],
					"fulltext":fulltext
				}
			}
		
		
			# Dirty check: does the line have an object? Avoids case of the line having only [ or ] (remnant U-Flix)
			# Assumption: data.json is a json list of objects
#			if(len(line) > 2):
				#In each line, remove trailing white-spaces and comma's (indicating the next object)
				#first everything after the object definition (usually comma's and whitespaces)
#				while(line[-1] != '}'):
#					line = line[0:-1]
				#For the json.loads function to work, it needs to explicitly understand this line is 1 object
#				prepline = '{"doc":' + line + '}'
#				jsline = json.loads(prepline)

				#Parse this line. Here an example for example.json. To start would be fulltext/title
			#	yield {
			#		"_index": indexName,
			#		"_type":"document",
			#		"_source": {
			#			"url":jsline['doc']['url'],
			#			"title":jsline['doc']['title'],
			#			"keywords":jsline['doc']['keywords'],
			#			"markdownbody":jsline['doc']['markdownbody'],
			#			"urls":jsline['doc']['urls']
			#		}
#			}

#connect to ES and index the json objects
es = Elasticsearch(timeout=30, max_retries=10, retry_on_timeout=True)
es.indices.create(index=indexName, ignore=400)
#perform bulk index
bulk(es, gendata())