module.exports = new mdwiki();

var jssp = require('jssp');

function mdwiki()
{
	this.CreateWiki = function(port,host,wikipath)
	{
		if(!wikipath) wikipath = __dirname;
		if(!port) port = '8080';
		if(!host) host = '0.0.0.0';
		var base = __dirname;
		var server = jssp.CreateServer();
		server.listen(port,host);
		server.setopt({"BASE":base});
		server.setext('wikiroot',wikipath);
	}
}

if(require.main === module)
{
	//run without be required
	var argv     = process.argv;
	var port     = '8080';
	var host     = '0.0.0.0';
	var wikipath = 'www';

	if(argv[2]) port     = argv[2];
	if(argv[3]) ip       = argv[3];
	if(argv[4]) wikipath = argv[4];

	var mod = module.exports;
	var wiki = mod.CreateWiki(port,host,wikipath);
}