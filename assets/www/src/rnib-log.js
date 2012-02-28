;(function(exports, $, console){
	var module = {};
	var LEVEL_COLOUR = [
		'black',
		'blue',
		'orange',
		'red'
	];
	var i = 0;

	function logInsert(html) {
		$('#console').html(function(index, oldHtml) {
			return html +'<br/>'+ oldHtml;
		});
	}

	function escapeHTML(h) {
		return h.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}

	function html2txt(html) {
		return $('<div/>').html(html).text();
	}

	function showAll(a) {
		if (null === a) {
			return a;
		}

		var s = a +':[\n';
		for (i = 0; i < a.length; i++) {
			s = s +'  ['+ i +"]:'"+ a[i] +"'\n";
		}
		return s +']';
	}

	function describe(o) {
		var s = o +':{\n';
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				s = s +'  '+ k +":'"+ o[k] +"'\n";
			}
		}
		return s +'}';
	}

	function chopToSafeLengths(o) {
		// TODO: Implement length-safe logging
		return o;
	}

	function consoleLogAtLevel(lvl, msg) {
		var nonHtml = escapeHTML(msg);
		logInsert('<font color="' + LEVEL_COLOUR[lvl] + '">' + nonHtml + '</font>');
	}

	function logAtLevel(lvl, msg) {
		consoleLogAtLevel(lvl, msg);
	}

	module.debug = function(msg) {
		console.log(chopToSafeLengths(msg));
		logInsert(escapeHTML(msg)); // optimized version for log
	};

	module.info = function(msg) {
		console.info(chopToSafeLengths(msg));
		logAtLevel(1, msg);
	};

	module.warn = function(msg) {
		console.warn(chopToSafeLengths(msg));
		logAtLevel(2, msg);
	};

	module.error = function(msg) {
		console.error(chopToSafeLengths(msg));
		logAtLevel(3, msg);
	};

	module.log = module.debug;

	module.logHtml = function(html) {
		console.log(chopToSafeLengths(html2txt(html))); // defaults to 'log' level
		logInsert(html);
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.log = module;
})(this, jQuery, console);
