import './DialogController.js';

let SERVER_HOST = null;

let API = {
	SERVER_HOST: null,
	__query: [],
	__init: function () {
		API.GET('https://bodjo.net/SERVER_HOST', (status, hostname) => {
			if (status) {
				API.SERVER_HOST = hostname;
				if (API.__query.length > 0) {
					API.__query.forEach(args => API[args[0]].apply(API, args.slice(1)));
				}
			} else {
				window.showDialog('Obtaining main server hostname error.', 'https://bodjo.net\nGET /SERVER_HOST/', 'ERR_SERVER_HOST_MISSING')
			}
		});
	},
	GET: function (url, data, cb, tryToParse) {
		if (typeof data !== 'object') {
			tryToParse = cb || true;
			cb = data;
		}
		if (typeof tryToParse === 'undefined')
			tryToParse = true;
		let xhr = new XMLHttpRequest();
		let isAPIRequest = false;
		if (typeof data === 'object') {
			if (API.SERVER_HOST == null) {
				API.__query.push(['GET'].concat(Array.prototype.slice.apply(arguments)));
				return;
			}
			isAPIRequest = true;
			url = API.SERVER_HOST + url + '?' + Object.keys(data).map(key => key + '=' + encodeURIComponent(data[key])).join('&');
		}
		console.log('[API] GET ' + url);
		xhr.open('GET', url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;

			if (xhr.status == 200) {
				let data = xhr.responseText;
				if (tryToParse) {
					try {
						data = JSON.parse(data);
					} catch (e) {}
				}
				cb(true, data);
			} else {
				if (isAPIRequest) {
					window.showDialog('GET API Request: bad response', 'Received bad HTTP GET response:\n\nGET ' + url + '\n'+xhr.getAllResponseHeaders(), 'ERR_BAD_GET_REQUEST')
				}

				console.error('Bad HTTP Response: ' + xhr.statusCode + " - " + xhr.statusText);
				cb(false, xhr);
			}

		}
	},
	POST: function (url, data, before, cb, tryToParse) {
		if (typeof data !== 'object') {
			tryToParse = cb || true;
			cb = before;
			before = data;
		}
		if (typeof tryToParse === 'undefined')
			tryToParse = true;
		let xhr = new XMLHttpRequest();
		let isAPIRequest = false;
		if (typeof data === 'object') {
			if (API.SERVER_HOST == null) {
				API.__query.push(['POST'].concat(Array.prototype.slice.apply(arguments)));
				return;
			}
			isAPIRequest = true;

			url = API.SERVER_HOST + url + '?' + Object.keys(data).map(key => key + '=' + encodeURIComponent(data[key])).join('&');
		}
		console.log('[API] POST ' + url);
		xhr.open('POST', url, true);
		before(xhr);
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;

			if (xhr.status == 200) {
				let data = xhr.responseText;
				if (tryToParse) {
					try {
						data = JSON.parse(data);
					} catch (e) {}
				}
				cb(true, data);
			} else {
				if (isAPIRequest) {
					window.showDialog('POST API Request: bad response', 'Received bad HTTP POST response:\n\nPOST ' + url + '\n'+xhr.getAllResponseHeaders(), 'ERR_BAD_POST_REQUEST')
				}

				console.error('Bad HTTP Response: ' + xhr.statusCode + " - " + xhr.statusText);
				cb(false, xhr);
			}
		}
	}
};
API.__init();
window.API = API;

export default API;