var mysql = require('mysql');
var fs = require('fs');
var request = require('request');
global.fetch = require('node-fetch');
const cc = require('cryptocompare');
var d3 = require("d3"),
    jsdom = require("jsdom");

var document = jsdom.jsdom(),
    svg = d3.select(document.body).append("svg");

var query;
var con = mysql.createConnection({
  host: "localhost",
  port : 8889,
  user: "root",
  password: "root"
});


var normalize = function(number) {
	if (number < 10)
		return ('0' + number);
	else 
		return number;
}

var scanRate = function(scannedDays,scannedHours,scannedMinutes){
	var rateArray = [];
	var currentDate;
  var query;
	scannedDays.forEach(function(day) {
		year = day.getFullYear();
		month = day.getMonth()+1;
		var dayNum = day.getDate();
		scannedHours.forEach(function(hour) {
			scannedMinutes.forEach(function(min) {
				url = 'https://data.ripple.com/v2/exchange_rates/XRP/USD+rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q?date='+year+'-'+normalize(month)+'-'+normalize(dayNum)+'T'+normalize(hour+1)+':'+normalize(min)+':00Z';
				request(url, function(error, response, html){
					if(!error){
						// console.log(response);
						// console.log(html);
						try {
							if (JSON.parse(html).result != "error")	{
								//console.log(year + '-' + normalize(month) + '-' + normalize(day) + ' ' + normalize(hour) + ':' + normalize(min) + ' rate : ' + JSON.parse(html).rate);
								currentDate = year + '-' + month + '-' + dayNum + ' ' + normalize(hour) + ':' + normalize(min) + ':00';
								rateArray.push([currentDate, JSON.parse(html).rate]);
                query = 'INSERT INTO mydb.CryptoRate VALUES (\'Ripple\', \''+currentDate+'\', '+JSON.parse(html).rate+', 0);';
                 console.log(query);
                con.query(query,function (error, results, fields){
                if (error) throw error;
                  
                });
                // console.log([currentDate, JSON.parse(html).rate]);
							}
						} catch(err) {
							console.log(err);
							console.log(html);
							console.log(response);
						}
				}	
			})

			});

		});
	});

	return (rateArray);
};




con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

});


var scannedHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
var scannedMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

var scannedDays = [];
for (var i = 0; i < 7; i++) {
	scannedDays.push(new Date(Date.now() - i * 86400000));
}


var mainRateArray = [];
//mainRateArray = scanRate(scannedDays,scannedHours,scannedMinutes);

mainRateArray.forEach(function(ligne){
  //con.query('INSERT INTO CryptoRate (CryptoName, Date, Rate, Pic) VALUES (Ripple, '+ligne[0]+', '+ligne[1]+', 0) ON DUPLICATE KEY UPDATE CryptoName = ;',function (error, results, fields){
    // if (error) throw error;

  // });

});

var currentDate = [];


console.log("Date actuelle TS :"+currentDate/1000);// Date présente
// 2000 dernières minutes kusqu'à la date présente

for (var i =0 ; i<7; i++){

  currentDate[i] = new Date();
  currentDate[i].setDate(currentDate[i].getDate()-i);
  //console.log(currentDate[i]);
  var options ={aggregate:1,limit:1440,tryConversion:true,timestamp:currentDate[i]};
  // console.log(options);
////////
var dataChart = [];


    ////

  cc.histoMinute('XRP', 'USD',options).then(data => {
    //console.log(data);

      data.forEach(function(dataVar){

        var dataTransit = new Date(0);// Nouvelle entité date
        var time = dataVar.time; //Je récup le temps en ms de la boucle
        dataTransit.setUTCSeconds(time); // Je l'injecte dans la nouvelle entité
        
        var year = dataTransit.getFullYear();
        var month = dataTransit.getMonth()+1;
        var dayNum = dataTransit.getDate();
        var hour = dataTransit.getHours();
        var min = dataTransit.getMinutes();

        
        var currentDate2 = year + '-' + month + '-' + dayNum + ' ' + normalize(hour) + ':' + normalize(min) + ':00';
        // console.log(currentDate2);
        query = 'INSERT INTO mydb.CryptoRate VALUES (\'Ripple\', \''+currentDate2+'\', '+dataVar.close+', 0);';
             try{
                con.query(query,function (error, results, fields){
                  if(error)
                    console.error;
                });
            } 
             catch(error){
             }
          dataChart.push({
            date: dataTransit,
            value: dataVar.close
          });
        });
console.log(dataChart);

    // console.log(dataVar.)
  })
  .catch(console.error);

}
// console.log(dataChart);
    var line = d3.line()
       .x(function(d) { return x(d.date); })
       .y(function(d) { return y(d.value); });

var div = document.createElement("div");
div.innerHTML = "Hello, world!";
document.body.appendChild(div);

