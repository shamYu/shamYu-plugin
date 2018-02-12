/**
 * Author : 刘宇阳
 * Date : 2015.12.02
 * Desc : 基于jquery的页面渲染插件
 **/
(function($){
	var uuid = 0;//唯一性的uuid
	var render = {
		componentMap : {}
	};//全局对象
	var interceptors = render.interceptors = [];//render的拦截器
	//添加拦截器方法
	/**
	 * onSingleElementRenderSuccess 单个元素渲染成功时（不包括子元素）
	 * onElementDestory 单个元素卸载时
	 * onBeforeElementRender 在元素渲染之前
	 * onElementRenderSuccess 在元素渲染及其子元素渲染完成后执行
	 * onDestory 卸载时
	 */
	render.addInterceptor = function(obj){
		if(obj && $.isPlainObject(obj)) interceptors.push(obj);
	};
	//执行拦截器
	render.doInterceptor = function(eventName){
		var params = Array.prototype.slice.call(arguments, 1);
		$.each(interceptors, function(i, interceptor){
			if(interceptor[eventName] && $.isFunction(interceptor[eventName])){
				try{
					interceptor[eventName].apply(interceptor, params);
				}catch(e){
					log.error(e);
				}
			}
		});
	};
	var config = render.config = {
		log : false,//显示是否打印日志
		mode : 'attr',//渲染模式 attr属性上标识  class用render-【name】class标识
		optionsName : 'options',//options参数的属性名称
		unRenderName : 'norender'
	};
	/**
	 * 定义渲染器方法
	 * @param  name
	 * @param  parentName 父类名称
	 * @param  [fun]
	 * @return null
	 */
	render.create = function(name) {
		if (!name || $.trim(name) === '' || arguments.length < 2) {
			log.error('参数有问题');
		}
		var parentName = null;
		var fun = null;
		if (arguments.length === 2) {
			fun = arguments[1];
		} else {
			parentName = arguments[1];
			fun = arguments[2];
		}
		var prop = typeof fun === 'function' ? fun() : typeof fun === 'object' ? fun : undefined; //执行方法返回render对象
		if (parentName && !render.componentMap.hasOwnProperty(parentName)) {
			log.error('没有这个父组件');
			return;
		}
		if (render.hasRender(name)) {
			log.warn(name + ' 这个组件已经被注册了！');
		}
		if (!prop.options) prop.options = {};
		Component.options[name] = parentName ? $.extend({}, Component.options[parentName], prop.options) : $.extend({}, Component.options.global, prop.options);
		var componentClass = parentName ? render.componentMap[parentName].extend(prop) : Component.extend(prop);
		render.componentMap[name] = componentClass;
		return componentClass;
	};
	render.hasRender = function(name){
		return render.componentMap.hasOwnProperty(name);
	};
	/**
	 * 渲染
	 * @param  {[type]} element    元素dom
	 * @param  {[type]} renderName 组件名称
	 * @param  {[type]} options    参数
	 * @param  {[type]} flag       是否createDom
	 * @return {[type]} components
	 */
	render.render = function(element, renderName, options, flag){
		if(!render.hasRender(renderName)){
			log.warn('This component does not exist. renderName:' + renderName);
			return;
		}
		$(element).addClass(config.unRenderName);
		options = $.extend({}, Component.options[renderName], options);
		var ComponentClass = render.componentMap[renderName];
		var newElem = flag ? ComponentClass.createDom(element, options) : element;
		var component = new ComponentClass(newElem, element, options);//实例化组件
		component.uuid = uuid++;
		component.$name = renderName.indexOf('-') === -1 ? renderName : util.toColumnStyle.call(renderName);
		if(options.name || options.id)
			getComponents(renderName)(options.name ? options.name : options.id, component);//存储组件
		component.name = options.name ? options.name : options.id;
		$(element).data('component', component);
		render.doInterceptor('onSingleElementRenderSuccess', element, component);//执行拦截器
		return component;
	};

	var destory = render.destory = function (element){
		var component = $(element).data('component');
		if(component){
			if(component.destory && $.isFunction(component.destory))component.destory();
			$(element).removeData('component');
			var func = render[component.$name];
			if(func && $.isFunction(func))func('destory', component.name);
			render.doInterceptor('onElementDestory', element, component.name);//执行拦截器
			component = null;//资源释放等待回收
		}
		$(element).find('.' + config.unRenderName).each(function() {
			render.destory(this);
		});
	};
	/**
	 *render方法处理
	 */
	function $render(name, element){
		//var targetJq = $(element);
		if (util.unRender(element, config.unRenderName))return;
		var options = util.getOptions(element, Component.options[name], config.optionsName);
		//执行createDom方法
		render.render(element, name, options, true);
		$compile(element);
	}
	/**
	 * 渲染DOM内的元素 递归渲染
	 * @param {Object} element dom元素
	 */
	function $compile(element) {
		render.doInterceptor('onBeforeElementRender', element);
		$(element).children().each(function() {
			var renderName = config.mode === 'attr' ? $(this).attr('render') : util.getRenderName(element);
			if (renderName && render.hasRender(renderName)){
				$render(renderName, this);
			}else{
				$compile(this); //不存在就扫描下级
			}
		});
		render.doInterceptor('onElementRenderSuccess', element);
	}

	/**
	 * 获取集合操作方法
	 * var create = getComponents('page');
	 * create('key',{});
	 * */
	function getComponents(componentName){
		var obj = render;
		var map = {};
		componentName = componentName.indexOf('-') === -1 ? componentName : util.toColumnStyle.call(componentName);
		return obj[componentName] ? obj[componentName] : (obj[componentName] = function(name, obj){
			if(name === 'destory' && obj && map[obj]){
				delete map[obj];
				return;
			}
			if(map[name] && !obj) return map[name];
			return (map[name] = obj);
		});
	}
	/*组件顶层class类*/
	/**
	 * 传递三个参数
	 * @param element 原始的dom节点
	 * @param options
	 * @param flag          是否跳过createDom的步奏
	 */
	var Component = function(){};
	//存储公共的参数
	Component.options = {
		global : {
			width : null,
			id : null,
			name : null
		}
	};
	/**
	 * 扩展方法
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	var initializing = false,
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/;
	Component.extend = function(obj){
		if(!obj && typeof obj !== 'object'){
			log.warn('Parameter is null or not Object, not registered');
			return;
		}
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		/*minxins处理*/
		if(obj.mixins && $.isArray(obj.mixins) && obj.mixins.length > 0){
			$.each(obj.mixins, function(i, item){
				if($.isPlainObject(item)){
					obj = $.extend(item, obj);
				}
			});
			delete obj.mixins;
		}
		/*对象继承处理*/
		for (var name in obj) {
			if(name === 'options' || name === 'createDom' || name === 'mixins')continue;
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
		function Class(element, targetElement, options){
			if(element && this.init){
				this.options = options;//存储options
				this.element = this.element;
				this.targetElement = this.targetElement;
				this.init(element, targetElement, options);
			}
		}
		Class.prototype = prototype;
		Class.prototype.constructor = Component;
		Class.extend = arguments.callee;
		Class.createDom = obj.createDom || this.createDom || function(element){return element;};//全局create方法
		return Class;
	};
	/*
	 *工具函数
	 */
	var util = render.util = {};
	//判断元素是否是render标记的元素
	util.hasRender = function(element){
		var flag = false;
		if(config.mode === 'attr'){
			flag = $(element).attr('render') && $(element).attr('render') !== 'true' && $(element).attr('render') !== 'false';
		}else if(config.mode === 'class'){
			flag = $(element).attr('class') && $(element).indexOf('render-') !== -1;
		}
		return flag;
	};
	util.setRender = function(element, name){
		if(config.mode === 'attr'){
			$(element).attr('render', name);
		}else{
			$(element).addClass('render-' + name);
		}
	};
	util.getRenderName = function(element){
		var classNames = $(element).attr('class') ? $(this).attr('class').split(' ') : false;
		var renderName = null;
		if (classNames) {
			$.each(classNames, function(i, str) {
				if (str.indexOf('render-') !== -1) {
					renderName = str.substring(str.indexOf('render-') + 'render-'.length);
					return false;
				}
			});
		}
		return renderName;
	};
	util.getOptions = function(element, defaultOptions, optionsName){
		if(!defaultOptions || !element)return;
		var options = {};
		for(var key in defaultOptions){
			if(defaultOptions.hasOwnProperty(key))
				options[key] = $(element).attr(key);
		}
		var optionsStr = $(element).attr(optionsName);
		if(optionsStr){
			options = $.extend(options, util.parseOptions(optionsStr));
		}
		return options;
	};
	util.parseOptions = function(str, flag){
		try{
			if(!flag) str = '{' + str + '};';
			var tempFunc = new Function('return' + str);
			return tempFunc();
		}catch(e){
			log.error('option解析出错 ：' + str, e);
		}
	};
	util.endWith = function(s) {
		if (s === null || s === '' || this.length === 0 || s.length > this.length)
			return false;
		if (this.substring(this.length - s.length) === s)
			return true;
		else
			return false;
		return true;
	};
	util.startWith = function(s) {
		if (s === null || s === '' || this.length === 0 || s.length > this.length)
			return false;
		if (this.substr(0, s.length) === s)
			return true;
		else
			return false;
		return true;
	};
	util.toColumnStyle = function() {
		var index=this.indexOf('-');
		if(index === -1) return this;
		var temp = this.substring(0, index);
		var temp2 = this.substring(index + 1, index + 2).toUpperCase();
		var temp3 = this.substring(index + 2);
		return util.toColumnStyle.call(String(temp + temp2 + temp3));
	};
	util.merge = function(){
		var args = Array.prototype.slice.call(arguments,0);
		args.unshift({});
		return $.extend(null, args);
	};
	util.unRender = function(element, unRenderName){
		return $(element).attr(unRenderName) || $(element).hasClass(unRenderName);
	};
	util.ensure = function (obj, name, factory) {
		return obj[name] || (obj[name] = factory());
	};
	util.setWidth = function(element, width){
		if (width) {
			if (util.endWith.call(width,'%') || util.endWith.call(width, 'px'))
				$(element).css('width', width);
			else
				$(element).css('width', width + 'px');
		}
	};
	util.replaceDom = function(element, html){
		var newElem = $(html).insertAfter(element).get(0); //替换
		$(element).remove();
		return newElem;
	};
	util.noop = function(){};
	/**
	 * 日志处理对象
	 * @type {Object}
	 */
	var log = render.log = {};
	(function createLogFunction(log, arr){
		$.each(arr, function(i, level){
			log[level] = function(msg){
				var flag = false;
				if(window.console && config.log){
					if($.isArray(config.log)){
						$.each(config.log, function(i,item){
							if(level === item){
								return !(flag = true);
							}
						});
					}else{
						if(config.log === true || config.log === level){
							flag = true;
						}
					}
				}
				if(flag)console[level](msg);
			};
		});
	})(log, ['info', 'log', 'error', 'warn']);

	var jqMethod = (function createJqMehtod(context){
		return util.ensure(context, 'jqMethod', function(){
			var methods = {};
			return function(name, func){
				if(!name) return methods;
				if(name && !func) return methods[name];
				if(!$.isFunction(func)) return;
				if(methods[name]) log.warn('这个方法已经被注册！');
				methods[name] = func;
			};
		});
	})(render);
	/**
	 * 插件处理
	 * @param name 插件名称
	 * @param fun 插件执行方法，render[name] = fun
	 */
	render.install = function(name, fun){
		if(!name || !fun) return null;
		this[name] = $.isFunction(fun) ? fun.call(null) : fun;
	};
	$.fn.render = function(type){
		if(this.length === 0) return;
		if(!type){
			var name = config.mode === 'attr' ? this.attr('render') : util.getRenderName(this.get(0));
			if (name && render.hasRender(name)){
				$render(name, this.get(0));
			}else{
				$compile(this.get(0)); //不存在就扫描下级
			}
			return;
		}
		if(type == true){
			$compile(this.get(0));
			return;
		}
		switch(type){
			case 'get' : //获取render对象
				return this.data('component');
			case 'destory' : //销毁组件及其子组件
				if(arguments[1] === true){
					this.children().each(function(){
						destory(this);
					});
				}else{
					destory(this.get(0));
				}
				render.doInterceptor('onDestory', this.get(0));
				break;
			case 'render' :
				var renderName = arguments[1];
				var options = arguments[2];
				this.each(function(){
					render.render(this, renderName, options, true);
				});
				break;
			default :
				var method = jqMethod(type);
				if(method && $.isFunction(method)){
					return method.apply(this, Array.prototype.slice.call(arguments, 1));
				}
				break;
		}
	};
	$.extend({
		render : render.create
	});
	window.render = render;
})(jQuery);