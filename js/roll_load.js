//使用.roll_load作为最外层载体,.page来区分页面,主要使用在滑动动态加载其他page
//参数
//options={
//	speed 动画时间,默认300
//	index 开始下标,默认0
//	stopPropagation 阻止默认时间 默认false
//	callback 回调函数 (当前显示下标, 当前显示页面)
//	transitionEnd 动画结束回调(事件参数,当前显示下标, 当前显示页面)
//}
//rollLoad方法 init (初始化) resizeHeight(重新获取page[index]高度)
//author:wyc
//time:2015.7.22
var rollLoad = {
	init: function(options) {
		options = options || {};
		var speed = options.speed || 200;
		var roll_load = $(".roll_load");
		roll_load.each(function(index, el) {
			var element = this;
			var pages = $(element).find(".page");
			var index = options.index || 0;
			var maxIndex = pages.length - 1;
			var minHeight = $(window).height();
			var isollLoad = undefined;
			var start = {};
			var delta = {};
			$(element).css("overflow", "hidden");
			$(pages).css({
				"transform": "translateY(0px) translateZ(0px)",
				"transition": "transform 200ms easy-out",
				"-webkit-transition": "-webkit-transform 200ms easy-out",
				"min-height": minHeight
			})
			$(element).height($(pages[index]).height());
			var noop = function() {};
			var offloadFn = function(fn) {
				setTimeout(fn || noop, 0)
			};
			var translate = function(index, dist, speed) {
				var slide = pages[index];
				var style = slide && slide.style;
				if (!style) return;
				style.webkitTransitionDuration =
					style.MozTransitionDuration =
					style.msTransitionDuration =
					style.OTransitionDuration =
					style.transitionDuration = speed + 'ms';
				style.webkitTransform = 'translate(0,' + dist + 'px)' + 'translateZ(0)';
				style.msTransform =
					style.MozTransform =
					style.OTransform = 'translateY(' + dist + 'px)';
			}
			var hastransitions = (function(temp) {
				var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
				for (var i in props)
					if (temp.style[props[i]] !== undefined) return true;
				return false;
			})(document.createElement('swipe'));
			var events = {
				handleEvent: function(event) {
					switch (event.type) {
						case 'touchstart':
							this.start(event);
							break;
						case 'touchmove':
							this.move(event);
							break;
						case 'touchend':
							this.end(event);
							break;
						case 'touchcancel':
							this.end(event);
							break;
						case 'webkitTransitionEnd':
						case 'msTransitionEnd':
						case 'oTransitionEnd':
						case 'otransitionend':
						case 'transitionend':
							offloadFn(this.transitionEnd(event));
							break;
						case 'resize':
							offloadFn(setup);
							break;
					}
					if (options.stopPropagation) event.stopPropagation();
				},
				start: function(event) {
					var touches = event.touches[0];
					// measure start values
					start = {
						// get initial touch coords
						x: touches.pageX,
						y: touches.pageY,
						// store time to determine touch duration
						time: +new Date
					};
					isollLoad = undefined;
					// reset delta and end measurements
					delta = {};
					if (index > 0 || index < maxIndex) {
						// attach touchmove and touchend listeners
						element.addEventListener('touchmove', this, false);
						element.addEventListener('touchend', this, false);
						//add by Alon Zhang
						element.addEventListener('touchcancel', this, false);
					}
				},
				move: function(event) {
					// ensure swiping with one touch and not pinching
					if (event.touches.length > 1 || event.scale && event.scale !== 1) return
					var touches = event.touches[0];
					// measure change in x and y
					delta = {
						x: touches.pageX - start.x,
						y: touches.pageY - start.y
					}
					// determine if scrolling test has run - one time test
					if (isollLoad == undefined) {
						isollLoad = (
							(Math.abs(delta.y) > Math.abs(delta.x)) && ((delta.y < 0 && index < maxIndex) || (delta.y > 0 && index > 0)) &&
							(delta.y < 0 && ($(window).scrollTop() + $(window).height() === $(element).height()) || delta.y > 0 && ($(window).scrollTop() === 0))
						)
					}
					// if user is not trying to scroll vertically
					if (isollLoad) {
						// prevent native scrolling
						event.preventDefault();
						var nowH = 0;
						for (var i = 0; i < index; i++) {
							var iH = $(pages[i]).height();
							//nowH -= iH > minHeight ? iH : minHeight;
							nowH -= iH;
						}
						if (delta.y < 0) {
							translate(index, nowH + delta.y, 0);
							translate(index + 1, nowH + delta.y, 0);
						} else {
							translate(index - 1, nowH + delta.y, 0);
							translate(index, nowH + delta.y, 0);
						}
					}
				},
				end: function(event) {
					var duration = +new Date - start.time;
					// determine if slide attempt triggers next/prev slide
					var isValidSlide =
						Number(duration) < 250 // if slide duration is less than 250ms
						&& Math.abs(delta.y) > 20 // and if slide amt is greater than 20px
						|| Math.abs(delta.y) > minHeight / 3; // or if slide amt is greater than half the width
					// determine direction of swipe (true:bottom, false:top)
					var direction = delta.y < 0;
					var nowH = 0,
						lastH = 0,
						nextH = 0;
					for (var i = 0; i <= index; i++) {
						var iH = $(pages[i]).height();
						//iH = iH > minHeight ? iH : minHeight;
						if (i === index) {
							nextH = -iH
						} else {
							nowH -= iH;
							i === index - 1 && (lastH = -iH);
						}
					}
					// console.log("!nowH: "+nowH+"   !lastH: "+lastH+"   !nextH: "+nextH)
					// if not scrolling vertically
					if (isollLoad) {
						if (isValidSlide) {
							if (direction) {
								translate(index, nowH + nextH, speed);
								translate(index + 1, nowH + nextH, speed);
								index++;
							} else {
								translate(index - 1, nowH - lastH, speed);
								translate(index, nowH - lastH, speed);
								index--;
							}
							var nh = $(pages[index]).height();
							$(element).height(nh);
							!direction && nh > minHeight && $(window).scrollTop(nh - minHeight);
							options.callback && options.callback(+index, pages[index]);
						} else {
							if (direction) {
								translate(index, nowH, speed);
								translate(index + 1, nowH, speed);
							} else {
								translate(index - 1, nowH, speed);
								translate(index, nowH, speed);
							}
						}
					}
					// kill touchmove and touchend event listeners until touchstart called again
					element.removeEventListener('touchmove', events, false);
					element.removeEventListener('touchend', events, false);
					//add by Alon Zhang
					element.removeEventListener('touchcancel', events, false);
					//add by Alon Zhang
					//resume slide
				},
				transitionEnd: function(event) {
					options.transitionEnd && options.transitionEnd.call(event, +index, pages[index]);
				}
			};
			element.addEventListener('touchstart', events, false);
			if (hastransitions) {
				element.addEventListener('webkitTransitionEnd', events, false);
				element.addEventListener('msTransitionEnd', events, false);
				element.addEventListener('oTransitionEnd', events, false);
				element.addEventListener('otransitionend', events, false);
				element.addEventListener('transitionend', events, false);
			}
		});
	},
	resizeHeight: function(index) {
		var roll_load = $(".roll_load");
		roll_load.each(function(i, el) {
			var pages = $(this).find(".page");
			$(this).height($(pages[index]).height());
		});
	}
}