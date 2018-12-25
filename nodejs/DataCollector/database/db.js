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

DB.prototype.removeDocuments = function(coll) {
	
	var _this = this;

	return new Promise(function (resolve, reject){

		_this.db.collection(coll, {strict:true}, function(error, collection){
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

DB.prototype.addDocument = function(coll, document) {

	var _this=this;

	return new Promise(function (resolve, reject) {
		_this.db.collection(coll, {strict:false}, function(error, collection){
			if (error) {
				console.log("Could not access collection: " + error.message);
				reject(error.message);
			} else {

				collection.insertOne(document, {w: "majority"})
				.then(
					function(result) {
						resolve(result.message);
					},
					function(err) {
						console.log("Insert failed: " + err.message);
						reject(err.message);
					}
				)
			}
		})
	})
}

module.exports = DB;