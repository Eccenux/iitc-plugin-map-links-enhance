// ==UserScript==
// @name           IITC plugin: Map links enhance
// @author         Nux
// @category       Misc
// @version        0.1.0
// @description    Better map links...
// @namespace      pl.enux.iitc
// @match          https://intel.ingress.com/*
// @grant          none
// @updateURL      https://github.com/Eccenux/iitc-plugin-map-links-enhance/raw/master/map-links-enhance.meta.js
// @downloadURL    https://github.com/Eccenux/iitc-plugin-map-links-enhance/raw/master/map-links-enhance.user.js
// ==/UserScript==
/* global android, dialog, $ */

// Notes
/**
HTML:
.linkdetails a (2nd link)
document.querySelectorAll('.linkdetails a')[1]
Function called onclick is `window.showPortalPosLinks`
/**/

class MapLinksEnhance {
	constructor() {
		this.pluginTag = '[MapLinksEnhance]'
	}
	setup() {
		console.log(this.pluginTag, 'setup', window.showPortalPosLinks);
		window.showPortalPosLinks = (lat, lng, name) => {
			this.showPortalPosLinks(lat, lng, name);
		}
	}

	showPortalPosLinks (lat, lng, name) {
		// console.log(this.pluginTag, 'showPortalPosLinks', name);

		var encoded_name = 'undefined';
		if (name !== undefined) {
			encoded_name = encodeURIComponent(name);
		}

		if (typeof android !== 'undefined' && android && android.intentPosLink) {
			android.intentPosLink(lat, lng, map.getZoom(), name, true);
		} else {
			var qrcode = '<div class="qrcode"></div>';
			var gmaps = '<a target="_blank" href="https://maps.google.com/maps?ll=' + lat + ',' + lng + '&q=' + lat + ',' + lng + '%20(' + encoded_name + ')">Google Maps</a>';
			var bingmaps = '<a target="_blank" href="http://www.bing.com/maps/?v=2&cp=' + lat + '~' + lng + '&lvl=16&sp=Point.' + lat + '_' + lng + '_' + encoded_name + '___">Bing Maps</a>';
			var osm = '<a target="_blank" href="http://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '&zoom=16">OpenStreetMap</a>';
			var latLng = '<a target="_blank" href="geo:' + lat + ',' + lng + '">&lt;' + lat + ',' + lng + '&gt;</a>';
			latLng += '<input type="text" class="portalLocField" value="' + lat + ',' + lng + '">';
			latLng += '&nbsp;<a href="javascript:void(0)" class="portalLocCopy">copy 📋</a>';
			var $dialogItem = dialog({
				html: `<div style="text-align: center;">${qrcode}<div style="margin:1em">${gmaps} • ${bingmaps} • ${osm}</div>${latLng}</div>`,
				title: name,
				id: 'poslinks'
			});

			//
			// actions setup
			var dialogItem = $dialogItem[0];

			// qrcode 
			$('.qrcode', dialogItem).qrcode({text:'GEO:' + lat + ',' + lng});

			// copy loc. 
			var locField = dialogItem.querySelector('.portalLocField');
			var locButton = dialogItem.querySelector('.portalLocCopy');
			locButton.onclick = () => {
				console.log(locField);
				this.copyTextField(locField);
			}
		}
	}

	/**
	 * Copy text field contents.
	 * @param {Element|String} source Element or selector.
	 */
	copyTextField(source) {
		if (typeof source === 'string') {
			source = document.querySelector(source);
		}
		source.select();
		document.execCommand("copy");
	}
}

// ensure plugin framework is there, even if iitc is not yet loaded
if (typeof window.plugin !== 'function') window.plugin = function () {};
window.plugin.mapLinksEnhance = new MapLinksEnhance();

//////////////////////////////////////////////////////////////////////////
// PLUGIN SETUP //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// only small wrapper to allow debugging
function wrapper(plugin_info) {
	var setup = function () {
		window.plugin.mapLinksEnhance.setup();
	}

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