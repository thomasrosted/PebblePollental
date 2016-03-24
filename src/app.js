var UI = require('ui');
var ajax = require('ajax');

var splashCard = new UI.Card({
  title: "Henter pollental",
  body: "Vent venligst..."
});

splashCard.show();

var URL = 'http://www.dmi.dk/vejr/services/pollen-rss/';

ajax({url: URL, type: 'xml'},
  function(xml) {
    var myRegexp = /<item>[\s]*<title>(.*)<\/title>[\s]*<description>([^<>]*)<\/description>[\s]*<pubDate>(.*)<\/pubDate>[\s]*<link>(.*)<\/link>[\s]*<\/item>/g;
    var textRegexp = /([\S]*: [0-9]+)/g;
    var titles = [];
    var currentTitleIndex = -1;
    
    var match = myRegexp.exec(xml);

    while (match !== null) {
      var pollenMatch = match[2].match(textRegexp);
      var text = "Ingen pollen";
      var subtitle = text;
      if (pollenMatch) {
        text = pollenMatch.join('\n');
        subtitle = pollenMatch.join(', ');
      }
      
      text += '\n\n' + match[3];
      
      titles.push({ title: match[1], subtitle: subtitle, text: text });
     
      match = myRegexp.exec(xml);
    }
    
    var makeDetailCard = function() {
      var detailCard = new UI.Card({
        title: titles[currentTitleIndex].title,
        body: titles[currentTitleIndex].text,
        scrollable: true
      });          
    
      detailCard.on('click', function(event) {
        if (currentTitleIndex < titles.length - 1) {
          currentTitleIndex++;

          detailCard.hide();
          
          makeDetailCard(currentTitleIndex);
        }
      });
      
      detailCard.show();    
    };
    
    var listCard = new UI.Menu({
      sections: [{
        title: 'Pollental',
        items: titles
      }]
    });
    
    listCard.on('select', function(event) {
      currentTitleIndex = event.itemIndex;
      makeDetailCard();      
    });
    
    listCard.show();
    splashCard.hide();
  },
  function(error) {
    console.log('Ajax failed: ' + error);
    
    var failedCard = new UI.Card({
      title: "Fejl",
      body: "Det var ikke muligt at hente pollental."
    });
    
    failedCard.show();
    splashCard.hide();    
  }
);