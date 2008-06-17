/**
 * iBox version 2
 * For more info & download: http://gamma.ibegin.com/ibox/
 * Created as a part of the iBegin Gamma Project - http://gamma.ibegin.com/
 * For licensing please see readme.html (MIT Open Source License)
*/

var iBox = function()
{
  var _pub = {
    // label for the close link
    close_label: 'Close',

    // padding around the box
    padding: 100,

    // how fast to fade in the overlay/ibox (this is each step in ms)
    fade_in_speed: 0,

    // our attribute identifier for our iBox elements
    attribute_name: 'rel',
    
    // tags to hide when we show our box
    tags_to_hide: ['select', 'embed', 'object'],

    // default width of the box (when displaying html only)
    // height is calculated automatically
    default_width: 450,

    // browser checks
    is_opera: navigator.userAgent.indexOf('Opera/9') != -1,
    is_ie: navigator.userAgent.indexOf("MSIE ") != -1,
    is_ie6: false /*@cc_on || @_jscript_version < 5.7 @*/,
    is_firefox: navigator.appName == "Netscape" && navigator.userAgent.indexOf("Gecko") != -1 && navigator.userAgent.indexOf("Netscape") == -1,
    is_mac: navigator.userAgent.indexOf('Macintosh') != -1,
    
    encodeUTF8: function(s)
    {
      return unescape(encodeURIComponent(s));
    },

    decodeUTF8: function(s)
    {
      return decodeURIComponent(escape(s));
    },
    
    /**
     * binds arguments to a callback function
     */
    bind: function(fn)
    {
        var args = [];
        for (var n=1; n<arguments.length; n++) args.push(arguments[n]);
        return function(e) { return fn.apply(this, [e].concat(args)); };
    },

    /**
     * Sets the content of the ibox
     * @param {String} content HTML content
     * @param {Object} params
     */
    html: function(content, params)
    {
      if (content === undefined) return els.content;
      if (cancelled) return;
      _pub.clear();
      els.wrapper.style.display = "block";
      els.wrapper.style.visibility = "hidden";
      els.content.style.height = 'auto';

      if (typeof(content) == 'string') els.content.innerHTML = content;
      else els.content.appendChild(content);

      var elemSize = _pub.getElementSize(els.content);
      var pageSize = _pub.getPageSize();

      if (params.can_resize === undefined) params.can_resize = true;
      if (params.fade_in === undefined) params.use_fade = true;

      if (params.width) var width = parseInt(params.width);
      else var width = _pub.default_width;

      if (params.height) var height = parseInt(params.height);
      else var height = elemSize.height;

      els.wrapper.style.width = width + 'px';
      els.wrapper.style.height = height + 'px';

      // if we dont do this twice we get a bug on the first display
      if (!params.height)
      {
        var elemSize = _pub.getElementSize(els.content);
        var height = elemSize.height;
      }
      if (params.can_resize) _pub.resizeObjectToScreen(els.content, width, height, params.constrain);
      else
      {
        els.content.style.width = width + 'px';
        els.content.style.height = height + 'px';
      }

      // now we set the wrapper
      var elemSize = _pub.getElementSize(els.content);
      els.wrapper.style.width = elemSize.width + 'px';
      els.wrapper.style.height = elemSize.height + 'px';

      _pub.reposition();
      
      els.wrapper.style.visibility = "visible";
      _pub.fadeIn(els.wrapper, 10, params.fade_in ? _pub.fade_in_speed : 0);
    },
    
    /**
     * Empties the content of the iBox (also hides the loading indicator)
     */
    clear: function()
    {
      els.progress.style.display = "none";
      while (els.content.firstChild) els.content.removeChild(els.content.firstChild);
    },
    
    /**
     * Loads text into the ibox
     * @param {String} url
     * @param {String} title
     * @param {Object} params
     */
    show: function(text, title, params)
    {
      _pub.hide();
      showInit(url, title, params, function(){
        _pub.html(text, params);
      });
    },
    /**
     * Loads a url into the ibox
     * @param {String} url
     * @param {String} title
     * @param {Object} params
     */
    showURL: function(url, title, params)
    {
      showInit(url, title, params, function(){
        cancelled = false;
        for (var i=0; i<_pub.plugins.list.length; i++)
        {
          var plugin = _pub.plugins.list[i];
          if (plugin.match(url))
          {
            active_plugin = plugin;
            plugin.render(url, params);
            break;
          }
        }
      });
    },

    /**
     * Hides the iBox
     */
    hide: function()
    {
      if (active_plugin)
      {
        // call the plugins unload method
        if (active_plugin.unload) active_plugin.unload();
        active_plugin = null;
      }
      window.onscroll = null;
      _pub.clear();
      // restore elements that were hidden
      for (var i=0; i<_pub.tags_to_hide.length; i++) showTags(_pub.tags_to_hide[i]);

      els.progress.style.display = 'none';
      els.overlay.style.display = 'none';
      els.wrapper.style.display = 'none';
    },

    /**
     * Resizes an object to fit on screen
     * @param {Object} obj
     * @param {Integer} width
     * @param {Integer} height
     * @param {Boolean} constrain
     */
    resizeObjectToScreen: function(obj, width, height, constrain)
    {

      var pagesize = _pub.getPageSize();

      var x = pagesize.width - _pub.padding;
      var y = pagesize.height - _pub.padding;
      
      if (!height) var height = obj.height;
      if (!width) var width = obj.width;
      if (width > x)
      {
        if (constrain) height = height * (x/width);
        width = x;
      }
      if (height > y)
      {
        if (constrain) width = width * (y/height);
        height = y;
      }
      obj.style.width = width + 'px';
      obj.style.height = height + 'px';
    },

    /**
     * Repositions the iBox wrapper (from events)
     */
    reposition: function(e)
    {
      // verify height doesnt overreach browser's viewpane
      _pub.center(els.progress);
      _pub.center(els.wrapper);
      var pageSize = _pub.getPageSize();
      var scrollPos = _pub.getScrollPos();
      
      if (_pub.is_ie6) els.overlay.style.width = document.documentElement.clientWidth + 'px';
      var height = Math.max(document.documentElement.clientHeight, document.body.clientHeight);
      els.overlay.style.height = height + 'px';
    },

    /**
     * Centers an object
     * @param {Object} obj
     */
    center: function(obj)
    {
      var pageSize = _pub.getPageSize();
      var scrollPos = _pub.getScrollPos();
      var emSize = _pub.getElementSize(obj);
      var x = Math.round((pageSize.width - emSize.width) / 2 + scrollPos.scrollX);
      var y = Math.round((pageSize.height - emSize.height) / 2 + scrollPos.scrollY);
      obj.style.left = x + 'px';
      obj.style.top = y + 'px';
    },
    
    getStyle: function(obj, styleProp)
    {
      if (obj.currentStyle)
        return obj.currentStyle[styleProp];
      else if (window.getComputedStyle)
        return document.defaultView.getComputedStyle(obj,null).getPropertyValue(styleProp);
    },

    /**
     * Gets the scroll positions
     */
    getScrollPos: function()
    {
      var docElem = document.documentElement;
      return {
        scrollX: document.body.scrollLeft || window.pageXOffset || (docElem && docElem.scrollLeft),
        scrollY: document.body.scrollTop || window.pageYOffset || (docElem && docElem.scrollTop)
      };
    },

    /**
     * Gets the page constraints
     */
    getPageSize: function()
    {
      return {
        width: window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || document.body.clientWidth,
        height: window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight
      };
    },

    /**
     * Gets an objects offsets
     * @param {Object} obj
     */
    getElementSize: function(obj)
    {
      return {
        width: obj.offsetWidth || obj.style.pixelWidth,
        height: obj.offsetHeight || obj.style.pixelHeight
      };
    },

    fadeIn: function(obj, level, speed, callback)
    {
      if (level === undefined) var level = 100;
      if (speed === undefined) var speed = 70;
      if (!speed)
      {
        _pub.setOpacity(null, obj, level*10);
        if (callback) callback();
        return;
      }
    
      _pub.setOpacity(null, obj, 0);
      for (var i=0; i<=level; i++)
      {
        setTimeout(_pub.bind(_pub.setOpacity, obj, i*10), speed*i);
      }
      if (callback) setTimeout(callback, speed*(i+1));
    },

    /**
     * Sets the opacity of an element
     * @param {Object} obj
     * @param {Integer} value
     */
    setOpacity: function(e, obj, value)
    {
      obj.style.opacity = value/100;
      obj.style.filter = 'alpha(opacity=' + value + ')';
    },
    
    /**
     * Creates a new XMLHttpRequest object based on browser
     */
    createXMLHttpRequest: function()
    {
      var http;
      if (window.XMLHttpRequest)
      { // Mozilla, Safari,...
        http = new XMLHttpRequest();
        if (http.overrideMimeType)
        {
          // set type accordingly to anticipated content type
          http.overrideMimeType('text/html');
        }
      }
      else if (window.ActiveXObject)
      { // IE
        try {
          http = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
          try {
            http = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (e) {}
        }
      }
      if (!http)
      {
        alert('Cannot create XMLHTTP instance');
        return false;
      }
      return http;
    },
    
    addEvent: function(obj, evType, fn)
    {
      if (obj.addEventListener)
      {
        obj.addEventListener(evType, fn, false);
        return true;
      }
      else if (obj.attachEvent)
      {
        var r = obj.attachEvent("on"+evType, fn);
        return r;
      }
      else
      {
        return false;
      }
    },
    
    plugins: {
      list: new Array(),
      register: function(func, last)
      {
        if (!last)
        {
          _pub.plugins.list = _pub.plugins.list.concat([func],_pub.plugins.list);
        }
        else
        {
          _pub.plugins.list.push(func);
        }
      }
    }
  };
  
  // private methods and variables
  var cancelled = false;
  var active_plugin = null;

  // some containers
  // we store these in memory instead of finding them each time
  var els = {
    wrapper: null,
    footer: null,
    content: null,
    overlay: null,
    progress: null
  };
  
  /**
   * Parses the arguments in the rel attribute
   * @param {String} query
   */
  var parseQuery = function(query)
  {
     var params = new Object();
     if (!query) return params; 
     var pairs = query.split(/[;&]/);
     for (var i=0; i<pairs.length; i++)
     {
        var keyval = pairs[i].split('=');
        if (!keyval || keyval.length != 2) continue;
        var key = unescape(keyval[0]);
        var val = unescape(keyval[1]);
        val = val.replace(/\+/g, ' ');
        params[key] = val;
     }
     return params;
  };


  /**
   * Creates the iBox container and appends it to an element
   * @param {Object} elem Container to attach to
   * @return {Object} iBox element
   */
  var create = function(elem)
  {
    // TODO: why isnt this using DOM tools
    // a trick on just creating an ibox wrapper then doing an innerHTML on our root ibox element
    var container = document.createElement('div');
    container.id = 'ibox';
    container.style.display = 'block';

    els.overlay = document.createElement('div');
    els.overlay.style.display = 'none';
    els.overlay.id = 'ibox_overlay';
    els.overlay.onclick = _pub.hide;
    container.appendChild(els.overlay);

    els.progress = document.createElement('div');
    els.progress.id = 'ibox_progress';
    els.progress.style.display = 'none';
    els.progress.onclick = function() {
      _pub.hide();
      cancelled = true;
    }
    container.appendChild(els.progress);

    els.wrapper = document.createElement('div')
    els.wrapper.id = 'ibox_wrapper';
    els.wrapper.style.display = 'none';

    els.content = document.createElement('div');
    els.content.id = 'ibox_content';
    els.wrapper.appendChild(els.content);
  
    var child = document.createElement('div');
    child.id = 'ibox_footer_wrapper';
  
    var child2 = document.createElement('a');
    child2.innerHTML = _pub.close_label;
    child2.href = 'javascript:void(0)';
    child2.onclick = _pub.hide;
    child.appendChild(child2);
  
    els.footer = document.createElement('div');
    els.footer.id = 'ibox_footer';
    els.footer.innerHTML = '&nbsp;';
    child.appendChild(els.footer);
    els.wrapper.appendChild(child);

    container.appendChild(els.wrapper);

    elem.appendChild(container);
    return container;
  };
  
  var hideTags = function(tag)
  {
    var list = document.getElementsByTagName(tag);
    for (var i=0; i<list.length; i++)
    {
      if (_pub.getStyle(list[i], 'visibility') != 'hidden' && list[i].style.display != 'none')
      {
        list[i].style.visibility = 'hidden';
        list[i].wasHidden = true;
      }
    }
  };
  
  var showTags = function(tag)
  {
    var list = document.getElementsByTagName(tag);
    for (var i=0; i<list.length; i++)
    {
      if (list[i].wasHidden)
      {
        list[i].style.visibility = 'visible';
        list[i].wasHidden = null;
      }
    }
  };
  
  var showInit = function(url, title, params, callback)
  {
    els.progress.style.display = "block";
    _pub.center(els.progress);
    
    _pub.reposition();
    if (!_pub.is_firefox) var amount = 8;
    else var amount = 10;
    for (var i=0; i<_pub.tags_to_hide.length; i++) hideTags(_pub.tags_to_hide[i]);

    window.onscroll = _pub.reposition;

    // set title here
    els.footer.innerHTML = title || "&nbsp;";

    els.overlay.style.display = "block";
    
    _pub.fadeIn(els.overlay, amount, _pub.fade_in_speed, callback);
  };

  var initialize = function()
  {
    // elements here start the look up from the start non <a> tags
    var els = document.getElementsByTagName("a");
    var func = function(e)
    {
      var t = this.getAttribute(_pub.attribute_name);
      var params = parseQuery(t.substr(5,999));
      var url = this.target || this.href;
      var title = this.title;
      _pub.showURL(url, title, params);
      //TODO: fix e so its defined?
      //e.preventDefault();
      return false;
    };
    for (var i=0; i<els.length; i++)
    {
      if (els[i].getAttribute(_pub.attribute_name))
      {
        var t = els[i].getAttribute(_pub.attribute_name);
        if ((t.indexOf("ibox") != -1) || t.toLowerCase() == "ibox")
        { // check if this element is an iBox element
          els[i].onclick = func;
        }
      }
    }
    create(document.body);
    _pub.http = _pub.createXMLHttpRequest();
  };

  _pub.addEvent(window, 'keypress', function(e){ if (e.keyCode == (window.event ? 27 : e.DOM_VK_ESCAPE)) { iBox.hide(); }});
  _pub.addEvent(window, 'resize', _pub.reposition);
  _pub.addEvent(window, 'load', initialize);

  // DEFAULT PLUGINS

  /**
   * Handles embedded containers in the page based on url of #container.
   * This _ONLY_ works with hidden containers.
   */
  var iBoxPlugin_Container = function()
  {
    var original_wrapper = null;
    return {
      /**
       * Matches the url and returns true if it fits this plugin.
       */
      match: function(url)
      {
        return url.indexOf('#') != -1;
      },
      /**
       * Called when this plugin is unloaded.
       */
      unload: function()
      {
        var elemSrc = _pub.html().firstChild;
        elemSrc.style.display = 'none';
        original_wrapper.appendChild(elemSrc);
      },
      /**
       * Handles the output
       * @param {iBox} ibox
       * @param {String} url
       * @return {iBoxContent} an instance or subclass of iBoxContent
       */
      render: function(url, params)
      {
        var elemSrcId = url.substr(url.indexOf("#") + 1);
        var elemSrc = document.getElementById(elemSrcId);
        // If the element doesnt exist, break the switch
        if (!elemSrc)
        {
          _pub.html('There was an error loading the document.', params);
        }
        else
        {
          original_wrapper = elemSrc.parentNode;
          elemSrc.style.display = 'block';
          _pub.html(elemSrc, params);
        }
      }
    }
  }();
  _pub.plugins.register(iBoxPlugin_Container, true);

  /**
   * Handles images
   */
  var iBoxPlugin_Image = function()
  {
    // Image types (for auto detection of image display)
    var image_types = /\.jpg|\.jpeg|\.png|\.gif/gi;

    return {
      match: function(url)
      {
        return url.match(image_types);
      },

      render: function(url, params)
      {  
        var img = document.createElement('img');
        img.onclick = _pub.hide;
        img.className = 'ibox_image'
        img.style.cursor = 'pointer';
        img.onload = function()
        {
          _pub.html(img, {height: img.height, width: img.width, constrain: true})
        }
        img.onerror = function()
        {
          _pub.html('There was an error loading the document.', params);
        }
        img.src = url;
      }
    }
  }();
  _pub.plugins.register(iBoxPlugin_Image);

  var iBoxPlugin_YouTube = function()
  {
    var youtube_url = /(?:http:\/\/)?(?:www\d*\.)?(youtube\.(?:[a-z]+))\/(?:v\/|(?:watch(?:\.php)?)?\?(?:.+&)?v=)([^&]+).*/;
    return {
      match: function(url)
      {
        return url.match(youtube_url);
      },

      render: function(url, params)
      {
        var _match = url.match(youtube_url);
        var domain = _match[1];
        var id = _match[2];
        params.width = 425;
        params.height = 355;
        params.can_resize = false;
        var html = '<div><object width="425" height="355"><param name="movie" value="http://www.' + domain + '/v/' + id + '"/><param name="wmode" value="transparent"/><embed src="http://www.' + domain + '/v/' + id + '" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355"></embed></object></div>';
        _pub.html(html, params);
      }
    }
  }();
  _pub.plugins.register(iBoxPlugin_YouTube);

  var iBoxPlugin_Document = function()
  {
    return {
      match: function(url)
      {
        return true;
      },

      render: function(url, params)
      {
        _pub.http.open('get', url, true);

        _pub.http.onreadystatechange = function()
        {
          if (_pub.http.readyState == 4)
          {
            if (_pub.http.status == 200 || 1)
            {
              _pub.html(_pub.http.responseText, params);
            }
            else
            {
              _pub.html('There was an error loading the document.', params);
            }
          }
        }
        _pub.http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        _pub.http.send(null);
      }
    };
  }();
  _pub.plugins.register(iBoxPlugin_Document);

  return _pub;
}();