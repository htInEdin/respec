/*jshint
    expr: true
*/

// Module w3c/data-include
// Support for the data-include attribute. Causes external content to be included inside an
// element that has data-include='some URI'. There is also a data-oninclude attribute that
// features a white space separated list of global methods that will be called with the
// module object, the content, and the included URI.
//
// IMPORTANT:
//  This module only really works when you are in an HTTP context, and will most likely
//  fail if you are editing your documents on your local drive. That is due to security
//  restrictions in the browser.
//  It is also important to note that this module performs synchronous requests (which is
//  required since subsequent modules need to apply to the included content) and can therefore
//  entail performance issues.

define(
    ["core/utils"],
    function (utils) {
        return {
            run:    function (conf, doc, cb, msg) {
                msg.pub("start", "w3c/data-include");
                var $incs = $("[data-include]")
                ,   len = $incs.length
                ,   finish = function ($el) {
                        $el.removeAttr("data-include");
                        $el.removeAttr("data-oninclude");
                        $el.removeAttr("data-include-format");
                        len--;
                        if (len <= 0) {
                            msg.pub("end", "w3c/data-include");
                            cb();
                        }
                    }
                ;
                if (!len) {
                    msg.pub("end", "w3c/data-include");
                    cb();
                }
                $incs.each(function () {
                    var $el = $(this)
                    ,   uri = $el.attr("data-include")
                    ,   format = $el.attr("data-include-format") || "html";
                    $.ajax({
                        dataType:   format
                    ,   url:        uri
                    ,   success:    function (data, status, xhr) {
                            if (data) {
                                var flist = $el.attr("data-oninclude");
                                if (flist) data = utils.runTransforms(data, flist, uri);
                                format === "text" ? $el.text(data) : $el.html(data);
                            }
                            finish($el);
                        }
                    ,   error:      function (xhr, status, error) {
                            msg.pub("error", "Error including URI=" + uri + ": " + status + " (" + error + ")");
                            finish($el);
                        }
                    });
                });
            }
        };
    }
);
