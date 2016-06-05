/*
 * tabel of contents from headings on page
 * by Bernhard Riegler
 */
(function () {
    var getTocMarkup = function() {
        // get all heading elements in order of occurance in dom
        // except for toc heading
        var headings = $('#content').find('h2,h3,h4,h5,h6').not('#toc li h3');
        var tocMarkup = "";
        var level = 0;

        // loop over all headings found
        for (var i = 0; i < headings.length; i++) {
            var current = $(headings[i]);
            // if start
            if (i === 0) {
                tocMarkup += "<ul id='productindex'><li>";
            } else if (current.prop('tagName') === "H2") {
                // reached next page heading
                // close up
                tocMarkup += closeTocUpByLevel(level, false);
                // reset level
                level = 1;
                // restart a list
                tocMarkup += "<ul class='pageheading'><li>";
            } else {
                var prev = $(headings[i - 1]);
                // if current element === prev element
                if (current.prop('tagName') === prev.prop('tagName')) {
                    // stay on level
                    tocMarkup += "</li><li>";
                    // if current elemet > prev element
                } else if (current.prop('tagName') > prev.prop('tagName')) {
                    // go down a level
                    level++;
                    tocMarkup += "<ul><li>";
                    // if current element < prev element
                } else if (current.prop('tagName') < prev.prop('tagName')) {
                    // go up a level
                    level--;
                    tocMarkup += "</li></ul></li><li>";
                }
            }
            // insert link in wrapping
            tocMarkup += "<a class='page-link' href='#" + current.attr('id') + "'>" + current.text() + "</a>";
        }
        // close up
        tocMarkup += closeTocUpByLevel(level, true);
        return tocMarkup;
    };
    var closeTocUpByLevel = function(level, closeUpCompletly) {
        var closingWrapper = "";
        // close up by level
        // plus one level for start
        for (; 0 < level + 1; level--) {
            if (closeUpCompletly || level > 0) {
                closingWrapper += "</li></ul>";
            } else {
                closingWrapper += "</li></ul></li>";
            }
        }
        return closingWrapper;
    };
    var tabeOfContentsMarkup = getTocMarkup();
    // initialy hide ul below page-headings
    $(tabeOfContentsMarkup).find('.page-heading > li > ul').hide();
    // show the toc container
    // fill the first li - main heading - with the generated markup
    $('#toc').show().find('li').append(getTocMarkup());

    // "close" the toc for subpages, so only page-headings (h2) are shown initialy
    $('#toc .page-heading > li > a').on('click', function (event) {
        // stop the event right here
        event.preventDefault().stopPropagation();
        $(this).next('ul').toggle();
    });
    // eventhandler for page-headings (h2) to toggle their contents
})();
