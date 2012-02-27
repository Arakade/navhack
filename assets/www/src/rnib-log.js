;(function(exports, $){
	var module = {};
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
			s = s +'  '+ k +":'"+ o[k] +"'\n";
		}
		return s +'}';
	}

	function logLengthSafe(o) {
		console.log(o);
		// TODO: Implement length-safe logging
	}

	module.log = function(msg) {
		logLengthSafe(msg);
		logInsert(escapeHTML(msg));
	};

	module.logHtml = function(html) {
		logLengthSafe(html2txt(html));
		logInsert(html);
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.log = module;
})(this, jQuery);
