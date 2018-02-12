/**
 * author : 刘宇阳
 * date : 2015/12/3
 * desc : 基于jquery, render的系列表单组件
 * 这里没有使用严格模式 因为时间控件的版本太老严格模式下不能正常运行
 */
(function($, render){
	var util = render.util;
	var log = render.log;
	var tableMixins = {
		//根据input type类型 获取相应的renderName
		getTypeRender : function(element) {
			if (!element) return null;
			var type = $(element).attr('type') || element.type;
			var renderName = '';
			switch (type) {
				case 'text':
				case 'password':
					renderName = 'text';
					break;
				case 'select-one':
					renderName = 'select';
					break;
				case 'textarea':
					renderName = 'textarea';
					break;
				case 'checkbox':
					renderName = 'checkbox';
					break;
				case 'radio':
					renderName = 'radio';
					break;
				default:
					renderName = type;
					break;
			}
			return renderName;
		},
		elemHasRender : util.hasRender
	};
    var selectMixins = {
        setHeight : function(element, selector, itemHeight, height){
            var h = $(element).find(selector).height() || $(element).find('li').length * itemHeight;
            if (h > height) {
                $(element).find(selector).height(height);
                $(element).data('hasScroll', true); //设置有滚动条
            } else {
                $(element).find(selector).height(h);
                $(element).data('hasScroll', false);
            }
        },
		position : function(element, contentElement){
			var contentHeight = $(contentElement).height();
			var height =  $(element).height();
			var offsetbottom = $(window).height() + $(window).scrollTop() - $(element).offset().top - height;
			$(contentElement).css({
				position : 'fixed',
				width : $(element).width(),
				left : $(element).offset().left
			});
			var elemTop = $(element).offset().top - $(window).scrollTop();
			if(offsetbottom > contentHeight){
				$(contentElement).css('top', (elemTop + height) + 'px');
			}else{
				$(contentElement).css('top', (elemTop - contentHeight) + 'px');
			}
		},
        load : function (options) {
            if(options){
                if(options.url){
                    this.url = options.url;
                    this.data = [];
                }
                if(options.params){
                    this.params = options.params;
                    this.data = [];
                }
                if(options.data && options.data.length > 0){
                    this.data = options.data;
                }
            }
            if (this.data && $.isArray(this.data) && this.data.length > 0) {
                this.loadHtml(this.data);
                this.setHeight(this.element, this.contentSelector, this.itemHeight, this.height);
                // this.setVal(this.value);
            } else if (this.url) {
                var _this = this;
                $.ajax({
                    url: this.url,
                    type: 'post',
                    data: this.params,
                    dataType: 'json',
                    success: function (data) {
                        if (_this.onloadSucess && $.isFunction(_this.onloadSucess)) {
                            _this.onloadSucess(data);
                        }
                        if(data && data.result && $.isArray(data.result)){
                            _this.data = data.result;
                        }else{
                            _this.data = data;
                        }
                        _this.loadHtml(_this.data);
                        _this.setHeight(_this.element, _this.contentSelector, _this.itemHeight, _this.height);
                    }
                });
            }
        }
    };
	$.render('view-table', {
		addClass: 'view-table',
		options: {
			width: '100%'
		},
		init: function(element, targetElement, options) {
			$(element).addClass(this.addClass);
			util.setWidth(element, options.width);
			this.renderTd(element); //渲染form table样式
		},
		renderTd: function(dom) {
			var that = this;
			$(dom).find('tr').each(function() {
				$(this).children('td:odd').each(function() {
					if (!$(this).attr('norender')) {
						$(this).addClass('td-text');
					}
					that.renderTd(this);
				});
				$(this).children('td:even').each(function() {
					if (!$(this).attr('norender')) {
						$(this).addClass('td-label');
					}
					that.renderTd(this);
				});
			});
		}
	});
	$.render('query-table', 'view-table', {
		mixins: [tableMixins],
		addClass: 'tb-query',
		init: function(element, targetElement, options) {
			this._super(element, targetElement, options);
			var that = this;
			$(element).find(':input').each(function() {
				if (that.elemHasRender(this)) return;
				util.setRender(this, that.getTypeRender(this));
			});
		}
	});
	$.render('form-table', 'view-table', {
		mixins: [tableMixins],
		addClass: 'tb-grid',
		init: function(element, targetElement, options) {
			this._super(element, targetElement, options);
			var _this = this;
			$(element).find(':input').each(function() {
				if (_this.elemHasRender(this)) return;
				var renderName = _this.getTypeRender(this);
				var classNames = $(this).attr('class') ? $(this).attr('class').split(' ') : false;
				if (classNames) {
					var that = this;
					$.each(classNames, function(index, className) {
						if (className && className.indexOf('render-') !== -1) {
							renderName = $.trim(className.substring(className.indexOf('render-') + 'render-'.length));
							var op = $(that).attr('data-options');
							$(that).attr('options', op);
							return false;
						}
					});
				}
				util.setRender(this, renderName);
			});
		}
	});
	$.render('form', {
		options : {
			width : '100%'
		},
		init : function(element, targetElement, options){
			$(element).addClass(this.addClass);
			this.dom = element;
			this.targetElement = targetElement;
			util.setWidth(element, options.width);
		},
		val : function(value){
			if(value === undefined || value === null) return this.getVal();
			this.setVal(value);
		},
		setVal : function(value){
			$(this.targetElement).val(value);
		},
		getVal : function(){
			return $(this.targetElement).val();
		},
		destory : function(){
			if(this.data) this.data = undefined;
			$(this.dom).off();//事件销毁
			$(this.dom).remove();
			$(this.targetElement).off();
			$(this.targetElement).remove();
		}
	});
	$.render('text', 'form', {
		addClass : 'form-input text'
	});
	$.render('textarea', 'form', {
		addClass: 'form-input form-textarea',
		init: function(element, targetElement,options) {
			this._super(element, targetElement, options);
			var textareaTimeout;
			function handleTextarea() {
				clearTimeout(textareaTimeout);
				textareaTimeout = setTimeout(function() {
					resizeTextarea(element);
				}, 0);
			}
			function resizeTextarea(textarea) {
				textarea = $(textarea);
				textarea.css({
					'height': ''
				});
				var height = textarea[0].offsetHeight;
				var diff = height - textarea[0].clientHeight;
				var scrollHeight = textarea[0].scrollHeight;
				if (scrollHeight + diff > height) {
					var newAreaHeight = scrollHeight + diff;
					textarea.css('height', newAreaHeight + 'px');
				}
			}
			var events = 'change keydown keypress keyup paste cut'.split(' ');
			$.each(events, function(index, text) {
				$(element).bind(text, handleTextarea);
			});
			resizeTextarea(element); //初始化resize
		}
    });
    $.render('unit-text', 'form', {
		options: {
			unit : '',
			position : 'right'
		},
		createDom: function(element, options) {
			var $element = $(element);
			$element.wrap('<div class="form-input text-box"></div>')[options.position === 'right' ? 'after' : 'before']('<span class="text-util"></span>');
			return $element.parent('.text-box')[0];
		},
		init: function(element, targetElement, options) {
			this._super(element, targetElement, options);
			$(element).find('.text-util').text(options.unit);
		},
		setVal: function(value) {
			$(this.dom).find(':text').val(value);
		},
		getVal: function() {
			return $(this.dom).find(':text').val();
		}
    });
	$.render('date', 'form', {
		addClass: 'form-input inputDate',
		options: {
			options: null, //my97date参数配置
			width: null
		},
		init: function(element, targetElement, options) {
			this._super(element, targetElement, options);
			$(element).prop('readOnly', true);
			$(element).click(function() {
				if (!options.options) {
					WdatePicker();
				} else {
					WdatePicker(util.parseOptions(options.options));
				}
			});
		}
	});
	$.render('input-button', 'form', function(){
        var eTpl = '[{event : "click", fun : function(){}}]';
        return {
            options : {
                text : '…', //按钮上的文字
                position : 'right', //right/left 按钮的位置 默认 right
                bindEvent : null,  //button绑定事件 {event : 'click', fun : 'function(){};'}
                btnClass : 'btn btn-select btn-blue',  //按钮样式
                ableInput : false  //是否可以输入
            },
            createDom : function(element, options){
            	var tpl =  '<span class="input-group-btn">'+
            					'<input type="button" name="" id="" value="{text}"/>'+
            				'</span>';
				var $element = $(element);
				$element.wrap('<div class="form-group"></div>');
                if(options.position === 'left'){
					$element.before(tpl.replace(/\{text\}/g, options.text));
                }else{
					$element.after(tpl.replace(/\{text\}/g, options.text));
                }
				return $element.parent('.form-group')[0];
            },
            init : function(element, targetElement, options){
            	this._super(element, targetElement, options);
            	 $(element).find(':text').addClass('form-input text');
                if(!options.ableInput)
                    $(element).find(':text').get(0).onkeydown = function(){return false;}; //防止输入
                $(element).find(':button').addClass(options.btnClass);
                var bindEvent = [];
                try{
                    if(options && options.bindEvent){
                        if($.isArray(options.bindEvent)){
                            bindEvent = options.bindEvent;
                        }else{
                            bindEvent = eval('(' + options.bindEvent + ')');
                        }
                    }
                }catch(e){
                    throw new Error('bindEvent格式错误，应该是： ' + eTpl);
                }
                if(!$.isArray(bindEvent)){
                    log.error('bindEvent格式不对哦' + eTpl);
                    return;
                }
                //遍历bindEvent绑定事件
                for(var i = 0; i < bindEvent.length; i++){
                    var eventObj = bindEvent[0];
                    $(element).on(eventObj.event, ':button', eventObj.fun);
                }
                var text = options.text;
                if(text){
                    $(element).find(':button').val(text);
                }
            },
            setVal : function(value){
            	$(this.dom).find(':text').val(value);
            },
            getVal : function(){
            	return $(this.dom).find(':text').val();
            }
        };
    });
	$.render('select', 'form',{
		createDom: function(element) {
			var text = '--请选择--';
			$(element).find('option').each(function() {
				if (this.selected === true || this.selected === 'selected') {
					text = this.innerHTML;
				}
			});
			$(element).wrap('<div class="select-box"></div>').before('<span>' + text + '</span>');
			return $(element).parent('.select-box')[0];
		},
		init: function(element, targetElement, options) {
			this._super(element, targetElement, options);
			var that = this;
			$(element).on('change', 'select', function() {
				$(this).prev().text(that.getSelectText(this));
			});
		},
		getSelectText: function(select) {
			var text = '';
			$(select).find('option').each(function() {
				if (this.selected === true) {
					text = $(this).text();
					return false;
				}
			});
			return text;
		},
		refresh: function(){
			selectJq.prev().text($('select', this.dom));
		},
		setVal: function(value) {
			var selectJq = $('select', this.dom);
			selectJq.val(value);
			selectJq.prev().text(this.getSelectText(selectJq));
		},
		getVal: function() {
			return $(this.dom).find('select').val();
		}
	});
	//依赖jquery.cookie
    $.render('search', 'form', function(){
        var split = ',';
        var size = 7; //显示条数
        var cookieSize = 1000; //最大储存条数
        return{
            options : {
                width : '100%',
                name : null, //search存入cookie中的名称
                btnId : null, //出发存储的btn的id
                url : null, //自动补全开启需要的url参数
                params : null, //请求参数
                filed : '' //返回list map中的字段名称
            },
            createDom : function(element, options){
            	var tpl = '<div class="search-box">'+
            				'{input}'+
            				'<div class="search-content" style="display:none;">'+
            					'<ul>'+
            					'</ul>'+
            				'</div>'+
            			   '</div>';
				var $element = $(element).wrap('<div class="search-box"></div>').after('<div class="search-content" style="display:none;"><ul></ul></div>');
                var placeholder = $(element).attr('placeholder');
                options.placeholder = placeholder;
                return $element.parent('.search-box')[0];
            },
            init : function(element, targetElement, options){
            	this._super(element, targetElement, options);
                $(element).find(':text').addClass('form-input text search');
                if(!options.btnId) return;
                var searchJq = $(element).find(':text');
                var contentJq = $(element).find('.search-content');
                var that = this;
                $('#' + options.btnId).click(function() {
                    var value = searchJq.val();
                    that.saveSearch(options.name, value);
                    contentJq.hide();
                });
                searchJq.click(function(e){
                    if(contentJq.is(':hidden')){
                        var value = searchJq.val();
                        that.search(element, value, options, function(){
                            if(contentJq.find('li').length > 0)contentJq.show();
                        });
                    }
                    e.stopPropagation();
                });
                $(window).click(function(){
                    contentJq.hide();
                });
                //事件委派
                contentJq.delegate('li', 'click', function() {
                    that.change(element, this);
                    contentJq.hide();
                    $('#' + options.btnId).click();//添加点击历史条件后搜索
                });
                var time = null ; //定时器对象，搜索延时处理
                searchJq.keyup(function(event) {
                    switch(event.keyCode){
                        case 37 :
                        case 38 :
                        case 39 :
                        case 40 :
                            break;
                        //enter
                        case 13 :
                            $('#' + options.btnId).click();//点击enter键后搜索
                            if(contentJq.is(':hidden')) return;
                            contentJq.hide();
                            break;
                        default :
                            if(time != null)clearTimeout(time);
                            var text = $(this).val();
                            time = setTimeout(function(){
                                that.search(element, text, options, function(){
                                    if(contentJq.find('li').length > 0)contentJq.show();
                                });
                            }, 500);
                            break;
                    }
                });
                searchJq.keydown(function(event) {
                    if(contentJq.is(':hidden') || contentJq.find('li').length < 1) return;
                    var curliJq = $(element).find('li.selected');
                    var nextli;
                    switch(event.keyCode){
                        //up
                        case 38 :
                            nextli = curliJq.prev();
                            if(!nextli || nextli.length === 0) nextli = $(element).find('li:last').get(0);
                            break;
                        //down
                        case 40 :
                            nextli = curliJq.next();
                            if(!nextli || nextli.length === 0) nextli = $(element).find('li:first').get(0);
                            break;
                    }
                    if(nextli){
                        that.change(element, nextli);
                    }
                });
            },
            destory : function(){
            	$(this.dom).find(':text').off();
            	$(this.dom).find('.search-content').off();
            	this._super();
            },
            loadHtml : function(element, contentArr) {
                if (contentArr && contentArr.length === 0) contentArr = [];
                var liTpl = '<li>{searchContent}</li>';
                var ulJq = $(element).find('.search-content ul'); //ul的jquery对象
                var liHtml = '';
                for (var i = 0; i < contentArr.length; i++) {
                    liHtml += liTpl.replace(/\{searchContent\}/g, contentArr[i]);
                }
                ulJq.html(liHtml); //加载html
                return true;
            },
            //获取search内容缓存
            getSearchCache : function (name){
                var searchStr = window.localStorage ? window.localStorage[name] : $.cookie(name);
                if(!searchStr || $.trim(searchStr) === '') return false;
                return searchStr.split(split);
            },
            saveSearch: function(name, value) {
                if (!value || $.trim(value) === '') return;
                var searchArr = this.getSearchCache(name);
                var flag = true;
                if (searchArr) {
                    for (var i = 0; i < searchArr.length; i++) {
                        if (String(searchArr[i]) === String(value)) {
                            flag = false;
                            break;
                        }
                    }
                } else {
                    searchArr = [];
                }
                if (flag) {
                    if (searchArr.length >= cookieSize) {
                        searchArr.splice(cookieSize - 1, searchArr.length - cookieSize + 1); //删除超标的值
                    }
                    searchArr.unshift(value);
                }
                if (window.localStorage) {
                    window.localStorage[name] = searchArr.join(split);
                } else {
                    $.cookie(name, searchArr.join(split));
                }
            },
            getSizeSearch: function(name, value) {
                var arr = this.getSearchCache(name);
                var returnArr = [];
                if (!arr || arr.length === 0) return false;
                for (var i = 0; i < arr.length; i++) {
                    if (i >= size) break;
                    if (!value || arr[i].indexOf(value) !== -1) {
                        returnArr.push(arr[i]);
                    }
                }
                return returnArr;
            },
            getData: function(url, params, filed, success) {
                if (!params) params = {};
                params.page = 1;
                params.rows = size;
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: url,
                    data: params,
                    async: false,
                    success: function(data) {
                        var arr = [];
                        if (data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                if (i >= size) break;
                                arr[i] = data[i][filed];
                            }
                        }
                        if (success && $.isFunction(success)) success(arr);
                    }
                });
            },
            search: function(element, value, options, callback) {
                if (options.url && options.filed && (value !== undefined && value != null && $.trim(value) !== '')) {
                    if (!options.params) options.params = {};
                    options.params.searchText = value;
                    var that = this;
                    this.getData(options.url, options.params, options.filed, function(data) {
                        that.loadHtml(element, data);
                        if (callback) callback();
                    });
                } else {
                    this.loadHtml(element, this.getSizeSearch(options.name, value));
                    if (callback) callback();
                }
            },
            change: function(element, li) {
                $(element).find(':text').val($(li).text());
                $(element).find('li.selected').removeClass('selected');
                $(li).addClass('selected');
            },
            setVal: function(value){
            	$(this).find(':text').val(value);
            },
            getVal: function(){
            	return $(this).find(':text').val();
            }
        };
    });
    //<input type="text" render="combobox" options="name : '', valueField:'DM',textField:'DMNR', data:[{DM:'0',DMNR:'可以'},{DM:'1',DMNR:'不可以'}]"/>
    $.render('combobox', 'form',{
        mixins : [selectMixins],
        options: {
            name: null, //name值
            data: null, //数据
            url: null, //url参数
            params: {}, //params参数
			formatter : null,//显示格式化函数
            onloadSuccess: util.noop, //成功时调用方法
			onchange : util.noop,
            textField: '', //文本字段
            valueField: '', //值字段
            readOnly: false, //只读不可以输入
            itemHeight : 24,
            width: '100%' //宽度
        },
        createDom: function(element, options) {
            var tpl = '<div class="form-input combobox">' +
                '<div class="combo-content">' +
                '<input type="text" name="{name}" />' +
                '<i class="combo-icon">&nbsp;&nbsp;&nbsp;</i>' +
                '</div>' +
                '<div class="combo-select" style="display:none">' +
                '<ul>' +
                '</ul>' +
                '</div>' +
                '</div>';
            $(element).hide();
            return $(tpl.replace(/\{name\}/g, options.name)).insertAfter(element).get(0); //插入在元素之后并获取dom
        },
        init: function(element, targetElement, options) {
            this._super(element, targetElement, options);
            $.extend(this, {
                element: element, //combobox元素对象
                height: '240',
                value: $(targetElement).val(), //当前value值
                text: '',  //当前text值
                contentSelector : '.combo-select'
            }, options);
            this.initCombobox();
        },
        initCombobox : function () {
            var combobox = this;
            var change = false;
            $(combobox.element).on('click', '.combo-icon', function () {
                $(combobox.element).find('.combo-select').toggle();
                if (!combobox.isHidden()){
                	$(combobox.element).find(':text:eq(0)').focus();
                	combobox.position(combobox.element, $(combobox.element).find('.combo-select')[0]);
            	}
                if (!combobox.isHidden() && change) {
                    combobox.loadHtml(combobox.data);
                    combobox.scrollTo();
                    change = false;
                }
            });
            $(combobox.element).on('click', ':text:eq(0)', function () {
                if (combobox.isHidden()){
                    $(combobox.element).find('.combo-select').show();
                    combobox.position(combobox.element, $(combobox.element).find('.combo-select')[0]);
                }else if(combobox.readOnly){
                    $(combobox.element).find('.combo-select').hide();
                }
            });
            if(combobox.readOnly){
                $(combobox.element).find(':text').prop('readOnly', true);
            }else{
                //按下事件
                $(combobox.element).on('keydown', ':text:eq(0)', function (event) {
                    switch (event.keyCode) {
                        //up
                        case 38 :
                            combobox.selectTo('up');
                            break;
                        //down
                        case 40 :
                            combobox.selectTo('down');
                            break;
                    }
                });
                //松开事件
                $(combobox.element).on('keyup', ':text:eq(0)',function (event) {
                    switch (event.keyCode) {
                        //enter
                        case 13 :
                            if (combobox.isHidden(combobox)) return;
                            $(combobox.element).find('.combo-select').hide();
                            break;
                        default :
                            var text = $(this).val();
                            if (combobox.isHidden(combobox)){
                            	$(combobox.element).find('.combo-select').show();
                            	combobox.position(combobox.element, $(combobox.element).find('.combo-select')[0]);
                            }
                            //如果text发生改变就重新加载HTML
                            if (text !== combobox.text) {
                                change = true; //判断是否重新加载
                                var data = combobox.search(text, combobox.textField, combobox.data);
                                combobox.text = text;
                                //输入时将值清0
                                combobox.value = '';
                                $(combobox.targetElement).val();
                                combobox.loadHtml(data);
                            }
                            break;
                    }
                });
            }
            $(combobox.element).on('click', 'li', function() {
                var value = $(this).attr('selectValue');
                var text = $(this).text();
                combobox.changeValue(value, text);
				$(combobox.element).find('.combo-select').hide();
            }); //绑定事件
            $(window).click(function (e) {
            	var jq =  $(combobox.element);
            	var filters = [jq.find('.combo-icon')[0], jq.find(':text')[0]];
            	for(var i = 0; i < filters.length; i++){
            		if(filters[i] === e.target) return;
            	}
                jq.find('.combo-select').hide();
            });
            $(window).scroll(function(){
            	combobox.position(combobox.element, $(combobox.element).find('.combo-select')[0]);
            });
            combobox.load();
        },
        isHidden : function () {
            return $(this.element).find('.combo-select').is(':hidden');
        },
        search : function (text, textField, data) {
            var str = $.trim(text);
            var arr = [];
            if (!str) return data;
            for (var i = 0; i < data.length; i++) {
                if (data[i][textField].indexOf(str) !== -1) {
                    arr.push(data[i]);
                }
            }
            return arr;
        },
        scrollTo : function() {
            var combobox = this;
            if (!$(combobox.element).data('hasScroll')) return; //没有滚动条就不执行
            var selectDiv = $(combobox.element).find('.combo-select').get(0);
            var hasValue = combobox.value !== undefined && combobox.value != null && $.trim(combobox.value) !== '';
            if (!hasValue) {
                $(selectDiv).scrollTop(0);
                return;
            }
            var dh = $(selectDiv).height(); //selectdiv高度
            var dt = $(selectDiv).offset().top; // selectDiv top
            var lh = $(combobox.element).find('li[selectValue="' + combobox.value + '"]:eq(0)').outerHeight(); //当前li的高度
            var lt = $(combobox.element).find('li[selectValue="' + combobox.value + '"]:eq(0)').offset().top; //当前li top值
            var scrollTop = $(selectDiv).scrollTop(); //当前的滚动条高度
            if (lt >= dt && lt <= dh + dt - lh) return; //在显示范围内则不移动滚动条
            if (lt < dt) {
                scrollTop = scrollTop + lt - dt;
            } else {
                scrollTop = scrollTop + lt - dt - dh + lh;
            }
            if (scrollTop >= 0 && scrollTop !== $(selectDiv).scrollTop())
                $(selectDiv).scrollTop(scrollTop);
        },
        selectTo : function(direction) {
            var combobox = this;
            if (this.isHidden()) return; //如果下拉框是隐藏状态就不执行操作
            var li = false; //存储下一个选项的li dom
            //判断有值
            var hasValue = combobox.value !== undefined && combobox.value != null && $.trim(combobox.value) !== '';
            if (direction === 'up') {
                //取上一个li
                if (hasValue) li = $(combobox.element).find('li[selectValue="' + combobox.value + '"]:eq(0)').prev();
                //没有值或者没有上一个li就取左右一个
                if (!li || li.length === 0) li = $(combobox.element).find('li:last');
            } else {
                //取下一个li
                if (hasValue) li = li = $(combobox.element).find('li[selectValue="' + combobox.value + '"]:eq(0)').next();
                //没有值或者没有下一个li就取第一个
                if (!li || li.length === 0) li = $(combobox.element).find('li:first');
            }
            var value = li.attr('selectValue');
            var text = li.html();
            combobox.changeValue(value, text);
            combobox.scrollTo();
        },
        loadHtml: function(data) {
            var combobox = this;
            if (!data || !$.isArray(data)) return;
            var liTpl = '<li selectValue="{value}">{text}</li>';
            var html = '';
			var formatter = this.options.formatter;
            for (var i = 0; i < data.length; i++) {
                var value = data[i][combobox.valueField];
                var text = data[i][combobox.textField];
				text = formatter && $.isFunction(formatter) ? formatter(value, text) : text;
                html += liTpl.replace(/\{value\}/g, value).replace(/\{text\}/g, text);
            }
            $(combobox.element).find('ul').empty().append(html);
            //将选中的li添加class
            if (combobox.value && $.trim(combobox.value) !== '') {
                $(combobox.element).find('li[selectValue="' + combobox.value + '"]:eq(0)').addClass('selected');
                var t = $(combobox.element).find('li[selectValue="' + combobox.value + '"]:eq(0)').text();
                if ($(combobox.element).find(':text:eq(0)').val() !== t) $(combobox.element).find(':text:eq(0)').val(t);
            }
        },
        changeValue : function (value, text) {
            if (value === this.value) return;
            if (this.onchange && $.isFunction(this.onchange)) {
                this.onchange(value, text);
            }
            this.value = value;
            this.text = text || $(this.element).find('li[selectValue="' + value + '"]:eq(0)').text();
            $(this.element).find(':text:eq(0)').val(this.text);
            $(this.targetElement).val(value);
            $(this.element).find('.selected').removeClass('selected');
            $(this.element).find('li[selectValue="' + value + '"]:eq(0)').addClass('selected');
        },
        setVal : function(value){
            this.changeValue(value);
        }
    });
    //<input type="text" render="multiselect" options="name : '', valueField:'DM',textField:'DMNR', data:[{DM:'0',DMNR:'可以'},{DM:'1',DMNR:'不可以'}]"/>
    $.render('multiselect', 'form', {
        mixins : [selectMixins],
        options : {
            data : null, //数据
            url : null, //url参数
            params : {}, //params参数
            onloadSuccess : function() {}, //成功时调用方法
            textField : '', //文本字段
            valueField : '', //值字段
			formatter : null,//显示格式化函数
            onchange : undefined, //参数值改变时调用方法
            itemHeight : 35,
            required : false
        },
        createDom : function(element){
            var  tpl = '<div class="ms-box">' +
                            '<input type="text" readOnly class="form-input multiselect"/>' +
                            '<div class="ms-content" style="display:none">' +
                                '<ul>' +
                                '</ul>' +
                            '</div>' +
                        '</div>';
            $(element).hide(); //隐藏原来的元素
            return $(tpl).insertAfter(element).get(0);
        },
        init: function(element, targetElement, options) {
            this._super(element, targetElement, options);
            if (options.required) {
                $(element).find(':text').addClass('easyui-validatebox').attr('data-options', 'required:true');
            }
            $.extend(this, {
                element: element,
                value: $(targetElement).val(),
                height: '240',
                contentSelector : '.ms-content',
                text: ''
            }, options);//参数传递
            this._init();
        },
        _init: function() {
            var multiSelect = this;
            var element = multiSelect.element;
            var contentJq = $(element).find('.ms-content');
            $(element).on('click', ':text', function() {
                contentJq.toggle();
                if(!contentJq.is(':hidden')){
                	multiSelect.position(multiSelect.element, contentJq[0]);
                }
            });
            $(window).click(function(e) {
            	var msbox = $(e.target).parents('.ms-box');
            	if(msbox.length > 0 && msbox[0] === element)return;
                contentJq.hide();
            });
            $(window).scroll(function(){
            	multiSelect.position(multiSelect.element, contentJq[0]);
            });
            $(element).on('click', '.ms-content li',  function(e) {
                if ($(this).find(':checkbox').is(':checked')) {
                    $(this).find(':checkbox').prop('checked', false);
                } else {
                    $(this).find(':checkbox').prop('checked', true);
                }
                multiSelect.select();
                if (multiSelect.onchange && $.isFunction(multiSelect.onchange)) {
                    multiSelect.onchange(e, multiSelect.value, multiSelect.text);
                }
            });
            $(element).on('click', '.ms-content li :checkbox', function(e) {
                multiSelect.select();
                e.stopPropagation();
            });
            multiSelect.load();
        },
        loadHtml: function() {
            var multiSelect = this;
            if (!multiSelect.data || !$.isArray(multiSelect.data)) return;
            var liTpl = '<li><input type="checkbox"  value="{value}"><span>{text}</span></li>';
            var html = '';
            var textField = multiSelect.textField;
            var valueField = multiSelect.valueField;
            for (var i = 0; i < multiSelect.data.length; i++){
				var value = multiSelect.data[i][valueField];
				var text =  multiSelect.data[i][textField];
				text = this.options.formatter && $.isFunction(this.options.formatter) ? this.options.formatter(value, text) : text;
                html += liTpl.replace(/\{value\}/i, value).replace(/\{text\}/i, text);
            }
            $(multiSelect.element).find('ul').html(html); //插入
            if(this.value){
                this.select(this.value);
            }
        },
        select : function (values) {
            var multiSelect = this;
            var value = [];
            var text = [];
            if (values != undefined && values != null) {
                if (!$.isArray(values)) {
                    values = values.split(',');
                }
                $(multiSelect.element).find('li :checkbox:checked').prop('checked', false);
                for (var i = 0; i < values.length; i++) {
                    if (!$(multiSelect.element).find('li :checkbox[value="' + values[i] + '"]').is(':checked')) {
                        $(multiSelect.element).find('li :checkbox[value="' + values[i] + '"]').prop('checked', true);
                    }
                }
            }
            $(multiSelect.element).find('li :checkbox:checked').each(function () {
                value.push($(this).val());
                text.push($(this).next().text());
            });
            multiSelect.value = value.join(',');
            multiSelect.text = text.join(',');
            $(multiSelect.element).find(':text').val(multiSelect.text);
            $(multiSelect.targetElement).val(multiSelect.value);
        },
        setVal: function(value){
            this.select(value);
        }
    });
})(jQuery, render);