const Twitter = require('twitter');
const configTwitter = require('./config/configTwitter.js');
const configDB = require('./config/configDB.js');
const T = new Twitter(configTwitter);

//hashtags para pesquisa.
const hashTags = ['#devops',
'#openbanking','#apifirst','#cloudfirst',
'#microservices','#apigateway','#oauth',
'#swagger', '#raml', '#openapis'];

//Limpar dados da última pesquisa
cleanUPDatabase(configDB.client.mongodb.crawlerCollection);
console.log(`Documentos Removidos da coleção: ${configDB.client.mongodb.crawlerCollection}`);
//Pesquisar Tweets
searchTweets();

// Motor de Pesquisa -------------------------------------------------------------------------------------------
function searchTweets() {

	hashTags.map (hashTag => {
			// Setar parametros de pesquisa
			const params = {
				q: hashTag,
				count: 100,
				result_type: 'recent'
			}

			// Pesquisa
			T.get('search/tweets', params, (err, data, response) => {
				
				//Gravar no banco resultado da pesquisa
				addTweets (configDB.client.mongodb.crawlerCollection,data,hashTag);
				//console.log(`Gravado dados dos tweets para a hashtag : ${hashTag}`);

				if(err){
					return console.log(err);
				}

			});
	})
}


// Persistência dos dados  -------------------------------------------------------------------------------------

function cleanUPDatabase (collectionName) {
	
  var DB = require('./database/db');
  var database = new DB;
  
  database.connect(configDB.client.mongodb.crawlerUri)
	.then(
		function() {
        return database.removeDocuments(collectionName);
		})
	.then(
		function(remove) {
			return {
					"success": true,
					"error": ""
				};
		},
		function(error) {
			console.log('Failed to remove documents: ' + error);
			return {
					"success": false,
					"error": "Failed to remove documents: " + error
				};
		})
	.then(
		function(resultObject) {
      		database.close();
		}
	)
}

function addTweets (collectionName,data,hashTag) {
  
  var DB = require('./database/db');
	var database = new DB;
	
	 return database.connect(configDB.client.mongodb.crawlerUri)
	.then(
		function() {
      	data.statuses.map(tweet => { 
			database.addDocument(collectionName, tweet)
      		});
		})
	.then(
		function(docs) {
		},
		function(error) {
			console.log('Failed to add tweet: ' + error);
		})
	.then(
		function(resultObject) {
			console.log (`Tweets added for hashtag ${hashTag}`);
			database.close();
		}
	)
}
//--------------------------------------------------------------------------------------------------------------