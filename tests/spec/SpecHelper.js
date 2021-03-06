
var iframes = [];
function makeRSDoc (opts, cb) {
    var $ifr = $("<iframe width='800' height='200' style='position: relative; margin-left: -10000px'></iframe>")
    ,   doc = document.implementation.createHTMLDocument("")
    ,   $body = $("body", doc)
    ,   opts = opts || {}
    ;
    $ifr.load(function () {
        var destDoc = $ifr[0].contentDocument;
        // make it a real document here
        $("<meta charset='utf-8'/>", doc).prependTo($("head", doc));
        if (opts.htmlAttrs) $(doc.documentElement).attr(opts.htmlAttrs);
        if (opts.title) $("title", doc).text(opts.title);
        $body.append(opts.abstract || $("<section id='abstract'><p>test abstract</p></section>"));
        if (opts.body) $body.append(opts.body);
        // import into iframe
        var newNode = destDoc.importNode(doc.documentElement, true);
        destDoc.replaceChild(newNode, destDoc.documentElement);
        // inject scripts (it doesn't work through cloning)
        var path = opts.jsPath || "../js/"
        ,   $head = $("head", destDoc)
        ;
        var config = destDoc.createElement("script");
        $(config)
            .text("var respecConfig = " + JSON.stringify(opts.config || {}) + ";")
            .addClass("remove")
            .appendTo($head);
        $head[0].appendChild(config);
        var loader = destDoc.createElement("script");
        $(loader)
            .attr({ src: path + "require.js", "data-main": path + (opts.profile || "profile-w3c-common" )})
            .addClass("remove")
            .appendTo($head);
        $head[0].appendChild(loader);
    });
    // trigger load
    $ifr.appendTo($("body"));
    iframes.push($ifr);

    // intercept that in the iframe we have finished processing
    window.addEventListener("message", function (ev) {
        if (ev.data && ev.data.topic == "end-all") cb($ifr[0].contentDocument);
    }, false);
}

function flushIframes () {
    for (var i = 0, n = iframes.length; i < n; i++) iframes[i].remove();
}
