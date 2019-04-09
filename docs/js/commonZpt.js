/* Common code
   Vars needed:
   - options
   - callback
*/

// This is needed to make the git pages work
options.filesPathPrefix = location.pathname.startsWith( '/Zcrud' )? '/Zcrud': '';

var zptParser = zpt.buildParser({
    root: [ 
        document.getElementById( 'commonHeader' ), 
        document.getElementById( 'commonFooter' )
    ],
    dictionary: {},
    declaredRemotePageUrls: [ 'templates.html' ]
});

zpt.context.getConf().externalMacroPrefixURL = options.filesPathPrefix + '/';

zptParser.init(
    function(){
        zptParser.run();
        $( '#container' ).zcrud( 'init', options, callback );
    }
);
