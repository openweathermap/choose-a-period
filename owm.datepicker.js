(function() {
  // Define constructor
  this.OWMDatePicker = function(elemID, map, config) {
    var that = this;
    that.map = map;
    
    that.offset = {
      from: 0,
      to: 0
    };

    that.current = {   
    };

    that.dateHeight = 28;
    that.datesOnView = 11;
    that.focusOffes = 5; 

    that.months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    var body = [
      '<div class="time-row-body">',
      '<div class="time-month time-month-before">',
      '</div>',
      '<div class="current-wrapper">',
      '<div class="time-current">',
      '</div>',
      '</div>',
      '<div class="time-month time-month-after">',
      '</div>',
      '</div>'
    ].join('\n');    

    var workspace = [
      '<div class="wrapper">',
      '<div class="time-row time-row-from active">',
      '<div class="time-row-header">',
      '<div class="header-lable">',
      '<span>From:</span>',
      '</div>',
      '<div class="header-value">',
      '<span></span>',
      '</div>',
      '</div>',
      body,
      '</div>',
      '<div class="time-row time-row-to">',
      '<div class="time-row-header">',
      '<div class="header-lable">',
      '<span>To:</span>',
      '</div>',
      '<div class="header-value">',
      '<span></span>',
      '</div>',
      '</div>',
      body,          
      '</div>',
      '</div>'
    ].join('\n');

    $('#' + elemID).html(workspace);

    $('.time-row-header').on('click', function(e) {
      if ($(this).parent('.time-row.active').length === 0) {
          $('.time-row.active').removeClass('active');
          $(this).parent('.time-row').addClass('active');

          var kind;
          if ($(this).parents('.time-row-from').length > 0) {
            kind = 'from';
          } else if ($(this).parents('.time-row-to').length > 0) {
            kind = 'to';
          } else {
            return;
          }
          that.focusOnCurrent(kind, 1000);
      } else {
          $('.time-row.active').removeClass('active');
      }
    });

    function onWheel(kind) {
      return function mouseWheel(e) {
        $(this).clearQueue();
        var delta = e.originalEvent.wheelDelta;
        var speed = 1000 / ($(this).queue("fx").length + 1);
        var height = $(this).outerHeight();
        var parentHeight = $(this).parent().height();

        if (delta > 0) {
          if ((that.offset[kind] + that.dateHeight) <= 0) {
            that.offset[kind] += that.dateHeight;    
            that.setOffset(this, speed, kind);
          }     
        } else {
          if ((height + (that.offset[kind] - that.dateHeight)) >= parentHeight) {
            that.offset[kind] -= that.dateHeight;
            that.setOffset(this, speed, kind);
          }               
        }
      }      
    };   

    $('.time-row-from .time-current').bind('mousewheel', onWheel('from'));  
    $('.time-row-to .time-current').bind('mousewheel', onWheel('to'));

    that.setOffset = function(elem, speed, kind) {
      $(elem).animate({
        top: that.offset[kind] + 'px'
      }, speed, function() {
        that.setMonths(kind);
      }); 
    }

    that.setMonths = function(kind) {
      var datesLength = that.dates.length;
      var index = (that.offset[kind] / -that.dateHeight);
      var firstOnView = that.dates[index];
      var lastOfView = that.dates[datesLength-1];
      if (datesLength >= (index + that.datesOnView)) {
        lastOfView = that.dates[index + that.datesOnView - 1];
      }
      var dateStart = new Date(firstOnView.dt * 1000);
      var monthStart = dateStart.getUTCMonth();
      var dateEnd = new Date(lastOfView.dt * 1000);
      var monthEnd = dateEnd.getUTCMonth();      

      // var nextMonth = ((month + 1) > 11)? 0: month + 1;
      $('.time-row-' + kind + ' .time-month-before').text(that.months[monthStart]);
      $('.time-row-' + kind + ' .time-month-after').text(that.months[monthEnd]);
    };

    that.focusOnCurrent = function(kind, speed) {
      var element = $('.time-row-' + kind + ' .time-current').first();
      var height = $(element).outerHeight();
      var padding = height - $(element).innerHeight();
      var parentHeight = $(element).parent().height();
      var offset = (that.current[kind] * -that.dateHeight) + (that.focusOffes * that.dateHeight);
      if (offset > 0) {
        that.offset[kind] = 0;
      } else if ((height + offset) < parentHeight) {
        that.offset[kind] = parentHeight - height;
      } else {
        that.offset[kind] = offset;
      }
      that.setOffset(element, speed, kind);
    };
  };

  this.OWMDatePicker.prototype.loadDates = function (data) {
    this.dates = JSON.parse(data);
    this.setCurrent('from');
    this.setCurrent('to');
  };

  this.OWMDatePicker.prototype.drawDates = function () {
    var that = this;
    var fromHTML = '';
    var toHTML = '';
    var count = that.dates.length;
    
    that.dates.forEach(function(item, i) {
      var date = new Date(item.dt * 1000);
      var month = date.getUTCMonth() + 1;
      var day = date.getUTCDate();

      fromHTML += '<div class="item-of-current-time ' + ((i >= that.current.to)? 'disabled': '') + ' ' + ((i == that.current.from)? 'active': '') + '" data-index="' + i + '">\n<div>\n<span>' + day + '</span>\n</div>\n</div>\n';
      toHTML +=  '<div class="item-of-current-time ' + ((i <= that.current.from)? 'disabled': '') + ' ' + ((i == that.current.to)? 'active': '') + '" data-index="' + i + '">\n<div>\n<span>' + day + '</span>\n</div>\n</div>\n';
    });

    $('.time-row-from .time-current').html(fromHTML);  
    that.setMonths('from');
    $('.time-row-to .time-current').html(toHTML);
    that.setMonths('to');

    $('.item-of-current-time:not(.disabled)').click(function(e) {
      var kind;
      if ($(this).parents('.time-row-from').length > 0) {
        kind = 'from';
      } else if ($(this).parents('.time-row-to').length > 0) {
        kind = 'to';
      } else {
        return;
      }
      var index = $(this).data("index")

      that.setCurrent(kind, index);
    });
  };

  this.OWMDatePicker.prototype.setCurrent = function(kind, index) {
    var that = this;
    var speed = 0;

    if (index === undefined) {
      switch (kind) {
        case "from": 
          index = (that.dates.length - 2);
          break;
        case "to":
          index = (that.dates.length - 1);
          break;
      }
    } else {
      speed = 500;
    }

    that.current[kind] = index;
    var date = new Date(that.dates[index].dt * 1000);
    $('.time-row-' + kind + ' .time-row-header .header-value span').text(('0' + date.getUTCDate()).slice(-2) + '.' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '.' + date.getUTCFullYear());
    that.drawDates();
    that.focusOnCurrent(kind, speed);

    if (that.current['from'] && that.current['to']) {
      that.emit();
    }
  };

  this.OWMDatePicker.prototype.onChange = function(func) {
    var that = this;
    that.callback = func;
  };

  this.OWMDatePicker.prototype.emit = function() {
    var that = this;
    if (that.callback) {
      var from = that.current['from'];
      var fromDate = new Date(that.dates[from].dt * 1000);
      var to = that.current['to'];
      var toDate = new Date(that.dates[to].dt * 1000);

      that.callback(fromDate, toDate);
    }
  }
}());