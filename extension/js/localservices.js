/* Check CoNetServ object */
if(!Conetserv) var Conetserv = {};

/* LocalServices object */
Conetserv.LocalServices = {
   enabled: true,
   running: 0,
   /**
   * Start all commands available at once.
   */
   startCommands: function() {
      if(!this.enabled || this.running)
         return false;
      /*
       * Set URL value or show red bar around url field
       */
      if(!Conetserv.Url.set(document.getElementById("local-url").value)) {
         document.getElementById("local-url").style.color="red";
         document.getElementById("local-url").focus();
         return false;
      }

      /*
       * change button icon and text
       */
      Conetserv.Ui.startToStop("#local-url-start");

      /*
       * disable input
       */
      Conetserv.Ui.disableInput("#local-url");

      this.start(this.Ping);
      this.start(this.Ping6);
      this.start(this.Traceroute);
      this.start(this.Traceroute6);
      this.start(this.NslookupUp);
      this.start(this.NslookupDown);
      this.start(this.Whois);
      this.start(this.Nmap);
      this.start(this.Dig);

      return true;
   },

   stopCommands: function() {
      if(!this.enabled)
         return;

      /*
       * change button icon and text
       */
      Conetserv.Ui.stopToStart("#local-url-start");

      /*
       * enable input
       */
      Conetserv.Ui.enableInput("#local-url");

      this.stop(this.Ping);
      this.stop(this.Ping6);
      this.stop(this.Traceroute);
      this.stop(this.Traceroute6);
      this.stop(this.NslookupUp);
      this.stop(this.NslookupDown);
      this.stop(this.Whois);
      this.stop(this.Nmap);
      this.stop(this.Dig);

      this.running = 0;
   },

   start: function(service) {
      if (service.enabled && service.interval == -1) {
         Conetserv.LocalServices.running++;

         service.before_begin();

         service.finished = false;
         try {
            service.console.clear();

            service.console.inputTimerErr(service.object + ".console", 3, "<strong>Service has not returned any output yet.</strong> ");

            // Create function from service details and evaluate it
            if (eval("service.process = Conetserv.plugin." + service.identifier + ".start(" + service.argument + ")")) {
               service.interval = window.setInterval(this.read, 500, service);
               Conetserv.Ui.addIcons(".local", service.class, this.stop, service, 'ui-icon-close');
               this.read(service);
            } else {
               service.interval = -1;
            }
         } catch(e) {
            service.console.setErr(e);
            service.interval = -1;
         }
      }
   },

   /* this != Conetserv.LocalServices in context from window.setInterval */
   read: function(service) {
      var received;
      try {
         received = service.process.read();
      } catch(e) {
         service.console.setErr(e);
      }

      if (typeof(received) == 'string') {
         service.console.add(received);
         service.after_read(received);
      } else {
         if (!service.process.running) {
            if(service.console.rowCount <= 2) {
               var err = service.console.code;
               service.console.clear();
               service.console.setErr("<strong>Service has most probably encountered an error with following output: </strong> <br/></br>"
                  + err);
            }
            service.finished = true;
            Conetserv.LocalServices.stop(service);
         }
      }
   },

   stop: function(service) {

      if (service.enabled && service.interval != -1) {
         
         try {
            delete service.process;
         }
         catch(e) {
            service.console.setErr(e);
         }
         
         Conetserv.Ui.removeIcons(".local", service.class);

         service.console.touched = true;
         /* if service has been stopped manually, set error to console */
         if(!service.finished) {
            service.console.setErr("<strong>Service has been terminated before its finish.</strong>");
         }

         window.clearInterval(service.interval);
         service.interval = -1;
         if(--Conetserv.LocalServices.running == 0)
         {
            Conetserv.Ui.stopToStart("#local-url-start");
            Conetserv.Ui.enableInput("#local-url");
         }
      }
   },

   initialize: function() {
      if(!this.enabled)
         return;
      
      /* console text-boxes */
      this.Ping.console = new Conetserv.Console("local-ping-console");
      if(!Conetserv.Options.LocalServices.ping_console_unlimited())
         this.Ping.console.maxRows = 15;
      this.Ping6.console = new Conetserv.Console("local-ping6-console");
      if(!Conetserv.Options.LocalServices.ping_console_unlimited())
         this.Ping6.console.maxRows = 15;
      this.Traceroute.console = new Conetserv.Console("local-tracert-console");
      this.Traceroute6.console = new Conetserv.Console("local-tracert6-console");
      this.NslookupUp.console = new Conetserv.Console("local-nslookup-console-up");
      this.NslookupDown.console = new Conetserv.Console("local-nslookup-console-down");
      this.Whois.console = new Conetserv.Console("local-whois-console");
      this.Nmap.console = new Conetserv.Console("local-nmap-console");
      this.Dig.console = new Conetserv.Console("local-dig-console");
   }
}

Conetserv.LocalServices.Ping = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                            //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                          //text console
   process: false,                          //running process to read data from
   class: '.ping',                          //class for icons
   object: 'Conetserv.LocalServices.Ping',  //object name
   identifier: 'ping',                      //name for calling npapi functions
   argument:'Conetserv.Url.hostname',       //argument to be passed to npapi functions

   before_begin: function() {               //extra commands to be executed before service is started
      Conetserv.Plot.localPingData.reset();

      /* set service parameters */
      Conetserv.plugin.ping.count = Conetserv.Options.LocalServices.ping_packet_count() ?
         Conetserv.Options.LocalServices.ping_packet_count() : 0;
      Conetserv.plugin.ping.timeout = Conetserv.Options.LocalServices.ping_timeout() ?
         Conetserv.Options.LocalServices.ping_timeout() : 0;
      Conetserv.plugin.ping.ttl = Conetserv.Options.LocalServices.ping_ttl() ?
         Conetserv.Options.LocalServices.ping_ttl() : 0;
      Conetserv.plugin.ping.packetsize = Conetserv.Options.LocalServices.ping_packet_size() ?
         Conetserv.Options.LocalServices.ping_packet_size() : 0;
   
   },

   after_read: function(received) {         //extra commands to be done in the end of read function
      Conetserv.Plot.plotPing(received, 4);
   }
}

Conetserv.LocalServices.Ping6 = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                            //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                          //text console
   process: false,                          //running process to read data from
   class: '.ping6',                         //class for icons
   object: 'Conetserv.LocalServices.Ping6', //object name
   identifier: 'ping6',                     //name for calling npapi functions
   argument:'Conetserv.Url.hostname',       //parameter to be passed to npapi functions

   before_begin: function() {               //extra commands to be executed before service is started
      Conetserv.Plot.localPing6Data.reset();
   },

   after_read: function(received) {
      Conetserv.Plot.plotPing(received, 6);
   }
}

Conetserv.LocalServices.Traceroute = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                            //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                          //text console
   process: false,                          //running process to read data from
   class: '.tracert',                       //class for icons
   object: 'Conetserv.LocalServices.Traceroute', //object name
   identifier: 'traceroute',                //name for calling npapi functions
   argument:'Conetserv.Url.hostname',       //parameter to be passed to npapi functions

   before_begin: function() {               //extra commands to be executed before service is started
      Conetserv.Plot.localTraceData.reset();

      /* set service parameters */
      Conetserv.plugin.tracert.maxhops = Conetserv.Options.LocalServices.tracert_max_hops() ?
         Conetserv.Options.LocalServices.tracert_max_hops() : 0;
      Conetserv.plugin.tracert.waittime = Conetserv.Options.LocalServices.tracert_wait_time() ?
         Conetserv.Options.LocalServices.tracert_wait_time() : 0;
      Conetserv.plugin.tracert.iptohostname = Conetserv.Options.LocalServices.tracert_ip_to_hostname();
         
   },

   after_read: function(received) {
      Conetserv.Plot.plotTracert(received, 4);
   }
}

Conetserv.LocalServices.Traceroute6 = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                            //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                          //text console
   process: false,                          //running process to read data from
   class: '.tracert6',                      //class for icons
   object: 'Conetserv.LocalServices.Traceroute6', //object name
   identifier: 'traceroute6',               //name for calling npapi functions
   argument:'Conetserv.Url.hostname',       //parameter to be passed to npapi functions

   before_begin: function() {               //extra commands to be executed before service is started
      Conetserv.Plot.localTrace6Data.reset();
   },

   after_read: function(received) {
      Conetserv.Plot.plotTracert(received, 6);
   }
}

Conetserv.LocalServices.NslookupUp = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                           //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                         //text console
   process: false,                         //running process to read data from
   class: '.nslookup',                     //class for icons
   object: 'Conetserv.LocalServices.NslookupUp', //object name
   identifier: 'nslookup',                 //name for calling npapi functions
   argument: 'Conetserv.Url.hostname',     //parameters to be passed to npapi functions

   before_begin: function() {              //extra commands to be executed before service is started
      Conetserv.plugin.nslookup.query = 0;
   },

   after_read: function(received) {
   }
}

Conetserv.LocalServices.NslookupDown = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                           //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                         //text console
   process: false,                         //running process to read data from
   class: '.nslookup',                     //class for icons
   object: 'Conetserv.LocalServices.NslookupDown', //object name
   identifier: 'nslookup',                 //name for calling npapi functions
   argument: 'Conetserv.Url.hostname',     //parameters to be passed to npapi functions

   before_begin: function() {              //extra commands to be executed before service is started
      Conetserv.plugin.nslookup.query = 1;
   },

   after_read: function(received) {
   }
}

Conetserv.LocalServices.Whois = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                           //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                         //text console
   process: false,                         //running process to read data from
   class: '.whois',                        //class for icons
   object: 'Conetserv.LocalServices.Whois', //object name
   identifier: 'whois',                 //name for calling npapi functions
   argument:'Conetserv.Url.domain',        //parameter to be passed to npapi functions

   before_begin: function() {              //extra commands to be executed before service is started
   },

   after_read: function(received) {
      Conetserv.Plot.plotTracert(received, 4);
   }
}

Conetserv.LocalServices.Nmap = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                           //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                         //text console
   process: false,                         //running process to read data from
   class: '.nmap',                        //class for icons
   object: 'Conetserv.LocalServices.Nmap', //object name
   identifier: 'nmap',                 //name for calling npapi functions
   argument:'Conetserv.Url.hostname',        //parameter to be passed to npapi functions

   before_begin: function() {              //extra commands to be executed before service is started
      Conetserv.plugin.nslookup.query = 0;
   },

   after_read: function(received) {
   }
}

Conetserv.LocalServices.Dig = {
   enabled: true,                              //defines, if service will be started
   interval: -1,                           //reading loop interval
   finished: false,                         //saying, if service has finished its run
   console: false,                         //text console
   process: false,                         //running process to read data from
   class: '.dig',                        //class for icons
   object: 'Conetserv.LocalServices.Dig', //object name
   identifier: 'dig',                 //name for calling npapi functions
   argument:'Conetserv.Url.hostname',        //parameter to be passed to npapi functions

   before_begin: function() {              //extra commands to be executed before service is started
   },

   after_read: function(received) {
   }
}
