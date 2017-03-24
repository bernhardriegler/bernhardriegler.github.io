      /* ============================================================
       * Angular Module Definition
       * ============================================================= */
      var app = angular.module('IntergalacticTravel', []);


      /* ============================================================
       * Angular Controller(s)
       * ============================================================= */
      app.controller('IntergalacticTravelController', function($scope, $timeout) {
        // Set initial Destination & Price
        $scope.destination = Planets["mars"];
        $scope.totalPrice = $scope.destination["price"];

        // Options for Tristate Checkboxes
        $scope.allOptions = false;
        $scope.tourOptions = TourOptions;

        // Options for upcoming events
        $scope.upcomingEvents = UpcomingEvents;

        // Function to switch ad at top of page
        $scope.switchAd = function() {
          var index = Ads.indexOf($scope.ad);
          var nextAd = Ads[++index];

          if (nextAd) {
            $scope.ad = nextAd;
          } else {
            $scope.ad = Ads[0];
          }

          $timeout(function() {
            $scope.switchAd();
            var adImage = document.getElementById('ad-image');
            var adBannerArea = document.getElementById('ad-banner');
            adBannerArea.removeChild(adImage);
            adBannerArea.appendChild(adImage);
          }, 5000);
        };

        // Set initial Ad
        $scope.ad = Ads[0];

        // Change ad every 5000ms
        $timeout(function() {
          $scope.switchAd();
        }, 5000);

        // Function that calculates trip total price based on checked options & destination
        $scope.totalPrice = function() {

          // Store which options are checked in selctedOptions
          var selectedOptions = $scope.tourOptions
            .filter(function(option) {
              return option.checked;
            });

          // Determina if all options are checked or not
          $scope.allOptions = selectedOptions.length === $scope.tourOptions.length;  

          // If there are options checked, determine what their price is and add it to the total 
          if (selectedOptions.length) {
            var optionTotal = selectedOptions.map(function(option) {
              return option.price;
            }).reduce(function(a, b) {
              return a + b;
            });
          } else {
            var optionTotal = 0;
          }
          return $scope.destination["price"] + optionTotal;
        };
      });


      /* ============================================================
       * Typeahead Definition
       * ============================================================= */
      $(function(){
        $("#input-destination").typeahead({
          source: $.map(Planets, function(planet) { return planet.name }),
          updater: function(item) {
            if (!item) {
              return;
            };

            var $scope = angular.element($("body")[0]).scope();

            $scope.$apply(function() {
              var itemKey = item.toLowerCase();
              $scope.destination = Planets[itemKey];
            });
            console.log(item);
            return item;
          }
        });
      });
      

      /* ============================================================
       * Angular Directive(s)
       *   -Tristate checkbox directive
       * ============================================================= */
      app.directive('indeterminateCheckbox', [function() {
        return {
          link: function(scope, element, attrs) {
            var childList = attrs.childList;
            var property = attrs.property;

            // Bind the onChangeevent to update the children
            element.bind('change', function() {
              scope.$apply(function() {
                var isChecked = element.prop('checked');

                // Set each child's selected property to the checkbox's checked property
                angular.forEach(scope.$eval(childList), function(child) {
                  child[property] = isChecked;
                });
              });
            });

            // Watch the children for changes
            scope.$watch(childList, function(newValue) {
              var hasChecked = false;
              var hasUnchecked = false;

              // Loop through the children
              angular.forEach(newValue, function(child) {
                if (child[property]) {
                  hasChecked = true;
                } else {
                  hasUnchecked = true;
                }
              });

              handleTriStateCheckboxStateChange(element[0], hasChecked, hasUnchecked);
              if (hasChecked && hasUnchecked) {
                element.prop('checked', false);
                element.prop('indeterminate', true);
                scope[attrs.ngModel] = false;
              } else {
                element.prop('checked', hasChecked);
                element.prop('indeterminate', false);
                scope[attrs.ngModel] = hasChecked;
              }
            }, true);
          }
        };
      }]);


      /* ============================================================
       * Typeahead Library
       * =============================================================
       * bootstrap-typeahead.js v2.3.2
       * http://twitter.github.com/bootstrap/javascript.html#typeahead
       * =============================================================
       * Copyright 2012 Twitter, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       * ============================================================ */


      !function($){

        "use strict"; // jshint ;_;


       /* TYPEAHEAD PUBLIC CLASS DEFINITION
        * ================================= */

        var Typeahead = function (element, options) {
          this.$element = $(element)
          this.options = $.extend({}, $.fn.typeahead.defaults, options)
          this.matcher = this.options.matcher || this.matcher
          this.sorter = this.options.sorter || this.sorter
          this.highlighter = this.options.highlighter || this.highlighter
          this.updater = this.options.updater || this.updater
          this.source = this.options.source
          this.$menu = $(this.options.menu)
          this.shown = false
          this.listen()
        }

        Typeahead.prototype = {

          constructor: Typeahead

        , select: function () {
            var val = this.$menu.find('.active').attr('data-value')
            this.$element
              .val(this.updater(val))
              .change()
            return this.hide()
          }

        , updater: function (item) {
            return item
          }

        , show: function () {
            var pos = $.extend({}, this.$element.position(), {
              height: this.$element[0].offsetHeight
            })

            this.$menu
              .insertAfter(this.$element)
              .css({
                top: pos.top + pos.height
              , left: pos.left
              })
              .show()

            this.shown = true
            return this
          }

        , hide: function () {
            this.$menu.hide()
            this.shown = false
            return this
          }

        , lookup: function (event) {
            var items

            this.query = this.$element.val()

            if (!this.query || this.query.length < this.options.minLength) {
              return this.shown ? this.hide() : this
            }

            items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source

            return items ? this.process(items) : this
          }

        , process: function (items) {
            var that = this

            items = $.grep(items, function (item) {
              return that.matcher(item)
            })

            items = this.sorter(items)

            if (!items.length) {
              return this.shown ? this.hide() : this
            }

            return this.render(items.slice(0, this.options.items)).show()
          }

        , matcher: function (item) {
            return ~item.toLowerCase().indexOf(this.query.toLowerCase())
          }

        , sorter: function (items) {
            var beginswith = []
              , caseSensitive = []
              , caseInsensitive = []
              , item

            while (item = items.shift()) {
              if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
              else if (~item.indexOf(this.query)) caseSensitive.push(item)
              else caseInsensitive.push(item)
            }

            return beginswith.concat(caseSensitive, caseInsensitive)
          }

        , highlighter: function (item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
            return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
              return '<strong>' + match + '</strong>'
            })
          }

        , render: function (items) {
            var that = this

            items = $(items).map(function (i, item) {
              i = $(that.options.item).attr('data-value', item)
              i.find('a').html(that.highlighter(item))
              return i[0]
            })

            items.first().addClass('active')
            this.$menu.html(items)
            return this
          }

        , next: function (event) {
            var active = this.$menu.find('.active').removeClass('active')
              , next = active.next()

            if (!next.length) {
              next = $(this.$menu.find('li')[0])
            }

            var domObj = next[0];
            domObj.id = new Date().getTime();
            setActiveAutocompleteItem(domObj);
          }

        , prev: function (event) {
            var active = this.$menu.find('.active').removeClass('active')
              , prev = active.prev()

            if (!prev.length) {
              prev = this.$menu.find('li').last()
            }

            var domObj = prev[0];
            domObj.id = new Date().getTime();
            setActiveAutocompleteItem(domObj);
          }

        , listen: function () {
            this.$element
              .on('focus',    $.proxy(this.focus, this))
              .on('blur',     $.proxy(this.blur, this))
              .on('keypress', $.proxy(this.keypress, this))
              .on('keyup',    $.proxy(this.keyup, this))

            if (this.eventSupported('keydown')) {
              this.$element.on('keydown', $.proxy(this.keydown, this))
            }

            this.$menu
              .on('click', $.proxy(this.click, this))
              .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
              .on('mouseleave', 'li', $.proxy(this.mouseleave, this))
          }

        , eventSupported: function(eventName) {
            var isSupported = eventName in this.$element
            if (!isSupported) {
              this.$element.setAttribute(eventName, 'return;')
              isSupported = typeof this.$element[eventName] === 'function'
            }
            return isSupported
          }

        , move: function (e) {
            if (!this.shown) return

            switch(e.keyCode) {
              case 9: // tab
              case 13: // enter
              case 27: // escape
                e.preventDefault()
                break

              case 38: // up arrow
                e.preventDefault()
                this.prev()
                break

              case 40: // down arrow
                e.preventDefault()
                this.next()
                break
            }

            e.stopPropagation()
          }

        , keydown: function (e) {
            this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27])
            this.move(e)
          }

        , keypress: function (e) {
            if (this.suppressKeyPressRepeat) return
            this.move(e)
          }

        , keyup: function (e) {
            switch(e.keyCode) {
              case 40: // down arrow
              case 38: // up arrow
              case 16: // shift
              case 17: // ctrl
              case 18: // alt
                break

              case 9: // tab
              case 13: // enter
                if (!this.shown) return
                this.select()
                break

              case 27: // escape
                if (!this.shown) return
                this.hide()
                break

              default:
                this.lookup()
            }

            e.stopPropagation()
            e.preventDefault()
        }

        , focus: function (e) {
            this.focused = true
          }

        , blur: function (e) {
            this.focused = false
            if (!this.mousedover && this.shown) this.hide()
          }

        , click: function (e) {
            e.stopPropagation()
            e.preventDefault()
            this.select()
            this.$element.focus()
          }

        , mouseenter: function (e) {
            this.mousedover = true
            this.$menu.find('.active').removeClass('active')
            $(e.currentTarget).addClass('active')
          }

        , mouseleave: function (e) {
            this.mousedover = false
            if (!this.focused && this.shown) this.hide()
          }

        }


        /* TYPEAHEAD PLUGIN DEFINITION
         * =========================== */

        var old = $.fn.typeahead

        $.fn.typeahead = function (option) {
          return this.each(function () {
            var $this = $(this)
              , data = $this.data('typeahead')
              , options = typeof option == 'object' && option
            if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
            if (typeof option == 'string') data[option]()
          })
        }

        $.fn.typeahead.defaults = {
          source: []
        , items: 8
        , menu: '<ul class="typeahead dropdown-menu"></ul>'
        , item: '<li><a href="#"></a></li>'
        , minLength: 1
        }

        $.fn.typeahead.Constructor = Typeahead


       /* TYPEAHEAD NO CONFLICT
        * =================== */

        $.fn.typeahead.noConflict = function () {
          $.fn.typeahead = old
          return this
        }


       /* TYPEAHEAD DATA-API
        * ================== */

        $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
          var $this = $(this)
          if ($this.data('typeahead')) return
          $this.typeahead($this.data())
        })

      }(window.jQuery);

      /* ============================================================
       * Modal Library
       * =============================================================
       * bootstrap-modal.js v2.3.2
       * http://twitter.github.com/bootstrap/javascript.html#modals
       * =========================================================
       * Copyright 2012 Twitter, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       * ========================================================= */


      !function ($) {

        "use strict"; // jshint ;_;


       /* MODAL CLASS DEFINITION
        * ====================== */

        var Modal = function (element, options) {
          this.options = options
          this.$element = $(element)
            .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
          this.options.remote && this.$element.find('.modal-body').load(this.options.remote)
        }

        Modal.prototype = {

            constructor: Modal

          , toggle: function () {
              return this[!this.isShown ? 'show' : 'hide']()
            }

          , show: function () {
              var that = this
                , e = $.Event('show')

              this.$element.trigger(e)

              if (this.isShown || e.isDefaultPrevented()) return

              this.isShown = true

              this.escape()

              this.backdrop(function () {
                var transition = $.support.transition && that.$element.hasClass('fade')

                if (!that.$element.parent().length) {
                  that.$element.appendTo(document.body) //don't move modals dom position
                }

                that.$element.show()

                if (transition) {
                  that.$element[0].offsetWidth // force reflow
                }

                showModalPopup(that.$element[0]);
              })
            }

          , hide: function (e) {
              e && e.preventDefault()

              var that = this

              e = $.Event('hide')

              this.$element.trigger(e)

              if (!this.isShown || e.isDefaultPrevented()) return

              this.isShown = false

              this.escape()

              $(document).off('focusin.modal')

              that.$element[0].className = 'modal hide fade';

              $.support.transition && this.$element.hasClass('fade') ?
                this.hideWithTransition() :
                this.hideModal()
            }

          , enforceFocus: function () {
              var that = this
              $(document).on('focusin.modal', function (e) {
                if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
                  that.$element.focus()
                }
              })
            }

          , escape: function () {
              var that = this
              if (this.isShown && this.options.keyboard) {
                this.$element.on('keyup.dismiss.modal', function ( e ) {
                  e.which == 27 && that.hide()
                })
              } else if (!this.isShown) {
                this.$element.off('keyup.dismiss.modal')
              }
            }

          , hideWithTransition: function () {
              var that = this
                , timeout = setTimeout(function () {
                    that.$element.off($.support.transition.end)
                    that.hideModal()
                  }, 500)

              this.$element.one($.support.transition.end, function () {
                clearTimeout(timeout)
                that.hideModal()
              })
            }

          , hideModal: function () {
              var that = this
              this.$element.hide()
              this.backdrop(function () {
                that.removeBackdrop()
                that.$element.trigger('hidden')
              })
            }

          , removeBackdrop: function () {
              this.$backdrop && this.$backdrop.remove()
              this.$backdrop = null
            }

          , backdrop: function (callback) {
              var that = this
                , animate = this.$element.hasClass('fade') ? 'fade' : ''

              if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate

                this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
                  .appendTo(document.body)

                this.$backdrop.click(
                  this.options.backdrop == 'static' ?
                    $.proxy(this.$element[0].focus, this.$element[0])
                  : $.proxy(this.hide, this)
                )

                if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

                this.$backdrop.addClass('in')

                if (!callback) return

                doAnimate ?
                  this.$backdrop.one($.support.transition.end, callback) :
                  callback()

              } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass('in')

                $.support.transition && this.$element.hasClass('fade')?
                  this.$backdrop.one($.support.transition.end, callback) :
                  callback()

              } else if (callback) {
                callback()
              }
            }
        }


       /* MODAL PLUGIN DEFINITION
        * ======================= */

        var old = $.fn.modal

        $.fn.modal = function (option) {
          return this.each(function () {
            var $this = $(this)
              , data = $this.data('modal')
              , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option]()
            else if (options.show) data.show()
          })
        }

        $.fn.modal.defaults = {
            backdrop: true
          , keyboard: true
          , show: true
        }

        $.fn.modal.Constructor = Modal


       /* MODAL NO CONFLICT
        * ================= */

        $.fn.modal.noConflict = function () {
          $.fn.modal = old
          return this
        }


       /* MODAL DATA-API
        * ============== */

        $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
          var $this = $(this)
            , href = $this.attr('href')
            , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
            , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

          e.preventDefault()

          $target
            .modal(option)
            .one('hide', function () {
              $this.focus()
            })
        })

        $(document).on('keydown.modal.data-api', '[data-toggle="modal"]', function (e) {
          // Only react to ENTER key.
          if (e.keyCode != 13) {
            return;
          }
          var $this = $(this)
            , href = $this.attr('href')
            , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
            , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

          e.preventDefault()

          $target
            .modal(option)
            .one('hide', function () {
              $this.focus()
            })
        })

      }(window.jQuery);


/* =============================================================
 * bootstrap-collapse.js v2.3.2
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning || this.$element.hasClass('in')) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')

      $.support.transition && this.$element[dimension](this.$element[0][scroll])

      var collapseArea = this.$element[0];
      var collapseControlId = collapseArea.id.replace('collapse', 'collapsecontrol');
      var collapseControl = document.getElementById(collapseControlId);
      showCollapsableArea(collapseControl, collapseArea);
    }

  , hide: function () {
      var dimension
      if (this.transitioning || !this.$element.hasClass('in')) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)

      var collapseArea = this.$element[0];
      var collapseControlId = collapseArea.id.replace('collapse', 'collapsecontrol');
      var collapseControl = document.getElementById(collapseControlId);
      hideCollapsableArea(collapseControl, collapseArea);
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSE PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = $.extend({}, $.fn.collapse.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSE NO CONFLICT
  * ==================== */

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


 /* COLLAPSE DATA-API
  * ================= */

  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href
      , target = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $(target).data('collapse') ? 'toggle' : $this.data()
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $(target).collapse(option)
  })

  $(document).on('keydown.collapse.data-api', '[data-toggle=collapse]', function (e) {
    // Only react to ENTER key.
    if (e.keyCode != 13) {
      return;
    }
    var $this = $(this), href
      , target = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $(target).data('collapse') ? 'toggle' : $this.data()
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $(target).collapse(option)
  })

}(window.jQuery);








