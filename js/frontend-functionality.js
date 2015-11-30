"use strict";


/*
 * Fetch the script for Googletag service.
 */
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];
(function() {
    var gads = document.createElement( "script" );
    gads.async = true;
    gads.type = "text/javascript";
    var useSSL = "https:" == document.location.protocol;
    gads.src = ( useSSL ? "https:" : "http:" ) + "//www.googletagservices.com/tag/js/gpt.js";
    var node =document.getElementsByTagName( "script" )[0];
    node.parentNode.insertBefore( gads, node );
})();



/*
 * Handle the jQuery functionality.
 */
( function( $ ) {

    /*
     * Define the offset in pixels from the viewport,
     * at which an ad load must be triggered.
     */
    var AD_LOAD_OFFSET = 1000;

    /*
     * Declare the variable which holds the screen width.
     */
    var screen_width;



    /*
     * Initialize a counter for assigning
     * unique IDs to ad units containers.
     */
    var ad_unit_counter = 0;



    /*
     * Keep in one place all screen widths at
     * which ads must be reloaded.
     */
    var screen_widths = [];



    /* 
     * Keep a record of the last screen width
     * for which ads were requested.
     */
    var current_mapping = fetch_current_mapping();



    /*
     * Store information regarding the ad unit containers
     * that are in the DOM structure at any given moment.
     */
    var ad_unit_containers = [];



    /*
     * Get the current mapping, based on the current screen width.
     */
    function fetch_current_mapping() {
        var new_mapping_width = screen_width;
        for ( var cursor = 0; cursor < screen_widths.length; cursor ++ ) {
            if ( new_mapping_width <= screen_widths[ cursor ] ) {
                return screen_widths[ cursor ];
            }
        }
    }



    /*
     * Add new ad unit containers to the list of
     * containers present in the DOM structure.
     */
    function add_containers_to_list() {
        $( '.widget-ad[data-ad-complete!="yes"]' ).each( function() {
            var $unit = $( this );
            if ( typeof $unit.attr( "id" ) == "undefined" ) {
                // Add the ID attribute on container element.
                var ad_unit_id = "ad-unit-" + ad_unit_counter;
                // Increment the counter;
                ad_unit_counter ++;
                $unit.attr( "id", ad_unit_id );
                // Add the unit to the list.
                ad_unit_containers.push( ad_unit_id );
            }
        });
    }



    /*
     * Remove ad unit containers from the list of
     * containers present in the DOM structure. Called
     * when pages are removed from the DOM structure.
     */
    function remove_containers_from_list() {
        var index = ad_unit_containers.length;
        while ( -- index ) {
            var ad_unit_id = ad_unit_containers[ index ];
            if ( $( "#" + ad_unit_id ).length == 0 ) {
                ad_unit_containers.splice( index, 1 );
            }
        }
    }



    /*
     * Remove ad unit containers from the list of
     * containers present in the DOM structure. Called
     * when pages are removed from DOM structure.
     */
    function container_close_to_viewport( unit_element ) {
        /* Get the information regarding the offset
         * of the container in relation to the viewport. */
        var unit_offset = unit_element.getBoundingClientRect();
        var top_offset = unit_offset.top;
        var bottom_offset = unit_offset.bottom;
        var screen_height = $( window ).height();

        return (
                // Ad unit container is about to enter viewport from above.
                ( bottom_offset < - AD_LOAD_OFFSET ) ||
                // Ad unit container is about to enter viewport from below.
                ( ( top_offset > 0 ) && ( top_offset < screen_height + AD_LOAD_OFFSET ) )
            );
    }



    /*
     * Create the ad units for the ad slots
     * that are close to entering the viewport.
     */
    function maybe_create_ad_units( trigger ) {
        $.each( ad_unit_containers, function( index, ad_unit_id ) {
            var $unit = $( "#" + ad_unit_id );
            /* Make sure that the ad unit has not been
             * loaded and that it is approaching the viewport. */
            if ( ( $unit.attr( "data-ad-complete" ) != "yes" ) &&
                    ( ( trigger == "timeout-trigger" ) ||
                    ( ( trigger == "scroll-trigger" ) && container_close_to_viewport( $unit[0] ) ) ) ) {
                // Retrieve the ad unit tag.
                var ad_unit_tag = $unit.data( "adunit" );
                // Fetch the size pairs.
                var sizes = com_ad_config.ad_units_config[ ad_unit_tag ];
                // Begin the mapping.
                var unit_mapping = googletag.sizeMapping();
                // Also store ad sizes separately.
                var unit_sizes = [];

                $.each( sizes, function( sizes_index, size ) {
                    // Turn all sizes to integers.
                    var screen_width = parseInt( size.screen_width );
                    var screen_height = parseInt( size.screen_height );
                    var unit_width = parseInt( size.unit_width );
                    var unit_height = parseInt( size.unit_height );

                    var screen_size = [ screen_width, screen_height ];
                    var unit_size = [ unit_width, unit_height ];

                    //Push the sizes pair to the array of mappings.
                    unit_mapping = unit_mapping.addSize( screen_size, unit_size );
                    unit_sizes.push( unit_size );

                    // Maybe push a new width to the array of screen widths.
                    if ( screen_widths.indexOf( screen_width ) == -1 ) {
                        screen_widths.push( screen_width );
                    }
                });

                // Sort the screen widths, with greatest first.
                screen_widths = screen_widths.reverse();
                
                // Now build the mapping.
                unit_mapping = unit_mapping.build();

                // Finally, define and load the ad slot.
                googletag.cmd.push(function() {
                    var advert = googletag.defineSlot( ad_unit_tag, unit_sizes, ad_unit_id ).
                                    defineSizeMapping( unit_mapping ).
                                    setCollapseEmptyDiv( true ).
                                    addService( googletag.pubads() );
                    googletag.display( ad_unit_id );
                    googletag.pubads().refresh([ advert ]);
                });

                $unit.attr( 'data-ad-complete', 'yes' );
            }
        });
    }



    /*
     * Test if the Googletag service has been loaded
     * and only then prepare the ad units.
     */
    function init_when_ready() {
        // Verify Googletag service is ready.
        if ( window.googletag && googletag.apiReady ) {
            // Now load the ads.
            googletag.cmd.push(function() {
                googletag.pubads().enableAsyncRendering();
                googletag.pubads().collapseEmptyDivs( true );
                googletag.enableServices();
                // Create the ad units for ad containers loaded at page init.
                add_containers_to_list();
                maybe_create_ad_units( "timeout-trigger" );
            });
        } else {
            // Pubads not ready, try again a bit later.
            setTimeout( function() {
                init_when_ready();
            }, 250 );
        }
    }



    /*
     * Check if AdBlock is enabled.
     */
    function look_for_ad_block() {
        if( typeof blockAdBlock === "undefined" ) {
            display_adblock_notification();
        } else {
            blockAdBlock.onDetected( display_adblock_notification );
        }
    }



    /*
     * Test if cookies are enabled in the browser.
     */
    function check_if_cookies_are_enabled() {
        var cookies_enabled = ( navigator.cookieEnabled ) ? true : false;

        if ( ( typeof navigator.cookieEnabled == "undefined" ) && ! cookies_enabled ) { 
            document.cookie = "com_test_cookie";
            cookies_enabled = ( document.cookie.indexOf( "com_test_cookie" ) != -1 ) ? true : false;
        }

        return cookies_enabled;
    }



    /*
     * Display notification if AdBlock is enabled and the notification
     * box has not already been dismissed in the last 24 hours.
     */
    function display_adblock_notification() {
        if ( ( ! ad_block_notification_cookie_is_set() ) && ( com_ad_config.ad_blocker_message != "" ) ) {
            $( "body" ).append( '<div class="adblock-notification-wrapper"><div class="adblock-notification"><div class="text">' + com_ad_config.ad_blocker_message + '</div><div class="js-dismiss">x</div></div></div>' );
        }
    }



    /*
     * Check if the AdBlock notification cookie is set.
     */
    function ad_block_notification_cookie_is_set() {
        var cookie_name = "com_ad_block_notification=";
        var all_cookies = document.cookie.split( ';' );
        for ( var index=0; index < all_cookies.length; index ++ ) {
            var current_cookie = all_cookies[ index ];
            while ( current_cookie.charAt( 0 ) == " " ) {
                current_cookie = current_cookie.substring( 1 );
            }
            if ( current_cookie.indexOf( cookie_name ) == 0 ) {
                return true;
            }
        }

        return false;
    }



    /*
     * Set the cookie to avoid displaying the notification
     * box after dismissal for the next 24 hours.
     */
    function set_ad_block_notification_cookie() {
        var expiry_date = new Date();
        // Set the expiry date to 24 hours from now.
        expiry_date.setTime( expiry_date.getTime() + (  24 * 60 * 60 * 1000 ) );
        var expires = "expires=" + expiry_date.toUTCString();
        document.cookie = "com_ad_block_notification=1;" + expires;
    }



    /*
     * Run actions on document ready.
     */
    $( document ).ready( function() {

        /*
         * Check if AdBlock is enabled only if cookies are enabled.
         */
        if ( check_if_cookies_are_enabled() ) {
            look_for_ad_block();
        }



        /*
         * Initialize ad handling as soon as Googletag service is loaded.
         */
        init_when_ready();



        /*
         * Check at every scroll if new ad units need to be loaded.
         */
        $( window ).scroll( function() {
            if ( window.googletag && googletag.apiReady ) {
                maybe_create_ad_units( "scroll-trigger" );
            }
        });



        /*
         * Prepare new ad unit containers on new page load via infinite scroll.
         */
        $( window ).on( "com2014_infscr_new_page_load", function() {
            add_containers_to_list();
            setTimeout( function() {
                maybe_create_ad_units( "timeout-trigger" );
            }, 2500 );
        });



        /*
         * Remove ad unit container IDs from list
         * on page removal via infinite scroll.
         */
        $( window ).on( "com2014_infscr_page_removed", function() {
            remove_containers_from_list();
        });



        /*
         * Remove the AdBlock notification when
         * the dismiss button is pressed.
         */
        $( "body" ).on( "click", ".adblock-notification .js-dismiss", function() {
            // Set the cookie to avoid displaying the notification for 24 hours.
            set_ad_block_notification_cookie();
            // Now remove the notification box.
            $( ".adblock-notification-wrapper" ).remove();
        });



        /* 
         * Register an event for reloading ad units on screen resize.
         */
        $( window ).resize( function() {
            // Fetch the current screen width.
            screen_width = $( window ).width();
            /* Only trigger reload of the ad units if window size
             * fits into different screen mapping. */
            var new_mapping = fetch_current_mapping();
            if ( new_mapping != current_mapping ) {
                // Store the new mapping width.
                current_mapping = new_mapping;

                /*
                 * Trigger the refresh of the ad units.
                 * At page load: ensure Googletag service is ready
                 * prior to loading the first round of ads.
                 */
                if ( window.googletag && googletag.apiReady ) {
                    googletag.pubads().refresh();
                } else {
                    // Delay the ads refresh to a later time, when the Googletag service is ready.
                    setTimeout( function() {
                        // Try to refresh the ad units once more.
                        if ( window.googletag && googletag.apiReady ) {
                            googletag.pubads().refresh();
                        }
                    }, 1000 );
                }
            }
        });
    });
})( jQuery );



/*
 * BlockAdBlock 3.2.0
 * Copyright (c) 2015 Valentin Allaire <valentin.allaire@sitexw.fr>
 * Released under the MIT license
 * https://github.com/sitexw/BlockAdBlock
 */
!function(t){var e=function(e){this._options={checkOnLoad:!1,resetOnEnd:!1,loopCheckTime:50,loopMaxNumber:5,baitClass:"pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links",baitStyle:"width:1px !important;height:1px !important;position:absolute !important;left:-10000px !important;top:-1000px !important"},this._var={version:"3.2.0",bait:null,checking:!1,loop:null,loopNumber:0,event:{detected:[],notDetected:[]}},void 0!==e&&this.setOption(e);var i=this,o=function(){setTimeout(function(){i._options.checkOnLoad===!0&&(null===i._var.bait&&i._creatBait(),setTimeout(function(){i.check()},1))},1)};void 0!==t.addEventListener?t.addEventListener("load",o,!1):t.attachEvent("onload",o)};e.prototype._options=null,e.prototype._var=null,e.prototype._bait=null,e.prototype.setOption=function(t,e){if(void 0!==e){var i=t;t={},t[i]=e}for(var o in t)this._options[o]=t[o];return this},e.prototype._creatBait=function(){var e=document.createElement("div");e.setAttribute("class",this._options.baitClass),e.setAttribute("style",this._options.baitStyle),this._var.bait=t.document.body.appendChild(e),this._var.bait.offsetParent,this._var.bait.offsetHeight,this._var.bait.offsetLeft,this._var.bait.offsetTop,this._var.bait.offsetWidth,this._var.bait.clientHeight,this._var.bait.clientWidth},e.prototype._destroyBait=function(){t.document.body.removeChild(this._var.bait),this._var.bait=null},e.prototype.check=function(t){if(void 0===t&&(t=!0),this._var.checking===!0)return!1;this._var.checking=!0,null===this._var.bait&&this._creatBait();var e=this;return this._var.loopNumber=0,t===!0&&(this._var.loop=setInterval(function(){e._checkBait(t)},this._options.loopCheckTime)),setTimeout(function(){e._checkBait(t)},1),!0},e.prototype._checkBait=function(e){var i=!1;if(null===this._var.bait&&this._creatBait(),(null!==t.document.body.getAttribute("abp")||null===this._var.bait.offsetParent||0==this._var.bait.offsetHeight||0==this._var.bait.offsetLeft||0==this._var.bait.offsetTop||0==this._var.bait.offsetWidth||0==this._var.bait.clientHeight||0==this._var.bait.clientWidth)&&(i=!0),void 0!==t.getComputedStyle){var o=t.getComputedStyle(this._var.bait,null);("none"==o.getPropertyValue("display")||"hidden"==o.getPropertyValue("visibility"))&&(i=!0)}e===!0&&(this._var.loopNumber++,this._var.loopNumber>=this._options.loopMaxNumber&&this._stopLoop()),i===!0?(this._stopLoop(),this._destroyBait(),this.emitEvent(!0),e===!0&&(this._var.checking=!1)):(null===this._var.loop||e===!1)&&(this._destroyBait(),this.emitEvent(!1),e===!0&&(this._var.checking=!1))},e.prototype._stopLoop=function(){clearInterval(this._var.loop),this._var.loop=null,this._var.loopNumber=0},e.prototype.emitEvent=function(t){var e=this._var.event[t===!0?"detected":"notDetected"];for(var i in e)e.hasOwnProperty(i)&&e[i]();return this._options.resetOnEnd===!0&&this.clearEvent(),this},e.prototype.clearEvent=function(){this._var.event.detected=[],this._var.event.notDetected=[]},e.prototype.on=function(t,e){return this._var.event[t===!0?"detected":"notDetected"].push(e),this},e.prototype.onDetected=function(t){return this.on(!0,t)},e.prototype.onNotDetected=function(t){return this.on(!1,t)},t.BlockAdBlock=e,void 0===t.blockAdBlock&&(t.blockAdBlock=new e({checkOnLoad:!0,resetOnEnd:!0}))}(window);