var configDB = {
	client: {
		mongodb: {
			usersOrderByTopFollowersColl: "usersOrderByTopFollowers",
			totalPostsOrderByHourColl: "totalPostsOrderByHour",
			totalPostsOrderByTagAndCountryColl: "totalPostsOrderByTagAndCountry",
			crawlerCollection: "tweets",
			crawlerDatabase: "twitter_crawlerDB",
			crawlerUri: "mongodb://twittercrawler:CrawlerTweet54321@cluster0-shard-00-00-rktpd.mongodb.net:27017,cluster0-shard-00-01-rktpd.mongodb.net:27017,cluster0-shard-00-02-rktpd.mongodb.net:27017/twitter_crawlerDB?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
		},
	},
};

module.exports = configDB;