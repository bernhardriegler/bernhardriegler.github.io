$(function(){
    var $form = $('#learneasyform');
    $("#learneasyform").find("input, select, textarea").not("[type=submit]").jqBootstrapValidation({
            preventSubmit: true,
            submitError: function($form, event, errors) {
                $('html, body').animate({
                    scrollTop: $form.offset().top
                }, 1000);
            },
            submitSuccess: function($form, event) {
                alert("OK");
                event.preventDefault();
            },
            filter: function() {
                return $(this).is(":visible");
            }
        });
});