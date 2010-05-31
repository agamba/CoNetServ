/**
 * before implemented, set values for testing
 */
var conetserv = {
 ping : 1,
 ping6 : 0,
 tracert : 1,
 tracert6 : 0,
 whois: 1,
 nslookup : 1,

 ping_test: 1,
 ping6_test : 0,
 tracert_test : 1,
 tracert6_test : 0,
 whois_test : 1,
 nslookup_test : 0
};

/**
 * Object for handling CoNetServ ui
 */
var Ui = {
   /**
    * Inicializes UI object ( sets tabs, buttons, ... )
    */
   inicialize : function() {
      /* inicialize tabs */
      $("#tabs").tabs();

      /* create radios for virtual tabs */
      $("#local-services-form").buttonset();
      $("#external-services-form").buttonset();
      $("#local-info-form").buttonset();
      $("#external-info-form").buttonset();
   },


   /**
   * removes any DOM children in div and instead writes error message by jquery
   * @param div Which divs in DOM should the error should be set to.
   * @param msg Error message.
   */
   divError : function(div, msg) {
      $(div).empty();
      $(div).append(
         '<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;"> \
         <p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span> \
         <strong>Alert:</strong> ' + msg + '</p></div>');
   },

   /**
    * checks availability of services and stuff for current system
    */
   checkAvailability : function() {
      var err;
      /*
       * check for plugin - if not available, disable all dependend parts of
       * CoNetServ
       */
      if(!conetserv) {
         divError("#local-services", "CoNetServ plugin for your browser has not \\n\
            been correctly loaded. Please, refer to readme for further steps.")
      }
      else {
         /*
          * check local services availability
          * first check for general availability in system - if not, don even display
          */
         if(!conetserv.ping) {
            $(".local .ping").remove();
         }

         if(!conetserv.ping6) {
            $(".local .ping6").remove();
         }

         if(!conetserv.tracert) {
            $(".local .tracert").remove();
         }

         if(!conetserv.tracert6) {
            $(".local .tracert6").remove();
         }

         if(!conetserv.whois) {
            $(".local .whois").remove();
         }

         if(!conetserv.nslookup) {
            $(".local .nslookup").remove();
         }

         // now check for installed state and if not, show message about installation
         if(!conetserv.ping_test) {
            this.divError("#local-ping-div", "Ping service has not been found in your system. \n\
If you want to install it, please follow these steps.");
         }

         if(!conetserv.ping6_test) {
            this.divError("#local-ping6-div", "Ping IPv6 service has not been found in your system. \n\
If you want to install it, please follow these steps.");
         }

         if(!conetserv.tracert_test) {
            this.divError("#local-tracert-div", "Traceroute service has not been found in your system. \n\
If you want to install it, please follow these steps.");
         }

         if(!conetserv.tracert6_test) {
            this.divError("#local-tracert6-div", "Traceroute IPv6 service has not been found in your system. \n\
If you want to install it, please follow these steps.");
         }

         if(!conetserv.whois_test) {
            this.divError("#local-whois-div", "Whois service has not been found in your system. \n\
If you want to install it, please follow these steps.");
         }

         if(!conetserv.nslookup_test) {
            this.divError("#local-nslookup-div", "NSlookup service has not been found in your system. \n\
If you want to install it, please follow these steps.");
         }

         //refresh visibility of buttons
         $("#local-services-form").buttonset("refresh");
      }

   },

  
  /**
   * Redraws page containing radio buttons used as tabs
   */
  redraw : function() {
    var $tabs = $('#tabs').tabs();
    var selected = $tabs.tabs('option', 'selected');
    var container;

    //TODO rewrite to better way
    switch(selected) {
      case 0:
        container = '#local-services';
        break;
      case 1:
        container = '#external-services';
        break;
      case 2:
        container = '#local-info';
        break;
      case 3:
        container = '#external-info';
        break;
    }
    var active = $(container + " input:radio:checked").val();
    $(container + " .content").css('display', 'none');
    $("#" + active).css('display', 'block');
  }
}

$(function() {
   Ui.inicialize();

   /**
   * reimplement behaviour while different tab is selected
   */
   $('#tabs').tabs({
      show: function(event, ui) {
         Ui.redraw();
         return true;
      }
   });

   $("input[name=local-services-form]").change(function(){
      Ui.redraw();
   });

   
});

/**
* on document.ready
*/
$(document).ready(function(){
   Ui.checkAvailability();
   Ui.redraw();

   Plot.inicialize();
   Plot.plotPing('64 bytes from 66.230.220.41: icmp_seq=1 ttl=45 time=182 ms\
64 bytes from 66.230.220.41: icmp_seq=2 ttl=45 time=181 ms\
64 bytes from 66.230.220.41: icmp_seq=3 ttl=45 time=181 ms\
64 bytes from 66.230.220.41: icmp_seq=4 ttl=45 time=188 ms', 4);



});