// (c) 2012 David Thevenin, ViniSketch pour JoshFire
// This code is based on VS toolkit code of vs.ui.List (c) 2012 David Thevenin

define(['vs', 'vs_util','vs_core', 'vs_ui', 'ted_x_participant_view'],
function (vs, util, core, ui, TedXParticipantView) {

  var TedXParticipantList = core.createClass ({
  
    parent: ui.View,
    
    properties: {
      'model': {
        /** 
         * Getter|Setter for data. Allow to get or change the vertical list
         * @name vs.ui.AbstractList#model 
         *
         * @type vs.core.Array
         */ 
        set : function (v)
        {
          if (!v) return;
          
          this._model = v;
          this.renderList ();
        }
      }
    },

    constructor : function (config) {
      this._scroller = config.iScroller;
      this._loader = config.loader;
      config.iScroller  = undefined;
      config.loader  = undefined;

      this._super (config);

      this.__item_obs = new Array ();
      this.__nb_items = 0;
      var self = this;

      if (window.deviceConfiguration.os === core.DeviceConfiguration.OS_ANDROID) {
        this._scroller.options.onScrollStart = function () {
  
          if (self.__page_update_timer)
          {
            clearTimeout (self.__page_update_timer);
            self.__page_update_timer = 0;
            return;
          }
  
          var page = self._getPreviousVisibleItems ();
           
          var di = page [0], l = page [1];
          while (l--) {
            var listItem = self.__item_obs [di + l];
            if (listItem && listItem.shouldBeVisible)
              listItem.shouldBeVisible (false);
          }
        };
    
        if (window.deviceConfiguration.os === core.DeviceConfiguration.OS_ANDROID)
        this._scroller.options.onScrollEnd = function (e, time) {
        
          if (!time) time = 800;
          if (self.__page_update_timer) clearTimeout (self.__page_update_timer);
          
          self.__page_update_timer = setTimeout (function () {
            var page = self._getVisibleItems ();
            self.__page_update_timer = 0;
        
            var di = page [0], l = page [1];
            while (l--) {
              var listItem = self.__item_obs [di + l];
              if (listItem && listItem.shouldBeVisible)
                listItem.shouldBeVisible (true);
            }
          }, time);
        }
      }
     },
  
    _getPreviousVisibleItems : function () {
      if (!this.__estimateIndex && !this.__estimateNbItemPerPage)
      {
        this.__estimateIndex = 0;
        this.__estimateNbItemPerPage = this.__nb_items;
      }
      
      return [this.__estimateIndex, this.__estimateNbItemPerPage];
    },
    
    _getVisibleItems : function () {
      var estimateItemHeight = this._scroller.scrollerH / this.__nb_items;
      
      this.__estimateIndex =
        Math.floor (-this._scroller.y/estimateItemHeight);
      this.__estimateNbItemPerPage =
        Math.ceil (this._scroller.wrapperH/estimateItemHeight) + 1;
      
      this.__estimateIndex -= 1;
      if (this.__estimateIndex < 0) this.__estimateIndex = 0;
      
      this.__estimateNbItemPerPage += 2;
      if (this.__estimateNbItemPerPage + this.__estimateIndex > this.__nb_items)
        this.__estimateNbItemPerPage = this.__nb_items - this.__estimateIndex;
        
      // bad value arrive when iscroll refresh or html reflow are not finished
      if (isNaN (this.__estimateIndex) ||
          isNaN (this.__estimateNbItemPerPage)  ||
          !isFinite (this.__estimateIndex)  ||
          !isFinite (this.__estimateNbItemPerPage) ||
          this.__estimateNbItemPerPage < 0) {

        this.__estimateIndex = 0;
        this.__estimateNbItemPerPage = this.__nb_items;
      }
      
      return [this.__estimateIndex, this.__estimateNbItemPerPage];
    },

    initComponent : function (event) {
      this._super (this);
      this._list_items = this.view.querySelector ('ul');
      this.init_directAccessBar ();
    },
    
    renderList : function ()
    {
      if (!this._model) { return; }
         
      var _direct_access = this._direct_access, index, letter;
        
      // remove all children
      this._freeListItems ();
      
      _direct_access.innerHTML = "";
          
      index = 0;
      var title_index = 0;
      for (var key in this._model)
      {
        index ++;
        var elem = document.createElement ('div');
        elem.innerHTML = key;
        elem._index_ = title_index++;
        _direct_access.appendChild (elem);
      }
      index = 0;
      
      _direct_access.style.opacity = 1;
      letter = Object.keys (this._model) [0];
      this._renderTab (letter);
    },
  
    /**
     * @private
     */
    _renderTab : function (letter, clb)
    {
      var _list_items = this._list_items, index = 0, item, data;
      if (!_list_items) { return; }
       
      this.view.removeChild (_list_items);
      this._direct_access_value.innerHTML = letter;
      _list_items.innerHTML = "";
   
      data = this._model [letter];
      // Re uses List Item object
      while (index < this.__item_obs.length && index < data.length)
      {
        item = data [index];
  
        listItem = this.__item_obs [index];
        listItem.link (item);
        listItem.index = index;
        if (window.deviceConfiguration.os === 
            core.DeviceConfiguration.OS_ANDROID) 
          listItem.shouldBeVisible (false);
    
        _list_items.appendChild (listItem.view);
        index ++;
      }

      // Create new List Item objects
      while (index < data.length)
      {
        item = data [index];
  
        listItem = new TedXParticipantView ().init ();
        listItem.link (item);
        listItem.index = index;
    
        _list_items.appendChild (listItem.view);
        this.__item_obs.push (listItem);
        listItem.__parent = this;
        index ++;
      }
      this.__nb_items = index;
  
      this.view.appendChild (_list_items);
  
      _list_items.style.width = 'auto';
      var self = this;
      self._scroller.stop ();
      setTimeout (function () { 
        self._scroller.refresh ();
        self._scroller._pos (0, 0);
      }, 100);
      if (window.deviceConfiguration.os === core.DeviceConfiguration.OS_ANDROID)
        this.__page_update_timer = setTimeout (function () {
          var page = self._getVisibleItems ();
          self.__page_update_timer = 0;
      
          var di = page [0], l = page [1];
          while (l--) {
            var listItem = self.__item_obs [di + l];
            if (listItem && listItem.shouldBeVisible)
              listItem.shouldBeVisible (true);
          }
          if (util.isFunction (clb)) clb ();
        }, 500);
        else if (util.isFunction (clb)) setTimeout (clb, 200);
    },

    /**
     * @protected
     * @function
     */
    _freeListItems : function ()
    {
      var i, obj;
      for (i = 0 ; i < this.__item_obs.length; i ++)
      {
        obj = this.__item_obs [i];
        obj.__parent = undefined;
        util.free (obj);
      }
      
      this.__item_obs = [];
      this.__nb_items = 0;
    },

 /**********************************************************************

  *********************************************************************/
    init_directAccessBar : function ()
    {
      this._direct_access = document.createElement ('div');
      this._direct_access.className = 'direct_access';
      var parent = document.getElementById ('viadeo_network');
      parent.appendChild (this._direct_access)

      this._direct_access_value = document.createElement ('div');
      this._direct_access_value.className = 'direct_access_value';
      parent.appendChild (this._direct_access_value)
      
      this._acces_index = 0;
      var _acces_index;
      
      var self = this;
      var bar_dim, bar_pos;
      
      var getIndex = function (y) {
        if (!bar_dim || !bar_pos) return 0;
        var dy = y - bar_pos.y;
        if (dy < 0) dy = 0;
        else if (dy > bar_dim.height) dy = bar_dim.height - 1;
        
        var nb_elem = self._direct_access.childElementCount;
        return Math.floor (dy * nb_elem / bar_dim.height);
      };
      
      var accessBarStart = function (e)
      {
        e.stopPropagation ();
        e.preventDefault ();
        
        self._scroller.stop ();
        
        document.addEventListener (core.POINTER_MOVE, accessBarMove, false);
        document.addEventListener (core.POINTER_END, accessBarEnd, false);

        bar_dim = util.getElementDimensions (self._direct_access);
        bar_pos = util.getElementAbsolutePosition (self._direct_access);
        bar_dim.height -= 10;

        self._direct_access_value.style.opacity = 1;

        if (e.touches) _acces_index = getIndex (e.touches[0].pageY);
        else _acces_index = getIndex (e.pageY);
        var letter = Object.keys (self._model) [_acces_index];
        
        self._direct_access_value.innerHTML = letter;
        
        var dy = _acces_index * bar_dim.height / 
          self._direct_access.childElementCount + 10;
        
        self._direct_access_value.style.webkitTransform = 'translate3d(0px,' + dy + 'px,0)';
        
        if (window.deviceConfiguration.os ===   
          core.DeviceConfiguration.OS_ANDROID)
        self._scroller.options.onScrollEnd ();
      };
      
      var accessBarMove = function (e)
      {
        e.stopPropagation ();
        e.preventDefault ();

        if (e.touches) _acces_index = getIndex (e.touches[0].pageY);
        else _acces_index = getIndex (e.pageY);
        var letter = Object.keys (self._model) [_acces_index];
        
        self._direct_access_value.innerHTML = letter;
        
        var dy = _acces_index * bar_dim.height / 
          self._direct_access.childElementCount + 10;
        
        self._direct_access_value.style.webkitTransform = 'translate3d(0px,' + dy + 'px,0)';
      };
      
      var accessBarEnd = function (e)
      {
        document.removeEventListener (core.POINTER_MOVE, accessBarMove);
        document.removeEventListener (core.POINTER_END, accessBarEnd);

        self._direct_access_value.style.opacity = 0;

        if (self._acces_index === _acces_index) return;
        self._acces_index = _acces_index;

        var letter = Object.keys (self._model) [_acces_index];
        self._loader.setStyle ('display', "block");
        setTimeout (function () {
          self._renderTab (letter, function () {
            self._loader.setStyle ('display', "none");
          });
        }, 50);
      };
  
      this._direct_access.addEventListener (core.POINTER_START, accessBarStart, false);
     }
  });
 
  return TedXParticipantList;
});