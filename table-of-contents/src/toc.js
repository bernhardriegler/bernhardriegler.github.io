var getTocMarkup = function() {
    // get all heading elements in order of occurance in dom
    // except for toc heading
    var headings = $('#content').find('h2,h3,h4,h5,h6').not('#toc1 li h3');
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
            tocMarkup += "<ul class='pagehading'><li>";
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
        tocMarkup += "<a <a class='page-link' href='#" + current.attr('id') + "'>" + current.text() + "</a>";
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
$('#toc1').show().find('li').append(getTocMarkup());
