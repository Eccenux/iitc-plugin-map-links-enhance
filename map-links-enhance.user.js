// ==UserScript==
// @name           IITC plugin: Map links enhance
// @author         Nux
// @category       Misc
// @version        0.0.1
// @description    Better map links...
// @namespace      pl.enux.iitc
// @match          https://intel.ingress.com/*
// @grant          none
// @updateURL      https://github.com/Eccenux/iitc-plugin-map-links-enhance/raw/master/map-links-enhance.meta.js
// @downloadURL    https://github.com/Eccenux/iitc-plugin-map-links-enhance/raw/master/map-links-enhance.user.js
// ==/UserScript==
/* global GM_info, android, dialog */

// Notes
/**
HTML:
.linkdetails a (2nd link)
document.querySelectorAll('.linkdetails a')[1]
Function called onclick is `window.showPortalPosLinks`
/**/

class MapLinksEnhance {
	setup() {
		window.showPortalPosLinks = this.showPortalPosLinks;
	}

	showPortalPosLinks = function (lat, lng, name) {
		var encoded_name = 'undefined';
		if (name !== undefined) {
			encoded_name = encodeURIComponent(name);
		}
	
		if (typeof android !== 'undefined' && android && android.intentPosLink) {
			android.intentPosLink(lat, lng, map.getZoom(), name, true);
		} else {
			var qrcode = '<div id="qrcode"></div>';
			var script = '<script>$(\'#qrcode\').qrcode({text:\'GEO:' + lat + ',' + lng + '\'});</script>';
			var gmaps = '<a href="https://maps.google.com/maps?ll=' + lat + ',' + lng + '&q=' + lat + ',' + lng + '%20(' + encoded_name + ')">Google Maps</a>';
			var bingmaps = '<a href="http://www.bing.com/maps/?v=2&cp=' + lat + '~' + lng + '&lvl=16&sp=Point.' + lat + '_' + lng + '_' + encoded_name + '___">Bing Maps</a>';
			var osm = '<a href="http://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '&zoom=16">OpenStreetMap</a>';
			var latLng = '<span>&lt;' + lat + ',' + lng + '&gt;</span>';
			dialog({
				html: '<div style="text-align: center;">' + qrcode + script + gmaps + '; ' + bingmaps + '; ' + osm + '<br />' + latLng + '</div>',
				title: name,
				id: 'poslinks'
			});
		}
	}	
}

// ensure plugin framework is there, even if iitc is not yet loaded
if (typeof window.plugin !== 'function') window.plugin = function () {};
window.plugin.mapLinksEnhance = new MapLinksEnhance;
// PLUGIN END //////////////////////////////////////////////////////////

// only small wrapper to allow debugging
function wrapper(plugin_info) {
	var setup = window.plugin.mapLinksEnhance.setup;

	setup.info = plugin_info; //add the script info data to the function as a property
	if (!window.bootPlugins) window.bootPlugins = [];
	window.bootPlugins.push(setup);
	// if IITC has already booted, immediately run the 'setup' function
	if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = {
	version: GM_info.script.version,
	name: GM_info.script.name,
	description: GM_info.script.description
};
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);