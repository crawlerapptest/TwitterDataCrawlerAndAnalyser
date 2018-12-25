var MongoClient = require('mongodb').MongoClient;

function DB() {
	this.db = null;
}

DB.prototype.connect = function(uri) {

	var _this = this;

	return new Promise(function(resolve, reject) {
		if (_this.db) {
			resolve();
		} else {
			var __this = _this;
			
			MongoClient.connect(uri)
			.then(
				function(database) {
					__this.db = database;
					resolve();
				},
				function(err) {
					console.log("Error connecting: " + err.message);
					reject(err.message);
				}
			)
		}
	})
}

DB.prototype.close = function() {
	if (this.db) {
		this.db.close()
		.then(
			function() {},
			function(error) {
				console.log("Failed to close the database: " + error.message)
			}
		)	
	}
}

//Pesquisar os usuários e gravar os 5 primeiros usários com maior número de seguidores
DB.prototype.addUsersOrderByTopFollowers = function(colltweets,coll, limit) {

	var _this=this;

	//limpar coleção antes de inserir os dados.
	removeDocuments(_this.db, coll)

	return new Promise(function (resolve, reject) {
		_this.db.collection(colltweets, {strict:false}, function(error, collection){
			if (error) {
				console.log("Could not access collection: " + error.message);
				reject(error.message);
			} else {
				//var cursor = collection.find({}).sort({"user.followers_count": -1}).project({"user.name": 1, "user.followers_count": 1}).limit(limit);
				
				var cursor = collection.aggregate (
					[
						{ "$group": {
							_id : {
								user: "$user.name",
								followers_count: "$user.followers_count"
								}
							}},
						{"$project": {
							_id : 0,
							"user" : '$_id.user',
							"followers_count": '$_id.followers_count'
						}},
						{"$sort": {
							followers_count: -1	
						}},
						{"$limit": 5}
					]
				)
				
				cursor.toArray(function(error, docArray) {
			    	if (error) {
						console.log (docArray);
						console.log("Error reading fron cursor: " + error.message);
						reject(error.message);
					} else {
						console.log (docArray);
						insertDocs(_this.db, coll, docArray)
						.then(
							function(results) {
								console.log("Quantidade de registros inseridos: " + results);
								resolve(results);
							},
							function(err) {
								console.log("Failed to insert Docs: " + err);
								reject(err);
							}
						)
						resolve();
					}
		    	})
			}
		})
	})
}

//Gravar o total de posts ordenados pela hora do dia
DB.prototype.addTotalPostsOrderByHour = function(colltweets,coll) {

	var _this=this;

	//limpar coleção antes de inserir os dados.
	removeDocuments(_this.db, coll)

	return new Promise(function (resolve, reject) {
		_this.db.collection(colltweets, {strict:false}, function(error, collection){
			if (error) {
				console.log("Could not access collection: " + error.message);
				reject(error.message);
			} else {
				var cursor = collection.aggregate (
					[
						{ "$group": {
							_id : {$hour:{$dateFromString:{dateString:'$created_at'}}},
							 count : { $sum : 1 }
						  } 
						},
						{"$sort": {
							_id: 1	
						  }
						},
						{"$project": {
							_id : 0,
							hour : '$_id',
							totalposts: '$count'
						  }
					   }
					]
				)
				cursor.toArray(function(error, docArray) {
			    	if (error) {
						console.log("Error reading fron cursor: " + error.message);
						reject(error.message);
					} else {
						console.log (docArray);
						insertDocs(_this.db, coll, docArray)
						.then(
							function(results) {
								resolve(results);
							},
							function(err) {
								console.log("Failed to insert Docs: " + err);
								reject(err);
							}
						)
						resolve();
					}
		    	})
			}
		})
	})
}

//Gravar o total de posts ordenados pela hashtag por país e lingua
DB.prototype.addTotalPostsOrderByTagAndCountry = function(colltweets, coll,hashTags) {

	var _this=this;

	//limpar coleção antes de inserir os dados.
	removeDocuments(_this.db, coll)

	return new Promise(function (resolve, reject) {
		_this.db.collection(colltweets, {strict:false}, function(error, collection){
			if (error) {
				console.log("Could not access collection: " + error.message);
				reject(error.message);
			} else {
				var cursor = collection.aggregate (
					[
						{$unwind: "$entities.hashtags"},
						{$project: {"entities.hashtags": 1,
									"lang": 1,
									"user.location": 1,
									_id: 0
								}},
						{$group: {_id: {
							hashtag: {$toLower: "$entities.hashtags.text"},
							language: "$lang",
							location: "$user.location"
						}, count: {$sum: 1}}},
						{$match: {"_id.hashtag": {"$in": hashTags}}},
						{$project: {
									"count": 1,
									"hashtag": "$_id.hashtag", 
									"language": "$_id.language",
									"location": "$_id.location",
									"_id": 0,
								}},
						{$sort: {
								count: -1,
								"entities.hashtags": 1,
								"user.location" : 1
								}}
					]
				)
				cursor.toArray(function(error, docArray) {
			    	if (error) {
						console.log("Error reading fron cursor: " + error.message);
						reject(error.message);
					} else {
						console.log (docArray);
						insertDocs(_this.db, coll, docArray)
						.then(
							function(results) {
								resolve(results);
							},
							function(err) {
								console.log("Failed to insert Docs: " + err);
								reject(err);
							}
						)
						resolve();
					}
		    	})
			}
		})
	})
}


//Gravar os Resultados
function insertDocs (DBconn, coll, docs) {

	return new Promise(function (resolve, reject){
		DBconn.collection(coll, {strict:false}, function(error, collection){
			if (error) {
				console.log("Could not access collection: " + error.message);
				reject(error.message);
			} else {

				if (!Array.isArray(docs)) {
					console.log("Data is not an array");

					reject({"message": "Data is not an array"});
				} else {

					try {
						var _docs = JSON.parse(JSON.stringify(docs));
					} catch(trap) {
						reject("Array elements are not valid JSON");
					}

					collection.insertMany(_docs)
					.then(
						function(results) {
							resolve(results.insertedCount);
						},
						function(err) {
							console.log("Failed to insert Docs: " + err.message);
							reject(err.message);
						}
					)
				}
			}
		})
	})
}

//Limpar base de dados da coleção
function removeDocuments (DBConn, coll) {

	return new Promise(function (resolve, reject){

		DBConn.collection(coll, {strict:true}, function(error, collection){
			if (error) {
				console.log("Could not access collection: " + error.message);
				reject(error.message);
			} else {
				collection.remove({})
				.then(
					function(remove) {
						resolve(remove);
					},
					function(err) {
						console.log("countDocuments failed: " + err.message);
						reject(err.message);
					}
				)
			}
		});
	})
}

module.exports = DB;