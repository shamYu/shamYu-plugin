/**
 * author : 刘宇阳
 * date : 2015-12-30
 * desc : 基于jquery的模块化开发插件
 */
(function($, render) {
	var util = render.util,
		log =  render.log;
	/*延迟加载的任务队列*/
	var moduleTasks = util.ensure(render, 'moduleTasks', function(){
		var tasks = {};
		return {
			addTask : function(moduleName, context, params){
				if(!tasks[moduleName]) tasks[moduleName] = [];
				return (tasks[moduleName].push({
					name : moduleName,
					context : context,
					params : params
				}) - 1);
			},
            addRenderTask : function(moduleName, module){
                var taskName = moduleName + '-render';
                if(!tasks[taskName])tasks[taskName] = [];
                tasks[taskName].push(module);
            },
			/*执行加载队列*/
			doTask : function(moduleName){
				if(!tasks[moduleName]) return;
				var Module = render.module(moduleName);
				if(!Module){
					log.log('找不到名为' + moduleName + '的模块类,把base加入等待加载队列');
					return false;
				}
				log.log('开始加载' + moduleName + '模块的任务');
                var _this = this;
				$.each(tasks[moduleName], function(i, item){
                    log.log('开始加载第' + (i + 1) + '个');
					var module = new Module(item.context, item.params);
                    module.moduleName = moduleName;
                    _this.addRenderTask(moduleName, module);
					log.log('第' + (i + 1) + '个加载完成');
				});
				log.log('执行完成');
				this.removeTask(moduleName);
			},
            doRenderTask : function(moduleName){
                var taskName = moduleName + '-render';
                if(!tasks[taskName])return;
                log.log('开始执行render完成之后的方法');
                $.each(tasks[taskName], function(i, module){
                    log.log('开始加载第' + (i + 1) + '个module的init方法');
                    if(!module || !module.init){
                        log.log('不存在这个module或者找不到init方法');
                        return;
                    }
                    try{
                        module.init(module.context, module.params);
                    }catch(e){
                        log.error(e);
                    }
                    log.log('第' + (i + 1) + '个init执行完成');
                });
                log.log(taskName + '任务执行完成');
                this.removeTask(taskName);
            },
			removeTask : function(name){
				if(tasks.hasOwnProperty(name))
					delete tasks[name];
				return this;
			},
			clear : function(){
				return (tasks = {});
			}
		};
	});
    /**
     * 模块类
     */
    function Module(){
    }
    Module.prototype.binds = [];//事件绑定声明
	var initializing = false,
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/;
    Module.extend = function(obj){
		if(!obj && typeof obj !== 'object'){
			log.warn('Parameter is null or not Object, not registered');
			return;
		}
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		/*对象继承处理*/
		for (var name in obj) {
			if(name === 'binds'){
				prototype[name] = bindsCopy(_super[name], obj[name]);
				continue;
			}
			if(name === 'params'){
				prototype[name] = $.extend({}, _super[name], obj[name]);
				continue;
			}
			prototype[name] = typeof obj[name] === 'function' &&
				typeof _super[name] === 'function' && fnTest.test(obj[name]) ?
				(function(name, fn) {
					return function() {
						var tmp = this._super;

						this._super = _super[name];

						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, obj[name]) : obj[name];
		}
		function Class(context, params) {
			if(!context)return;
			var that = this;
            var binds = [];
   			$.each(this.binds, function(i, item) {
                item = $.extend({}, item);
        		if (item && $.isPlainObject(item)) item.element = context;
        		if(!item.handler)return;
        		if(!$.isFunction(item.handler)) {
        			var str = item.handler;
        			item.handler = function(e){
        				that[str](e, this);
        			};
        		}else{
        			var handler = item.handler;
        			item.handler = function(e){
        				handler.call(that, e, this);
        			};
        		}
                binds.push(item);
    		});
    		util.bindEvents(binds); //事件绑定
    		this.context = context;
    		this.params = $.extend(true, {}, this.params, params);//深拷贝
            context.addClass('render-module').data('render-module', this);
            if(this.load) this.load(context, this.params);
		}
		Class.prototype = prototype;
		Class.prototype.constructor = Module;
		Class.extend = arguments.callee;
		return Class;
    };
    //事件绑定拷贝
    function bindsCopy(srcArr, destArr){
        var arr = [];
        $.each(srcArr, function(i, item){
            arr[i] = $.extend({}, item);
        });
        if(!destArr || !$.isArray(destArr)) return arr;
        $.each(destArr, function(i, bind){
            if(!hasVal(arr, bind) && bind && bind.selector)
                arr.push($.extend({}, bind));
        });
        return arr;
    }
    function hasVal(arr, obj){
        if(!arr || !$.isArray(arr) || !obj) return false;
        var flag = false;
        $.each(arr, function(i, item) {
            if(item.selector === obj.selector && item.event === obj.event){
                arr[i] = obj;
                flag = true;
                return false;
            }
        });
        return flag;
    }
    /**
     * 定义module组件
     * @return {[type]} [description]
     */
    (function createModule(context){
    	return util.ensure(context, 'module', function(){
    		var modules = {};//modules集合
    		return function(name){
    			if(!name) return;
    			if(arguments.length === 1) return modules[name];
    			if(modules[name]){
    				log.warn('这个模块已经注册，不能覆盖！');
	    			return modules[name];
    			}//同一名称的module不会加载第二次
    			var parentName = null;
				var fun = null;
				if (arguments.length === 2) {
					fun = arguments[1];
				} else {
					parentName = arguments[1];
					fun = arguments[2];
				}
				var prop = typeof fun === 'function' ? fun() : typeof fun === 'object' ? fun : undefined; //执行方法返回render对象
				var parent = parentName ? modules[parentName] : Module;
				if(!parent){
					log.error('没有这个父模块');
					return;
				}
				modules[name] = parent.extend(prop);
				moduleTasks.doTask(name);
                moduleTasks.doRenderTask(name);
				return modules[name];
    		};
    	});
    })(render);
    //注册拦截器
    render.addInterceptor({
        onBeforeElementRender : function(element){
    		//如果有模块化处理就加载模块
			if($(element).attr('render-module')){
				var str = $(element).attr('render-module');
                var moduleName = $.trim(str.indexOf(':') !== -1 ? str.substring(0, str.indexOf(':')) : str);
                var params = str.indexOf(':') !== -1 ? util.parseOptions(str.substring(str.indexOf(':') + 1), true) : {};
				render.moduleTasks.addTask(moduleName, $(element), params);
				render.moduleTasks.doTask(moduleName);
			}
    	},
        onElementRenderSuccess : function(element){
            if($(element).attr('render-module')){
                var str = $(element).attr('render-module');
                var moduleName = $.trim(str.indexOf(':') !== -1 ? str.substring(0, str.indexOf(':')) : str);
                render.moduleTasks.doRenderTask(moduleName);
            }
        },
    	//拦截destory
    	onDestory : function(element){
    		if($(element).hasClass('render-module'))
    			destoryModule.call(element);
    		$('.render-module', element).each(function(){
    			destoryModule.call(this);
    		});
    	}
    });
    function destoryModule() {
    	var module = $(this).data('render-module');
    	if (module && module.destory) {
        	if (module.context) module.context.off(); //解绑所有事件
        	module.destory(); //卸载
            module.parent = null;//释放父模块
        	module.children = null;//子模块释放引用
    	}
    	//释放资源
    	$(this).removeData('render-module');
    	module = null;
	}

    //添加$().render('getModule')方法
    render.jqMethod('getModule', function(){
        var module = this.data('render-module');
        if(!module){
           module = this.parents('.render-module:eq(0)').data('render-module');
        }
    	return module;
    });

    $.render('loadPage', {
        options : {
            url : null, //请求url
            iframe : false, //是否iframe加载
            onload : null, //加载成功后回调
            async : true, //异步加载
            lazyLoad : false //是否延迟加载
        },
        init : function(element, targetElement, options){
            this.context = $(element);
            this.url = options.url;
            this.onload = options.onload;
            if(!options.lazyLoad) this.load();
        },
        load : function(){
            if(this.options.iframe){
                this.loadIframe(this.context, this.url);
            }else{
                this.loadPage(this.context, this.url);
            }
        },
        loadPage : function(context, url) {
            if(!url){
                log.error('必须指定url');
                return;
            }
            var headStr = '</head>';
            var htmlStr = '</html>';
            var index = Layer.loading();
            var onload = this.onload;
            context.addClass('render-loadPage');
            $.ajax({
                url: url,
                type: 'post',
                async: this.options.async,
                dataType: 'html',
                success: function (data) {
                    if (data && data.indexOf(headStr) != -1) {
                        var start = data.indexOf(headStr) + headStr.length;
                        var end = false;
                        if (data.lastIndexOf(htmlStr) != -1) {
                            end = data.lastIndexOf(htmlStr);
                        }
                        var domhtml = '';
                        if (end) {
                            domhtml = data.substring(start, end);
                        } else {
                            domhtml = data.substring(start);
                        }
                        try{
                            context.render('destory', true);//先注销掉组件
                            context.html(domhtml);
                            context.render(true);
                            $.parser.parse(context);
                        }catch(e){
                            log.error(e);
                        }
                        if(onload && $.isFunction(onload)) onload(context.find('iframe:eq(0)'));
                    }
                },
                complete: function () {
                    Layer.closeLayer(index);
                }
            });
        },
        loadIframe : function(context, url){
            if(!url){
                log.error('必须指定url');
                return;
            }
            var iframe = '<iframe  width="100%"  frameborder="0" src="' + url + '"></iframe>';
            context.html(iframe);
            var that = this;
            context.on('load', 'iframe', function(e){
                if(that.onload && $.isFunction(that.onload))
                    that.onload(this);
                else
                    that.setFrameAutoHeight(this);
            });
        },
        setFrameAutoHeight : function(frame){
            var subWeb = document.frames ? document.frames[frame.name].document : frame.contentDocument;
            if(frame != null && subWeb != null) {
                frame.height = subWeb.body.scrollHeight;
            }
        },
        refresh : function(url){
            if(url){
                this.url = url;
            }
            this.load();
        }
    });
    /**
     * 获取url的参数成为一个对象{key value }
     * @return {[type]} [description]
     */
    util.getUrlParams = function (){
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = {};
        if (url.indexOf('?') !== -1) {
            var str = url.substr(1);
            var strs = str.split('&');
            for(var i = 0; i < strs.length; i ++) {
            	if(!strs[i] || strs[i].indexOf('=') === -1) continue;
            	var key = strs[i].split('=')[0];
            	var val = unescape(strs[i].split('=')[1]);
            	if(theRequest[key] !== undefined && theRequest[key] !== null && theRequest[key] !== ''){
            		if($.isArray(theRequest[key])){
            			theRequest[key].push(val);
            			continue;
            		}
            		val = new Array(theRequest[key], val);
            	}
				theRequest[key] = val;
            }
        }
        return theRequest;
    };
    /*批量绑定事件方法*/
    util.bindEvents = function(binds) {
        $.each(binds, function(i){
            if(binds[i].selector) {
                $(binds[i].element).on(binds[i].event,binds[i].selector , binds[i].handler);
            }else{
                $(binds[i].element).on(binds[i].event, binds[i].handler);
            }
        });
    };
    util.slice = function (arr, start, end){
            var newArr = [];
            if(!arr) return newArr;
            if(!start) start = 0;
            if(!end || end > arr.length - 1) end = arr.length - 1;
            for(var i = 0; i < arr.length; i++){
                if(i < start) continue;
                if(i > end) break;
                newArr.push(arr[i]);
            }
            return newArr;
        };
})(jQuery, render);
/**
 * 常用的模块
 */
(function($, render){
    /*模块事件对象*/
    var ModuleEvent = render.module.ModuleEvent = function (name, target){
        this.name = name;
        this.target = target;
        this.state = 'emit';
    };
    ModuleEvent.prototype.stop = function(){
        this.state = 'stop';
    };
    //基础模块，所有模块继承这个
    render.module('base', function(){
        var log = render.log;
        var util = render.util;
        /*执行事件*/
        function doEvent(direction, moduleEvent){
            var isContinue = true;//是否继续
            if(this.listens && this.listens[moduleEvent.name]){
                var _this = this;
                var _arguments = util.slice(arguments, 1);
                $.each(this.listens[moduleEvent.name], function(i, listenFunc){
                    listenFunc.apply(_this, _arguments);
                    if(moduleEvent.state === 'stop'){
                        return (isContinue = false);//如果截断事件就停止传播
                    }
                });
            }
            switch(direction){
                case 'emit' :
                    if(isContinue){
                        var parentContext = this.context.parents('.render-module:eq(0)');
                        if(parentContext.length > 0){
                            var parentModule = parentContext.render('getModule');
                            if(parentModule) doEvent.apply(parentModule, arguments);
                        }
                    }
                    break;
                case 'broadcast' :
                    this.context.find('.render-module').each(function(){
                        var curModule = $(this).data('render-module');
                        if(curModule && curModule.listens && curModule.listens[moduleEvent.name]){
                            $.each(curModule.listens[moduleEvent.name], function(i, listenFunc){
                                listenFunc.apply(_this, _arguments);
                            });
                        }
                    });
                    break;
            }
        }
        return {
            init : function(){

            },
            /*事件监听*/
            on : function(name, fun){
                if(!name || !fun || !$.isFunction(fun)){
                    log.warn('参数不正确，请传入监听的事件名称和处理的方法');
                    return;
                }
                if(!this.listens)this.listens = {};
                if(!this.listens[name])this.listens[name] = [];
                this.listens[name].push(fun);
            },
            /*注销事件*/
            off : function(name){
                if(name && this.listens[name]){
                    delete this.listens[name];
                }
            },
            /*向上冒泡事件*/
            emit : function(name){
                if(!name)return;
                var moduleEvent = new ModuleEvent(name, this);
                var params = [];
                if(arguments.length > 1){
                    params = util.slice(arguments, 1);
                }
                params.unshift('emit', moduleEvent);
                doEvent.apply(this, params);
            },
            /*向下广播事件*/
            broadcast : function(name){
                if(!name)return;
                var moduleEvent = new ModuleEvent(name, this);
                var params = [];
                if(arguments.length > 1){
                    params = util.slice(arguments, 1);
                }
                params.unshift('broadcast', moduleEvent);
                doEvent.apply(this, params);
            },
            /*获取父模块*/
            parent : function(){
                var parentContext = this.context.parents('.render-module:eq(0)');
                if(parentContext.length > 0){
                    return parentContext.data('render-module');
                }
                return null;
            },
            destory : function(){
                this.listens = null;//释放资源
                this.cache = null;//释放缓存
            },
            $get : function(selector){
                return $(selector, this.context);
            },
            bindEvent : function(binds){
                if(!binds || (!$.isPlainObject(binds) && !$.isArray(binds))) return;
                if(!$.isArray(binds)) binds = [binds];
                var context = this.context;
                var that = this;
                $.each(binds, function(i, item){
                    item.element = context;
                    item.handler = that.$call(item.handler);
                });
                util.bindEvents(binds);
            },
            $call : function(func){
                if(!func) return null;
                func = $.isFunction(func) ? func : this[func];
                var that = this;
                return function(){
                    var arr = [];
                    if(arguments && arguments.length > 0){
                        arr = util.slice(arguments);
                    }
                    arr.push(this);
                    return func.apply(that, arr);
                };
            }
        };
    });
    //datagrid模块
    render.module('datagrid', 'base', function(){
        function handlerGridEvent(eventName, context){
            var funcName = 'handler' + eventName.substring(eventName.indexOf('on') + 2);
            if(!context[funcName]) return;
            return function(){
                return context[funcName].apply(context, arguments);
            };
        }
        return {
            params : {
                gridSelector : '#datagrid',
                tableInfo : null,
                url : null,
                idField : 'XH',
                /*=====这里开始是datagrid的参数======*/
                resizeHandle : 'right',
                autoRowHeight :  false,
                striped : false,
                method : 'post',
                nowrap : true, //单元格是否可以换行
                data : null,
                loadMsg : '正在加载...',
                pagination : true,
                rownumbers : true,
                singleSelect : true,
                checkOnSelect : true,
                selectOnCheck : true,
                pagePosition : 'bottom',
                pageNumber : 1,
                pageSize : 20,
                pageList : [10,20,30,50,100,200],
                queryParams : null,
                sortName : null,
                sortOrder : 'asc',
                multiSort : false,
                remoteSort : true,
                showHeader : true,
                showFooter : false,
                scrollbarSize : 16,
                rowStyler : null,
                /*================================*/
                autoGridHeight : false,
                lazyLoad : false
            },
            init : function(){
                this.grid = $(this.params.gridSelector, this.context);
                if(!this.params.lazyLoad)this.loadGrid();
            },
            loadGrid : function(){
                var that = this;
                var grid = this.grid;
                var isLoad = grid.data('isLoad');
                if(!isLoad) {
                    grid.data('isLoad', true);
                    grid.datagrid({
                        url : this.params.url,
                        idField : this.params.idField,
                        tableInfo :JSON.stringify(this.params.tableInfo),
                        resizeHandle : this.params.resizeHandle,
                        autoRowHeight : this.params.autoRowHeight,
                        striped : this.params.striped,
                        method : this.params.method,
                        nowrap : this.params.nowrap,
                        data : this.params.data,
                        loadMsg : this.params.loadMsg,
                        pagination : this.params.pagination,
                        rownumbers : this.params.rownumbers,
                        singleSelect : this.params.singleSelect,
                        checkOnSelect : this.params.checkOnSelect,
                        selectOnCheck : this.params.selectOnCheck,
                        pagePosition : this.params.pagePosition,
                        pageNumber : this.params.pageNumber,
                        pageSize : this.params.pageSize,
                        pageList : this.params.pageList,
                        queryParams : this.params.queryParams,
                        sortName : this.params.sortName,
                        sortOrder : this.params.sortOrder,
                        multiSort : this.params.multiSort,
                        remoteSort : this.params.remoteSort,
                        showHeader : this.params.showHeader,
                        showFooter : this.params.showFooter,
                        scrollbarSize : this.params.scrollbarSize,
                        rowStyler : this.params.rowStyler,
                        onLoadSuccess : handlerGridEvent('onLoadSuccess', this),
                        onLoadError : handlerGridEvent('onLoadError', this),
                        onBeforeLoad : handlerGridEvent('onBeforeLoad', this),
                        onClickRow : handlerGridEvent('onClickRow', this),
                        onDblClickRow : handlerGridEvent('onDblClickRow', this),
                        onClickCell : handlerGridEvent('onClickCell', this),
                        onDblClickCell : handlerGridEvent('onDblClickCell', this),
                        onSortColumn : handlerGridEvent('onSortColumn', this),
                        onResizeColumn : handlerGridEvent('onResizeColumn', this),
                        onUnselect : handlerGridEvent('onUnselect', this),
                        onSelect : handlerGridEvent('onSelect', this),
                        onSelectAll : handlerGridEvent('onSelectAll', this),
                        onUnselectAll : handlerGridEvent('onUnselectAll', this),
                        onCheck : handlerGridEvent('onCheck', this),
                        onUncheck : handlerGridEvent('onUncheck', this),
                        onCheckAll : handlerGridEvent('onCheckAll', this),
                        onUncheckAll : handlerGridEvent('onUncheckAll', this),
                        onBeforeEdit : handlerGridEvent('onBeforeEdit', this),
                        onAfterEdit : handlerGridEvent('onAfterEdit', this),
                        onCancelEdit : handlerGridEvent('onCancelEdit', this),
                        onHeaderContextMenu : handlerGridEvent('onHeaderContextMenu', this),
                        onRowContextMenu : handlerGridEvent('onRowContextMenu', this)
                    });
                }else{
                    grid.datagrid('reload', this.params.queryParams);
                }
            },
            resize : function(){
                this.grid.datagrid('resize');
                var autoGridHeight = this.params.autoGridHeight;
                if(autoGridHeight) common.grid.autoHeight(this.grid, autoGridHeight == true ? null : autoGridHeight);
            },
            handlerLoadSuccess : function(data){
                if($(this).datagrid('getRows').length > 0){
                    $(this).datagrid('selectRow', 0);
                }
                var autoGridHeight = this.params.autoGridHeight;
                if(autoGridHeight == false)
                    common.grid.autoResize(this.grid);
                else
                    common.grid.autoHeight(this.grid, autoGridHeight == true ? null : autoGridHeight);
            }
        };
    });
    /*表单模块*/
    render.module('form', 'base', function(){
        var Promise = render.factory('Promise');
        var Cache = render.factory('Cache');
        return {
            params : {
                pkVal : null, //主键值
                initData : null, //初始化表单数据
                url : '', //url
                ajaxForm : false,
                tableInfo : null,
                cacheLimit : 5,
                formSelector : 'form:last',
                formTableSelector : '#form-table:last'
            },
            binds : [{
                selector : '.save-btn',//保存标识
                event : 'click',
                handler : 'save'
            },{
                selector : '.link-toggle',
                event : 'change',
                handler : 'handerToggle'
            }],
            init : function(){
                if(this.params.ajaxForm){
                    this.refresh(this.params.pkVal);
                    this.formCache = new Cache(this.params.cacheLimit);
                }
                var that = this;
                //初始化toggle
                $('.link-toggle', this.context).each(function(i, element){
                    that.handerToggle(null, element);
                });
            },
            //通用的toggle
            handerToggle : function(e, element){
                var toggleSelector = '.toggle-' + $(element).attr('name');
                if($(element).val() == 1){
                    $(toggleSelector, this.context).show();
                }else{
                    $(toggleSelector, this.context).hide();
                }
            },
            save : function() {
                var promise = new Promise();
                var that = this;
                var form = this.form = $(this.params.formSelector, that.context);
                if(this.params.ajaxForm){
                    promise = this.saveAjaxForm(form).then(function(data){
                        Layer.showSucMsg('保存成功');
                        that.emit('saveForm', data, form);//向上冒泡事件保存成功
                        var tableInfo = that.params.tableInfo;
                        if(data[tableInfo.tablePk]){
                            $(':input[name=' + tableInfo.tablePk + ']', that.context).val(data[tableInfo.tablePk]);//填充主键值
                        }
                    }).then(function(data){
                        that.afterAjaxSave(data, form);
                    });
                }else{
                    power.asynSubmit({
                        form : form,
                        fn : function(){
                            var data = common.form.getFormsData(form);
                            that.emit('saveForm', data, form);//向上冒泡事件保存成功
                            promise.resolve(data);//获取data
                        }
                    })
                }
                return promise;
            },
            saveAjaxForm : function(form){
                var that = this;
                if(!this.params.tableInfo){
                    Layer.showMsg('请配置tableInfo', 'info');
                    return;
                }
                var promise = new Promise();
                var tableInfo = this.params.tableInfo;
                var index = Layer.loading();
                common.ajax({
                    url : this.params.url,
                    data : {
                        methodName : 'business',
                        actionType : 'save',
                        params : JSON.stringify([{
                            value : tableInfo.tableName,
                            type : 'STRING'
                        },{
                            value : tableInfo.tablePk,
                            type : 'STRING'
                        },{
                            value : common.form.getFormsData(form),
                            type : 'MAP'
                        }])
                    }
                }).success(function(data){
                    promise.resolve(data);//获取data
                }).complete(function(){
                    Layer.closeLayer(index);
                }).error(function(){
                    promise.reject();
                });
                return promise;
            },
            afterAjaxSave : function(data){
                this.cacheFormData(data[this.params.tableInfo.tablePk], data);
            },
            //格式化data
            formatData : function(data){
                if(!data) return null;
                for(var key in data){
                    if(data[key] && data[key]['time']){
                        data[key] = power.dateFormat(new Date(data[key]['time']), 'yyyy-MM-dd');
                    }
                }
                return data;
            },
            refresh : function(pk){
                var formTable = $(this.params.formTableSelector, this.context);
                common.form.clearForm(formTable);
                if(!pk){
                    common.form.fillForm(formTable, this.params.initData);
                    return;
                }
                if($.isPlainObject(pk)){
                    var data = pk;
                    //默认的format
                    common.form.fillForm(formTable, this.formatData(data));
                    return;
                }
                return this.refreshAjaxForm(pk);
            },
            refreshAjaxForm : function(pk){
                return this.getFormData(pk).then(this.$call(function(data){
                    //缓存数据
                    return this.cacheFormData(pk, data);
                })).then(this.$call(function(data){
                    //format数据
                    return this.formatData(data);
                })).then(this.$call(function(data){
                    //填充数据
                   return this.fillForm(pk, data);
                }));
            },
            cacheFormData : function(pk, formData){
                this.formCache.put(pk, formData);
            },
            //填充表单
            fillForm : function(pk, data){
                common.form.fillForm(this.$get(this.params.formTableSelector), data || this.params.initData);
            },
            getFormData : function(pk){
                var promise = new Promise();
                if(this.formCache.get(pk)){
                    promise.resolve(this.formCache.get(pk));
                }else{
                    promise = this.ajaxFormData(pk);
                }
                return promise;
            },
            //发请求拿数据
            ajaxFormData : function (pk) {
                if(!this.params.tableInfo){
                    Layer.showMsg('请配置tableInfo', 'info');
                    return;
                }
                var that = this;
                var tableInfo = this.params.tableInfo;
                var promise = new Promise();
                var format = this.formatData;
                common.ajax({
                    url : this.params.url,
                    data : {
                        methodName : 'business',
                        actionType : 'get',
                        params : JSON.stringify([{
                            value : tableInfo.tableName,
                            type : 'STRING'
                        },{
                            value : tableInfo.tablePk,
                            type : 'STRING'
                        },{
                            value : pk || this.params.pkVal,
                            type : 'STRING'
                        }])
                    }
                }).success(function(data){
                    promise.resolve(data);
                }).error(function(data){
                    promise.reject(data);
                });
                return promise;
            }
        };
    });
    /*字表模块*/
    render.module('subList', 'datagrid', function(){
        var Promise = render.factory('Promise');
        return {
            params : {
                addParams : null,
                initParams : null,
                pagination : false
            },
            binds : [{
                selector : '.edit-btn',
                event : 'click',
                handler : 'edit'
            },{
                selector : '.save-btn',
                event : 'click',
                handler : 'save'
            },{
                selector : '.add-btn',
                event : 'click',
                handler : 'add'
            },{
                selector : '.del-btn',
                event : 'click',
                handler : 'del'
            },{
                selector : '.redo-btn',
                event : 'click',
                handler : 'redo'
            }],
            init : function(context, params){
                this.tableInfo = this.params.tableInfo;
                this._super(context, params);
            },
            handlerDblClickRow : function(){
                plat.datagrid.edit(this.grid);
            },
            loadGrid : function(params){
                if(!this.params.queryParams) this.params.queryParams = {};
                this.params.queryParams.params = JSON.stringify(params || this.params.initParams);
                if(this.params.queryParams.params == 'null') this.params.queryParams.params = undefined;
                this._super();
            },
            //改变initParams
            changeInitParams : function(params, isReplace){
                if(!params) params = [];
                if(params && !$.isArray(params)) return;
                if(isReplace && isReplace === true){
                    this.params.initParams = params;
                    return this;
                }
                if(!this.params.initParams) this.params.initParams = [];
                var initParams = this.params.initParams;
                $.each(params, function(i, item){
                    var flag = true;
                    $.each(initParams, function(i, param){
                        if(item.key == param.key){
                            initParams[i] = item;
                            return (flag = false);
                        }
                    });
                    if(flag){
                        initParams.push(item);
                    }
                });
                return this;
            },
            changeAddParams : function(params, isReplace){
                if(!params || !$.isPlainObject(params)) return;
                if(isReplace && isReplace === true){
                    this.params.addParams = params;
                    return this;
                }
                if(!this.params.addParams) this.params.addParams = {};
                this.params.addParams = $.extend(this.params.addParams, params);
                return this;
            },
            refresh : function(params){
                this.changeInitParams(params);
                this.loadGrid(this.params.initParams);
            },
            save : function(){
                var promise = new Promise();
                plat.datagrid.save(this.grid, function (){
                    promise.resolve.apply(promise, arguments);
                });
                return promise;
            },
            edit : function(){
                var promise = new Promise();
                plat.datagrid.edit(this.grid, null , function(indexs){
                    promise.resolve(indexs);
                });
                return promise;
            },
            add : function(){
                var promise = new Promise();
                plat.datagrid.add(this.grid, $.extend({}, this.params.addParams), function (index) {
                    promise.resolve(index);
                });
                return promise;
            },
            del : function(){
                var promise = new Promise();
                plat.datagrid.del(this.grid, function(){
                    promise.resolve();
                });
                return promise;
            },
            redo : function(){
                plat.datagrid.redo(this.grid);
            }
        };
    });
    /*list模块*/
    render.module('list', 'datagrid', function(){
        return {
            params : {
                initParams : null,
                autoGridHeight : 10,
                searchSelector : '#query-table'
            },
            binds :[{
                selector : '.search-btn',
                event : 'click',
                handler : 'search'
            },{
                selector : '.search',
                event : 'keyup',
                handler : function(e){
                    if(e.keyCode === 13){
                        this.search();
                    }
                }
            }],
            init : function(context, params){
                this.searchForm = $(this.params.searchSelector, context);
                this.bindEvent({
                    selector : this.params.searchSelector,
                    event : 'keyup',
                    handler : function(e){
                        if(e.keyCode === 13){
                            this.search();
                        }
                    }
                });
                this._super(context, params);
            },
            search : function(){
                 common.search(this.grid, this.searchForm, this.params.initParams);
            },
            handlerDblClickRow : function(index, rowData){
                this.emit('showDetail', rowData);//向上冒泡事件
            },
            loadGrid : function(params){
                if(!this.params.queryParams) this.params.queryParams = {};
                this.params.queryParams.params = JSON.stringify(params || this.params.initParams);
                if(this.params.queryParams.params == 'null') this.params.queryParams.params = undefined;
                this._super();
            },
            //改变initParams
            changeInitParams : function(params, isReplace){
                if(!params) params = [];
                if(params && !$.isArray(params)) return;
                if(isReplace && isReplace === true){
                    this.params.initParams = params;
                    return this;
                }
                if(!this.params.initParams) this.params.initParams = [];
                var initParams = this.params.initParams;
                $.each(params, function(i, item){
                    var flag = true;
                    $.each(initParams, function(i, param){
                        if(item.key == param.key){
                            initParams[i] = item;
                            return (flag = false);
                        }
                    });
                    if(flag){
                        initParams.push(item);
                    }
                });
                return this;
            },
            changeAddParams : function(params, isReplace){
                if(!params || !$.isPlainObject(params)) return;
                if(isReplace && isReplace === true){
                    this.params.addParams = params;
                    return this;
                }
                if(!this.params.addParams) this.params.addParams = {};
                this.params.addParams = $.extend(this.params.addParams, params);
                return this;
            },
            refresh : function(params){
                this.changeInitParams(params);
                this.loadGrid(this.params.initParams);
            }
        };
    });
    /*list-detail*/
    render.module('list-detail', 'base', {
        params : {
            listSelector : '#listDiv',
            detailSeletor : '#detailDiv',
            showDetailType : 'curPage', //详情显示方式 curPage 当前页面, dialog 弹窗显示
            detailUrl : null,
            detailTitle : '详情',
            dialogWidth : 800,
            dialogHeight : 600,
            appendUrlParams : null,
            relationDetailField : 'XH' //关联detail页面的字段名车
        },
        binds : [{
            selector : '.list-edit-btn',
            event : 'click',
            handler : function(){
                var rowData = this.listModule.grid.datagrid('getSelected');
                if(rowData){
                    this.showDetail(rowData);
                }else{
                    Layer.showMsg('请选择要编辑的行', 'info');
                }
            }
        },{
            selector : '.list-add-btn',
            event : 'click',
            handler : function(){
                this.showDetail();
            }
        },{
            selector : '.list-del-btn',
            event : 'click',
            handler : function(){
                if(this.listModule.params.tableInfo){
                    plat.datagrid.del(this.listModule.grid);
                }else{
                    var rowData = this.listModule.grid.datagrid('getSelected');
                    if (!rowData) {
                        Layer.showMsg('请先选择要删除的数据', 'info');
                        return;
                    }
                    var that = this;
                    Layer.showConfirm("是否确定删除?", function (index) {
                        Layer.closeLayer(index);
                        that.remove(rowData);
                        that.listModule.grid.datagrid('reload');
                    });
                }
            }
        },{
            selector : '.list-back-btn',
            event : 'click',
            handler : function(){
                this.emit('backList');//向上冒泡事件
            }
        }],
        init : function(context){
            this.state = 'add';//初始状态设为add
            var listJq = this.listJq = $(this.params.listSelector, context);
            var detailJq = this.detailJq = $(this.params.detailSeletor, context);
            this.listModule = listJq.render('getModule');
            this.detailModule = detailJq.render('getModule');
            if(this.listModule === null ){
                render.log.error('没有list模块这个模块无法正常运行');
                return;
            }
            //监听事件
            this.on('showDetail', function(e, data){
                this.showDetail(data);
                e.stop();//阻止事件继续向上冒泡
            });
            this.on('backList', this.back);
            listJq.show();
            detailJq.hide();
        },
        showDetail : function(data){
            switch (this.params.showDetailType){
                case 'curPage' :
                    this.listJq.hide();
                    this.detailJq.show();
                    if(data){
                        this.detailModule.transitionState('show', data[this.params.relationDetailField], this.params.relationDetailField, data);
                    }else{
                        this.detailModule.transitionState('add');
                    }
                    break;
                case 'dialog' :
                    var url = this.params.detailUrl;
                    if(data){
                        url = url + ( url.indexOf('?') !== -1 ? '&' : '?' ) + this.params.relationDetailField + '=' + data[this.params.relationDetailField];
                        var appendUrlParams = this.params.appendUrlParams;
                        if(appendUrlParams && $.isArray(appendUrlParams)) {
                            $.each(appendUrlParams, function(i, param){
                                if(data[param])url += '&' + param + '=' + data[param]
                            });
                        }
                    }
                    var listModule = this.listModule;
                    var index = Layer.openDialog(this.params.detailTitle, url, this.params.dialogWidth, this.params.dialogHeight, function(){
                        listModule.refresh();
                    });
                    break;
            }
        },
        remove : function(rowData){
            render.log.warn('没有具体的删除代码的实现');
            return null;
        },
        back : function(){
            this.listJq.show();
            this.detailJq.hide();
            this.listModule.refresh();//刷新grid
        }
    });
    /*detail*/
    render.module('detail', 'base', {
        params : {
            formModuleSelector : '#formDiv',
            subDetailSelector : '#subDetailDiv',
            refreshFormType : 'reload', //刷新form的方式 reload重新加载页面 ajax通过ajax请求 data直接填充data
            relationSubField : 'XH', //管理子信息的字段
            refreshSubType : 'reload' //刷新子信息的方法会 reload重新加载页面 ajax 调用子模块的refresh方法刷新
        },
        init : function(context, params){
            var formModuleJq = this.formModuleJq =  $(params.formModuleSelector, context);
            var subDetailJq = this.subDetailJq = $(params.subDetailSelector, context);
            if(formModuleJq.find('.render-loadPage').length > 0){
                this.formPage = formModuleJq.find('.render-loadPage:eq(0)').render('getModule');
                this.formUrl = this.formPage.url;
            }
            if(formModuleJq.hasClass('render-module')){
                this.formModule = formModuleJq.render('getModule');
            }else{
                this.formModule = formModuleJq.find('.render-module').render('getModule');
            }
            this.relationSubVal = $(':input[name=' + this.params.relationSubField + ']', this.formModule.form).val();
            this.transitionState('init');
            /*监听saveForm事件*/
            this.on('saveForm', function(e, form){
                if(e.target === this.formModule && this.state != 'show'){
                    this.relationSubVal = $(':input[name=' + this.params.relationSubField + ']', this.formModule.form).val();
                    this.transitionState('update', this.relationSubVal, this.params.relationSubField, common.form.getFormsData(this.formModule.form));
                    //e.stop();
                }
            });
        },
        transitionState : function(state){
            this.state = state;
            switch(state){
                case 'init' : //初始化状态
                    this.handlerInit();
                    break;
                case 'add' :
                    this.handlerAdd();
                    break;
                case 'show' :
                    this.handlerUpdate(arguments[1], arguments[2], arguments[3]);
                    break;
                case 'update' :
                    this.state = 'show';
                    this.subDetailJq.show();
                    this.showSub(arguments[1], arguments[2], arguments[3]);
                    break;
            }
        },
        handlerInit : function(){
            if(this.relationSubVal){
                this.relationSubVal = $(':input[name=' + this.params.relationSubField + ']', this.formModule.form).val();
                this.transitionState('update', this.relationSubVal, this.params.relationSubField, common.form.getFormsData(this.formModule.form));
            }else{
                this.transitionState('add');
            }
        },
        handlerAdd : function(){
            this.subDetailJq.hide();
            this.refreshForm();
        },
        handlerUpdate : function(relationVal, relationField, data){
            this.subDetailJq.show();
            this.refreshForm(relationVal, relationField, data);
            //后续操作
            this.showSub(relationVal, relationField, data);//显示子信息
        },
        /*刷新form*/
        refreshForm : function(relationVal, relationField, data){
            switch (this.params.refreshFormType){
                case 'reload' :
                    if(this.formPage) this.formPage.refresh(this.formUrl.indexOf('?') != 1 ? this.formUrl + '&' + relationField + '=' + relationVal : this.formUrl + '?' + relationField + '=' + relationVal );
                    break;
                case 'ajax' :
                    this.formModule.refresh(relationVal);
                    break;
                case 'data' :
                    this.formModule.refresh(data);
                    break;
            }
        },
        showSub : function(relationVal, relationField, data){
            render.log.warn('这里没有具体的实现');
        }
    });
    render.module('sideMenu', 'base', {
        params : {
            linkIdAttr : 'link',
            menuItemSelector : '.link-menu',
            curMenu : null,
            lazyShow : false,//延迟显示
            selectClass : 'on'
        },
        init : function(context, params){
            this._super(context, params);
            var panelIds = this.panelIds = [];
            var curMenu = this.curMenu = null; //当前显示的菜单
            $(params.menuItemSelector, context).each(function(i){
                var menuName = $(this).attr(params.linkIdAttr);
                var module = $('#' + menuName, context).render('getModule');
                if(i === 0 && !params.curMenu && menuName && module){
                    curMenu = menuName;
                }
                panelIds.push(menuName);
            });
            this.bindEvent({
                selector : params.menuItemSelector,
                event : 'click',
                handler : function(e, _this){
                    var menuName = $(_this).attr(params.linkIdAttr);
                    this.handlerShow(menuName);
                }
            });
            this.curMenu = curMenu;
            if(!this.params.lazyShow)this.handlerShow();
        },
        handlerShow : function(menuName){
            if(menuName) this.curMenu = menuName;
            if(this.beforeShow() === false) return;
            //隐藏所有的panel 移除selectClass
            this.$get(this.params.menuItemSelector + '.' + this.params.selectClass).removeClass('on');
            var menuJq = this.$get(this.params.menuItemSelector + '['+ this.params.linkIdAttr  + '=' + this.curMenu + ']').addClass(this.params.selectClass);
            $.each(this.panelIds, this.$call(function(i, id){
                var cur = $('#' + id);
                if(id == this.curMenu){
                    cur.show();
                }else{
                    cur.hide();
                }
            }));
            this.show(this.curMenu, menuJq);
        },
        beforeShow : function(){
            render.log.warn('这里没有具体的实现');
        },
        //显示之后的方法
        show : function(menuName, menuJq){
            render.log.warn('这里没有具体的实现');
        }
    });
})(jQuery, render);
