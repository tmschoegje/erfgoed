var _prevIndex = 0;
var _nextIndex = 0;
var _resultsPerPage = 10;
var _pageNumber = 1;
var _keywords = ""
//this one's a hacky solution for the elastic one only atm. easier than figuring otu dsl syntax for from in elastic
var _curIndex = 0;

$(function ()
{
    $('#btnSearch').show().click(function () { console.log('btnsearch'); Search($("#txtSearchTerm").val(), $("#engine").val(), 0);});
    $('#lnkPrev').click(function () { Search($("#txtSearchTerm").val(), $("#engine").val(), -1); });
    $('#lnkNext').click(function () { Search($("#txtSearchTerm").val(), $("#engine").val(), 1);  });
});


var _engine = "se"
function Search(term, engine, direction)
{
	var startIndex = 1; //might have to be 1 for google, 0 for elastic?

	if (direction === -1)
	{
		startIndex = _prevIndex; 
		_pageNumber--;
	}
	if (direction === 1)
	{
		startIndex = _nextIndex; 
		_pageNumber++;
	}
	if (direction === 0)
	{
		startIndex = 1; 
		_pageNumber = 1;
	}	
	
	_curIndex = startIndex

	//if google.. 
	if(engine == "g" || engine == "g2"){
		//THIS WAS FOR ORIS VERSION we want to query using google, but for fair comparison we first call ORIS: both for similar time delay, and to compare an even number of results
		//url = "http://api.openraadsinformatie.nl/v0/utrecht/search?query=" + "?query=" + escape(term)
		//numORIS = $.getJSON(url, '', getNumORIS);

		searchKey = mGoogleCustomSearchKeyAll
		if(engine == "g2")
			searchKey = mGoogleCustomSearchKeyiBabs
		var url = "https://www.googleapis.com/customsearch/v1?key="
		+ mGoogleApiKey + "&num=" + _resultsPerPage + "&cx=" + searchKey + "&start=" + startIndex + "&q=" + escape(term) + "&gl=NL&callback=?"; //TODO: test if it should be startind-1
		
			

 //   url = "http://hahndorf/ws/dummy.aspx?q=" + escape(term) + "&start=" + startIndex + "&callback=?";
		_engine = "g"
	}
	else if(engine == "poc"){
		console.log("Before the PoC call")
		_engine = "poc"
		var url = "http://localhost:8000/queryme/search/" + "?query=" + escape(term) + "&start=" + (startIndex - 1)
	}
	//deprecated: sort by relevancy using oris
	else{
		console.log('Before ORIS call')
		var url = "https://api.openraadsinformatie.nl/v0/utrecht/search" + "?query=" + escape(term) //+ "?size=" + _resultsPerPage + "?from=" + startIndex
		_engine = "o"
//		url = "http://api.openraadsinformatie.nl/v0/utrecht/search?query=de"
	}
	console.log('test2')
	_keywords = term.split(" ")
	$.getJSON(url, '', SearchCompleted);
}

function getPreview(str, keywords){
	str = str.substring(0,500)
	var regKey = keywords[0]
	for(i = 1; i < keywords.length; i++)
		regKey += "|" + keywords[i]
//	var regKey = "hello"
//	var str = "Hello, how is it going. This is the bus we have to take!";
	
	var chunks = str.split(/[.?!]/).filter(function(n) {
		var re = new RegExp(regKey,"i");
		return re.test(n);// /hello/i.test(n);
	});
	console.log(regKey)
	console.log('preview');
	console.log(chunks);
}

function simplePreview(str, keywords){
	console.log('one')
	//only consider the words in the fisrt 500 letters
	fulltext = str.replace('\n'," ").split(" ")
//	console.log(fulltext)
	//find the first occurrence of a keyword, and show 10 words before and 10 words after
	for(ii=0;ii < fulltext.length; ii++){
		for(z = 0; z < keywords.length; z++){
			if(fulltext[ii] === keywords[z]){
				sentence = ""
				//go 10 words before and after the keyword
				for(jj=ii-10; jj < ii+10; jj++){
					if(jj < 0)
						jj = 0
					if(jj == ii)
						sentence += "<b>"
					sentence += fulltext[jj] + " "
					if(jj == ii)
						sentence += "</b>"
				}
				return '.. ' + sentence + ' ..'
			}
		}
	}
	//none found, return first sentence
	return fulltext.slice(0,20).join(" ") + ' ..'
}

function parseiBabs(events, keywords){
	console.log('iBABS')
	results = []
	for(i = 0; i < events.length; i++){
		newresult = {
			"title": events[i].classification + " " + events[i].name,
			"documents": [{}]
		}
		for(j = 0; j < events[i].sources.length; j++){
			newresult.documents.push({
				"title": events[i].sources[j].note,
				"url": events[i].sources[j].url,
				"preview": simplePreview(events[i].sources[j].description, keywords)
				//"preview": "unavailable"//getPreview(events[i].sources[j].description, keywords),
			})
		}
		results.push(newresult)
//		console.log(newresult)
	}
	return results
}

function SearchCompleted(response)
{
	//console.log('hi')
	//getPreview("Hello, how is it going. This is the bus we have to take!", _keywords);
	console.log('search completed')
	console.log(_engine)
	console.log(response)
	
		
	if(_engine == "g" || _engine == "g2"){
		var html = "";
		$("#searchResult").html("");

		if (response.items == null)
		{
			$("#searchResult").html("No matching pages found");
			return;
		}

		if (response.items.length === 0)
		{
			$("#searchResult").html("No matching pages found");
			return;
		}

		
		$("#searchResult").html("Around " + response.queries.request[0].totalResults + " pages found for <b>" +response.queries.request[0].searchTerms+ "</b><br><br>");
		
		//store the number of results 
		logNumResults(response.queries.request[0].totalResults, 0)


		if (response.queries.nextPage != null)
		{
			_nextIndex = response.queries.nextPage[0].startIndex;
			$("#lnkNext").show();
		}
		else
		{
			$("#lnkNext").hide();
		}

		if (response.queries.previousPage != null)
		{
			_prevIndex = response.queries.previousPage[0].startIndex;
			$("#lnkPrev").show();
		}
		else
		{
			$("#lnkPrev").hide();
		}

		if (response.queries.request[0].totalResults > _resultsPerPage){
			$("#lblPageNumber").show().html(_pageNumber);
		}
		else{
			$("#lblPageNumber").hide();
		}

		console.log('check me')
		console.log(response)
		for (var i = 0; i < response.items.length; i++){
			var item = response.items[i];
			var title = item.htmlTitle;
        
			html += "<p><a class='searchLink' href='" + item.link + "'> " + title + "</a><br>";
			//if we recognise pdf/word, add a date
	//		snippetdate = item.pagemap.metatags[0].creationdate
//			console.log(snippetdate)
		//	console.log('snip')
		//	if(typeof(snippetdate) != 'undefined')
		//		html += snippetdate.substring(8, 10) + " " + snippetdate.substring(6,8) + " " + snippetdate.substring(2,6) + ' .. '
			
			html += item.htmlSnippet + "<p>";
			//html += item.link + "<br>"// + " - <a href='http://www.google.com/search?q=cache:"+	item.cacheId+":"+item.displayLink+"'>Cached</a>";
			html += "</p><p>";
		}
	}
	else if (_engine=="poc"){
//		results = parsePoC(response.events, _keywords)
		console.log('interpreting poc')
		html = ""
		results = response.results
		
		if (results.numresults === 0)
		{
			$("#searchResult").html("No matching pages found");
			return;
		}
		
		$("#searchResult").html(results.numresults + " results found for <b>" + _keywords.join(" ") + "</b><br><br>");
		
		//$("#output").html(html)
		
		//store the number of results 
		logNumResults(results.numresults, results.numresults)

		//TODO not working, because &from is not parsed as a thing different from a query
		//-> do we ever need it for our usecase?
		//	 supposed to skip ahead if we do indeed skip the first x if we do ?from=x
		//console.log(from)
		console.log('milestone')
		if (results.numresults > _resultsPerPage)
		{
			_nextIndex = _curIndex + _resultsPerPage;
			$("#lnkNext").show();
		}
		else
		{
			$("#lnkNext").hide();
		}
		
		if (_pageNumber > 1)
		{


	//		TODO
			_prevIndex = _curIndex - _resultsPerPage;//response.queries.previousPage[0].startIndex;
			$("#lnkPrev").show();
		}
		else
		{
			$("#lnkPrev").hide();
		}
		
		if (_pageNumber > 1){
			$("#lblPageNumber").show().html(_pageNumber);
		}
		else{
			$("#lblPageNumber").hide();
		}
		
		//console.log(results.hits)
		//console.log(results.numresults)
		for (var i = 0; i < results.numresults && i < _resultsPerPage; i++){
			var item = results.hits[i];
			console.log(item)
			//if(item == undefined)
			//	alert(i)
			
			// HACKY: sometimes there's an 'undefined' result (e.g. for 'wistudata.nl') - what causes this? for now we skip
			if(item !== undefined){
				
				var title = item.title;
        
				//temp fix
				itemloc = 'C:/Users/tmsch/Desktop/werk/erfgoed/erfgoed docs/' + title
				html += "<p><a class='searchLink' href='" + itemloc + "' id='" + item.docid + "'> " + title + "</a>&nbsp;&nbsp;&nbsp;<a class='mlt'></a><br>";
//			html += "<p><a class='searchLink' href='" + item.url + "' id='" + item.docid + "'> " + title + "</a>&nbsp;&nbsp;&nbsp;<a class='mlt'>More like this!</a><br>";
			//<i>" + item.url + "</i><br>
			//if we recognise pdf/word, add a date
	//		snippetdate = item.pagemap.metatags[0].creationdate
//			console.log(snippetdate)
		//	console.log('snip')
		//	if(typeof(snippetdate) != 'undefined')
		//		html += snippetdate.substring(8, 10) + " " + snippetdate.substring(6,8) + " " + snippetdate.substring(2,6) + ' .. '
			
				html += item.preview;
			//html += item.link + "<br>"// + " - <a href='http://www.google.com/search?q=cache:"+	item.cacheId+":"+item.displayLink+"'>Cached</a>";
			
			//mfd more from domain code - disabled for erfgoed
			//html += "<br><a class='mfd' domain='" + item.domain + "'>More from " + item.domain.replace('www.','') + "</a><hr>";
				html += "<hr>";
			}
		}
		
		
	}
	else{
		console.log('te')
		results = parseiBabs(response.events, _keywords)
		console.log('te')
		//clear previous resulst
		html = ""
		
		if (response.events == null || response.events.length === 0)
		{
			$("#searchResult").html("No matching pages found");
			return;
		}
		
		//find number of documents
		numdocs = 0
		for(i = 0; i < response.events.length; i++){
			numdocs += response.events[i].sources.length;
		}
		$("#searchResult").html("Around " + response.meta.total + " results found containing " + numdocs + " documents for <b>" + _keywords + "</b><br><br>");
		
		//store the number of results 
		logNumResults(response.meta.total, numdocs)

		//TODO test if we do indeed skip the first x if we do ?from=x
		if (response.events.length > _resultsPerPage)
		{
			_nextIndex = startIndex + _resultsPerPage;
			$("#lnkNext").show();
		}
		else
		{
			$("#lnkNext").hide();
		}
		
		if (_pageNumber > 1)
		{
			_prevIndex = response.queries.previousPage[0].startIndex;
			$("#lnkPrev").show();
		}
		else
		{
			$("#lnkPrev").hide();
		}
		
		if (_pageNumber > 1){
			$("#lblPageNumber").show().html(_pageNumber);
		}
		else{
			$("#lblPageNumber").hide();
		}
		
		for (var i = 0; i < results.length; i++){
			html += "<p><p><p><h4><b>" + results[i].title + "</h4></b>"
			for (var j = 1; j < results[i].documents.length; j++){
				html += "<a class='searchLink' " + results[i].documents[j].url + ">" + results[i].documents[j].title + "</a><br>" + results[i].documents[j].preview + "<p><p>"// + results[i].documents[j].preview + "<br><br>"
			
//			<a class='searchLink' href='" + item.link + "'> " + title + "</a><br>"
			
	//		var item = results[i];
		//	var title = item.htmlTitle;
        
//			html += "<p><a class='searchLink' href='" + item.link + "'> " + title + "</a><br>";
	//		html += item.snippet + "<br>";
		//	html += item.link + " - <a href='http://www.google.com/search?q=cache:"+	item.cacheId+":"+item.displayLink+"'>Cached</a></p><p>";
			}
			html += "</p><p>"
		}
		
	}
	$("#output").html(html)
	
	bindClicks();
}

function logNumResults(nr,nd){
	console.log('updating numresults')
	//TODO get it 
//	let gett = 
	
	numresults = localStorage.getItem('numresults');
	numresults += Date.now() + " Query " + _keywords.join("-") + " Numresults " + nr + '\n'
	console.log(numresults)
	localStorage.setItem('numresults', numresults)
//	gett.then((results) => {
//		numresults = results.numresults
//		numresults.loglines.push(Date.now() + " Query " + _keywords.join("-") + " Numresults " + nr + " Numdocs " + nd)
//		storeLogs();
	//})
}

/*function storeLogs(){
	let contentToStore = {};
	contentToStore['numresults'] = numresults;
	localStorage.set(contentToStore);
}*/

// Called when html objects for the results are created using the elastic search (other searches dont create the objects)
// call morelikethis function, append top 3 to this result
function bindClicks(){
	console.log('check')
	//more like this button
	$(".mlt" ).click(function() {
		//alert($(this).parent() + " clicked");
		console.log($(this).parent() + " clicked");
		html = "<br><br>"
		htmlreference = $(this)
		
		//Do Elastic mlt query with size 3 for more documents like this
		$.ajax({url: "http://localhost:8000/queryme/recommend" + "?query=" + escape($(this).parent().children("a.searchLink").attr("id")) + "&size=3", success: function(results){
			results = results.results
			console.log(results.numresults)
			console.log(results.hits)
			for (var i = 0; results.numresults > 0 && i < results.hits.length; i++){
				var item = results.hits[i];
				var title = item.title;
        
				html += "<p>&nbsp;* <a class='searchLink3' href='" + item.url + "'>" + title + "</a><br>";
				html += item.preview + "<p><p>";
			}
			//html+= "<hr>";
//			$("#div1").html(result);
			console.log(html)
			console.log($(this).parent())
			htmlreference.parent().append(html)

		}});
		
	});
	
	//more from domain button
	$(".mfd" ).click(function() {
		console.log($(this).parent() + " clicked");
		html = "<br><br>"
		htmlreference = $(this)
		
		//Do Elastic query within domain with size 4 (= skip first result, which we already see)
		$.ajax({url: "http://localhost:8000/queryme/domainsearch" + "?query=" + escape(_keywords) + "&size=4&domain=" + htmlreference.attr('domain'), success: function(results){
			results = results.results
			console.log(results.numresults)
			console.log(results.hits)
			for (var i = 0; results.numresults > 0 && i < results.hits.length; i++){
				var item = results.hits[i];
				var title = item.title;
        
				html += "<p>&nbsp;* <a class='searchLink2' href='" + item.url + "'>" + title + "</a><br>";
				html += item.preview + "<p><p>";
			}
			//html+= "<hr>";
//			$("#div1").html(result);
			console.log(html)
			console.log($(this).parent())
			htmlreference.parent().append(html)

		}});
		
	});
	
	
}

function onInstalledNotification(details) {
	//We should store the # results in localstorage.
		//On page start: check if logs already exist
		//On Query(): log new query w results and date.now()
	numresultsQ = localStorage.getItem('numresults');
	var numresults = ""
//	gett.then((results) => {
	if(typeof numresultsQ === "undefined"){
		console.log('initialising numresults')
		numresults = Date.now() + " Storing the number of results per query\n"
		localStorage.setItem('numresults', numresults)
	}
	else{
		console.log('loading numresults')
		numresults = numresultsQ;
	}
	
	//Selects all (i.e. the only) values selected
	$( "#theme" ).change(function() {
		var themec = "";
		$( "select option:selected" ).each(function() {
			themec += $( this ).val() + " ";
		});
		console.log(themec);
		//Tell server to filter on theme, then call search
		$.ajax({url: "http://localhost:8000/queryme/theme" + "?theme=" + themec, success: function(results){
			Search($("#txtSearchTerm").val(), $("#engine").val(), 0)
		}});
	}).trigger( "change" );
	//})
}
onInstalledNotification();