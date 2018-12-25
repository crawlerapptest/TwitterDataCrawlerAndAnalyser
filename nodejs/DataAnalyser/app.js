const hashTags = ['devops','openbanking',
				  'apifirst','cloudfirst',
				  'microservices','apigateway',
				  'oauth','swagger', 
				  'raml', 'openapis'];
const Twitter = require('twitter');
const configTwitter = require('./config/configTwitter.js');
const configDB = require('./config/configDB.js');
const T = new Twitter(configTwitter);

//Gravar os 5 primeiros usários com maior número de seguidores
addUsersOrderByTopFollowers (configDB.client.mongodb.crawlerCollection, configDB.client.mongodb.usersOrderByTopFollowersColl,5);

//Gravar o total de posts ordenados pela hora do dia
addTotalPostsOrderByHour (configDB.client.mongodb.crawlerCollection, configDB.client.mongodb.totalPostsOrderByHourColl);

//Gravar o total de posts ordenados pela hashtag por país e lingua
addTotalPostsOrderByTagAndCountry (configDB.client.mongodb.crawlerCollection,configDB.client.mongodb.totalPostsOrderByTagAndCountryColl);


//Persistência dos dados  --------------------------------------------------------------------------------------

function addUsersOrderByTopFollowers (colltweets, collectionName, limit) {
  
  var DB = require('./database/db');
	var database = new DB;
	
	database.connect(configDB.client.mongodb.crawlerUri)
	.then(
		function() {
        return database.addUsersOrderByTopFollowers(colltweets, collectionName, limit);
		})
	.then(
		function(docs) {
		},
		function(error) {
			console.log('Failed to add document: ' + error);
		})
	.then(
		function(resultObject) {
      database.close();
		}
	)
}

function addTotalPostsOrderByHour (colltweets, collectionName) {
  
	var DB = require('./database/db');
	  var database = new DB;
	  
	  database.connect(configDB.client.mongodb.crawlerUri)
	  .then(
		  function() {
		  return database.addTotalPostsOrderByHour(colltweets, collectionName);
		  })
	  .then(
		  function(docs) {
		  },
		  function(error) {
			  console.log('Failed to add document: ' + error);
		  })
	  .then(
		  function(resultObject) {
		database.close();
		  }
	  )
  }

  function addTotalPostsOrderByTagAndCountry (colltweets, collectionName) {
  
	var DB = require('./database/db');
	  var database = new DB;
	  
	  database.connect(configDB.client.mongodb.crawlerUri)
	  .then(
		  function() {
		  return database.addTotalPostsOrderByTagAndCountry(colltweets, collectionName, hashTags);
		  })
	  .then(
		  function(docs) {
		  },
		  function(error) {
			  console.log('Failed to add document: ' + error);
		  })
	  .then(
		  function(resultObject) {
		database.close();
		  }
	  )
  }
//--------------------------------------------------------------------------------------------------------------