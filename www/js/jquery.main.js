// page init
//jQuery(function(){
//	initTooltip();
//	initAccordion();
//});

// hover tooltip init
function initTooltip() {
	jQuery('a[title]').hoverTooltip({
		attribute: 'title',
		positionTypeX: 'center',
		positionTypeY: 'top'
	});
}

// accordion menu init
function initAccordion() {
	jQuery('ul.accordion').slideAccordion({
		opener: '.slide-opener',
		slider: '.slides',
		animSpeed: 300
	});
}

/*
 * jQuery Tooltip plugin
 */
;(function($){
	$.fn.hoverTooltip = function(o) {
		var options = $.extend({
			tooltipStructure: '<div class="hover-tooltip"><div class="tooltip-text"></div></div>',
			tooltipSelector: '.tooltip-text',
			positionTypeX: 'right',
			positionTypeY: 'top',
			attribute:'title',
			extraOffsetX: 10,
			extraOffsetY: 10,
			showOnTouchDevice: true
		},o);
		
		// create tooltip
		var tooltip = $('<div>').html(options.tooltipStructure).children().css({position:'absolute'});
		var tooltipTextBox = tooltip.find(options.tooltipSelector);
		var tooltipWidth, tooltipHeight;
		
		
		// tooltip logic
		function initTooltip(item) {
			var tooltipText = item.attr(options.attribute);
			item.removeAttr(options.attribute);
			if(!tooltipText) return;

			if(isTouchDevice) {
				if(options.showOnTouchDevice) {
					item.bind('touchstart', function(e) {
						showTooltip(item, tooltipText, getEvent(e));
						jQuery(document).one('touchend', hideMobileTooltip);
					});
				}
			} else {
				item.bind('mouseenter', function(e) {
					showTooltip(item, tooltipText, e);
				}).bind('mouseleave', hideTooltip).bind('mousemove', moveTooltip);
			}
		}
		function showTooltip(item, text, e) {
			tooltipTextBox.html(text);
			tooltip.appendTo(document.body).show();
			tooltipWidth = tooltip.outerWidth(true);
			tooltipHeight = tooltip.outerHeight(true);
			moveTooltip(e, item);
		}
		function hideTooltip() {
			tooltip.remove();
		}
		function hideMobileTooltip() {
			setTimeout(function(){
				tooltip.remove();
			},2000);
		}
		function moveTooltip(e) {
			var top, left, x = e.pageX, y = e.pageY;

			switch(options.positionTypeY) {
				case 'top':
					top = y - tooltipHeight - options.extraOffsetY;
					break;
				case 'center':
					top = y - tooltipHeight / 2;
					break;
				case 'bottom':
					top = y + options.extraOffsetY;
					break;
			}

			switch(options.positionTypeX) {
				case 'left':
					left = x - tooltipWidth - options.extraOffsetX;
					break;
				case 'center':
					left = x - tooltipWidth / 2;
					break;
				case 'right':
					left = x + options.extraOffsetX;
					break;
			}
			
			tooltip.css({
				top: top,
				left: left
			});
		}
		
		// add handlers
		return this.each(function(){
			initTooltip($(this));
		});
	};
	
	// parse event
	function getEvent(e) {
		return e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;
	}
	
	// detect device type
	var isTouchDevice = (function() {
		try {
			return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
		} catch (e) {
			return false;
		}
	}());
	
}(jQuery));

/*
 * jQuery Accordion plugin
 */
;(function($){
	$.fn.slideAccordion = function(opt){
		// default options
		var options = $.extend({
			addClassBeforeAnimation: false,
			allowClickWhenExpanded: false,
			activeClass:'active',
			opener:'.opener',
			slider:'.slide',
			animSpeed: 300,
			collapsible:true,
			event:'click'
		},opt);

		return this.each(function(){
			// options
			var accordion = $(this);
			var items = accordion.find(':has('+options.slider+')');

			items.each(function(){
				var item = $(this);
				var opener = item.find(options.opener);
				var slider = item.find(options.slider);
				opener.bind(options.event, function(e){
					if(!slider.is(':animated')) {
						if(item.hasClass(options.activeClass)) {
							if(options.allowClickWhenExpanded) {
								return;
							} else if(options.collapsible) {
								slider.slideUp(options.animSpeed, function(){
									hideSlide(slider);
									item.removeClass(options.activeClass);
								});
							}
						} else {
							// show active
							var levelItems = item.siblings('.'+options.activeClass);
							var sliderElements = levelItems.find(options.slider);
							item.addClass(options.activeClass);
							showSlide(slider).hide().slideDown(options.animSpeed);
						
							// collapse others
							sliderElements.slideUp(options.animSpeed, function(){
								levelItems.removeClass(options.activeClass);
								hideSlide(sliderElements);
							});
						}
					}
					e.preventDefault();
				});
				if(item.hasClass(options.activeClass)) showSlide(slider); else hideSlide(slider);
			});
		});
	};

	// accordion slide visibility
	var showSlide = function(slide) {
		return slide.css({position:'', top: '', left: '', width: '' });
	};
	var hideSlide = function(slide) {
		return slide.show().css({position:'absolute', top: -9999, left: -9999, width: slide.width() });
	};
}(jQuery));