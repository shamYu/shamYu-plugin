(function($, render){
	'use strict'; //启动严格模式 会对不规范的js写法检查并报错 IE10以上 ECMAscript 5
	var util = render.util;
	// 获取获取jquery对象
	function getJq(element){
		if(arguments.length < 2) return null;
		var jq = $(element);
		for(var i = 1; i < arguments.length; i++){
			jq = jq.children(arguments[i]);
		}
		return jq;
	}
	function parseTabOptions(element) {
		return $.extend({
			show: false,
			dom : element,
			immediately: false, //是否立即加载
			canRemove: false,//是否可以删除
			onremove : util.noop,
			onloadSuccess : util.noop,
			onshow : util.noop
		},util.getOptions(element, {
			name :'',
			show: false,
			btns: []
		}, 'panel-options'));
	}
	/**
	 * 解析btns数组返回html字符串
	 */
	function parseBtns(name, btns) {
		var btnTpl = '<button class="{css}" name="{name}">{icon}{text}</button>';
		var btnHtml = '';
		if (btns) {
			if ($.isArray(btns)) {
				for (var i = 0; i < btns.length; i++) {
					btnHtml += parseBtn(name, btns[i]);
				}
			} else if ($.isPlainObject(btns)) {
				btnHtml += parseBtn(name, btns);
			}
		}

		function parseBtn(name, btn) {
			if (!name || !btn) return;
			var css = btn.css || 'btn btn-blue';
			var text = btn.text || '';
			var icon = btn.icon || '';
			if (icon !== '') {
				icon = '<span class="btn-icon ' + icon + '">&nbsp;</span>';
			}
			return btnTpl.replace(/\{name\}/, name).replace(/\{css\}/g, css).replace(/\{text\}/g, text).replace(/\{icon\}/, icon);
		}

		return btnHtml;
	}
	function Tab(panel, menuDom, btnDom){
		var tab = this;
		tab.panel = panel;
		tab.menuDom = menuDom;
		tab.btnDom = btnDom;
		var linkJq=tab.linkJq= menuDom.find('a');
		linkJq.attr('name', panel.name);
		//删除按钮控制
		if (panel.canRemove) {
			linkJq.after('<span class="pr10 remove">x</span>');
			tab.removeJq = linkJq.next('.remove');
		}
		this.initBtn();
		if(panel.url && $.trim(panel.url) !== ''){
			panel.loadPage = render.render(panel.dom, 'loadPage', {
				url : panel.url,
				lazyLoad : !panel.immediately,
				aysnc : !panel.immediately,
				onload : panel.onloadSuccess,
				iframe :  panel.iframe
			} , true);
			if(panel.immediately){
				panel.isLoad = true;
			}
		}
	}
	Tab.prototype.initBtn = function(){
		var btns = this.panel.btns;
		if(!btns || btns.length < 1) return;
		var btnHtml = '';
		if (btns && $.isArray(btns)) {
			btnHtml = parseBtns(this.panel.name, btns);
		}
		this.btnDom.append(btnHtml);
		var dom = this.panel.dom;
		//绑定事件
		this.btnDom.find('button[name="' + this.panel.name + '"]').each(function(i){
			$(this).click(function (e) {
				if (btns[i].click && $.isFunction(btns[i].click))
					btns[i].click.call(dom, e);
			});
		});
	};
	Tab.prototype.hide = function(){
		$(this.panel.dom).hide();
		this.linkJq.removeClass('selected');
		this.btnDom.find('button[name="' + this.panel.name + '"]').hide();
		this.panel.show = false;
	};
	Tab.prototype.show = function(){
		$(this.panel.dom).show();
		this.btnDom.find('button[name="' + this.panel.name + '"]').show();
		this.panel.show = true;
		this.linkJq.addClass('selected');
		if(this.panel.loadPage && !this.panel.isLoad){
			this.panel.loadPage.load();
			this.panel.isLoad = true;
		}
	};
	Tab.prototype.remove = function(){
		var panel = this.panel;
		var flag = null;
		if (panel.onremove && $.isFunction(panel.onremove)) {
			flag = panel.onremove(this); //触发删除事件
		}
		if (flag !== undefined && flag !== null && flag === false)return false;
		$(panel.dom).render('destory');//注销所有render组件
		$(panel.dom).remove();
		this.linkJq.unbind();
		this.menuDom.remove();
		this.btnDom.find('[name="' + panel.name +'"]').unbind().remove();
		return true;
	};
	$.render('tabs',{
		options : {
			removeMsg : '确定删除？',//删除提示信息
			scoller : null, //滚动条dom的选择器 默认是window，easyui一般是panel
			pin : 0
		},
		createDom : function(element){
			var tpl = '<div class="hd">'+
				'<i class="mark"></i>'+
				'<ul>'+
				'{tabMenu}' +
				'</ul>'+
				'<div class="tab-btns"></div>'+
				'</div>';
			var menuTpl = '<li><a href="javascript:void(0);">{text}</a></li>';
			var panelClassName = 'box-panel';
			var panelText = 'title';
			/**
			 * 删除子节点
			 * 不是div class = panelClassName 的元素
			 */
			$(element).children().each(function() {
				if ((this.tagName !== 'DIV' && this.tagName !== 'div') || !$(this).hasClass(panelClassName)) {
					$(this).remove();
				}
			});
			var tabMenu = ''; //定义菜单模版
			$(element).children('.' + panelClassName).each(function() {
				tabMenu = tabMenu += menuTpl.replace(/\{text\}/g, $(this).attr(panelText));
				$(this).attr(panelText, '');
			});
			$(element).addClass('bd-box').addClass('tab-box').wrapInner('<div class="tab-ctn"></div>').prepend(tpl.replace(/\{tabMenu\}/g, tabMenu));
			return element;
		},
		destory : function(){
			$(this.dom).find('a').off();
			$(this.dom).find('.remove').off();
			this.tabs = undefined;
			this.panels = undefined;
			$(this.dom).remove();
		},
		init : function(element, targetElement, options){
			var tabs = this;
			tabs.selectors = {
				content: '.tab-ctn', //content 选择器
				panel: '.box-panel', //panel选择器
				menu: '.hd', //menu选择器
				btns: '.tab-btns' //按钮组样式
			};
			tabs.activeClass = options.activeClass || 'selected';
			tabs.removeMsg = options.removeMsg || 'Delete ?'; //删除提示信息
			tabs.pin = options.pin || false;
			tabs.scroller = options.scroller;
			if (options && options.selectors && $.isPlainObject(options)) {
				tabs.selectors = $.extend(tabs.selectors, options);
			}
			tabs.showName = ''; //存储当前打开面板名称
			tabs.dom = element; //缓存DOM
			tabs.panels = {}; //存储面板,为了兼容以前的程序
			tabs.tabs = {}; //存储标签页 tab 包含 menu panel btns
			tabs._init();
		},
		_init : function(){
			var selectors = this.selectors;
			var tabsDom = this.dom;
			var panelJq = getJq(tabsDom, selectors.content, selectors.panel);
			var tabs = this;
			var firstName = null; //存储第一个panel的name
			panelJq.each(function(i) {
				var panel = parseTabOptions(this);
				if (!panel.name) console.log('必须定义panel name属性');
				if (!firstName) firstName = panel.name;
				var menuDom = getJq(tabsDom, selectors.menu).find('ul li:eq(' + i + ')');
				var btnDom = getJq(tabsDom, selectors.menu, selectors.btns);
				var tab = new Tab(panel, menuDom, btnDom);
				tabs.panels[panel.name] = panel;
				tabs.tabs[panel.name] = tab;
				if (panel.show) {
					tabs.showName = panel.name;
				}
				tab.hide();
				tabs.bind(tab);
			});
			if (!tabs.showName) tabs.showName = firstName;
			if (tabs.showName) tabs.show();
			if(tabs.pin){
				var scroller = $(tabs.scroller ? tabs.scroller : window);
				scroller.on('scroll', function(){
					var fixedJq = getJq(tabs.dom, tabs.selectors.menu),
						$tab = $(tabs.dom),
						screenRange = $tab.offset().top - $(window).scrollTop();//距离屏幕的距离

					if( screenRange < Number(tabs.pin) && screenRange > -($tab.height() - fixedJq.height())){
						fixedJq.css({
							position : 'fixed',
							top : tabs.pin + 'px',
							background : '#FFF',
							zIndex : 997,
							width : $tab.width()
						});
					}else{
						tabs.restore();
					}
				});//滚动固定顶部
			}
		},
		restore : function(){
			getJq(this.dom, this.selectors.menu).css({
				position : 'relative',
				top : '',
				zIndex : 0,
				width : '100%'
			});
		},
		bind: function(tab) {
			var tabs = this;
			//绑定事件
			tab.linkJq.click(function() {
				var name = $(this).attr('name');
				tabs.show(name);
			});
			//绑定事件
			if (!tab.removeJq) return;
			tab.removeJq.click(function() {
				var pname = $(this).prev().attr('name');
				if (window.Layer) {
					window.Layer.showConfirm(tabs.removeMsg, function(index) {
						window.Layer.closeLayer(index);
						tabs.removePanel(pname);
					});
				} else {
					tabs.removePanel(pname);
				}
			});
		},
		show: function(name) {
			if (name && name !== '' && name === this.showName) return;
			if (!name) {
				this.tabs[this.showName].show();
				return;
			}
			if (!this.tabs[name]) return;
			if (this.showName) this.tabs[this.showName].hide();
			this.showName = name;
			this.tabs[this.showName].show();
			var btnsW = getJq(this.dom, this.selectors.menu, this.selectors.btns).width();
			getJq(this.dom, this.selectors.menu, 'ul').css('marginRight', btnsW + 'px');
			this.restore();
			try {
				if (this.panels[this.showName].onshow && $.isFunction(this.panels[this.showName].onshow))
					this.panels[this.showName].onshow(this);
			} catch (e) {
				console.error(e);
			}
			return this;
		},
		addPanel: function(name, text, options, content) {
			if (!name || !options) return false;
			var panelTpl = '<div class="box-panel" name="{name}">{content}</div>';
			var liTpl = '<li><a href="javascript:void(0);" name="{name}">{text}</a></li>'.replace(/\{name\}/g, name).replace(/\{text\}/g, text);
			var contentHtml = '';
			this.removePanel(name);
			var panel = {
				name: name,
				show: false
			};
			if ($.isPlainObject(options)) {
				panel = $.extend(panel, options);
			} else {
				content = arguments[2];
			}
			if (content.outerHTML) {
				contentHtml = content.outerHTML;
			} else if (content.html) {
				contentHtml = content.get(0).outerHTML;
			} else {
				contentHtml = content;
			}
			panelTpl = panelTpl.replace(/\{name\}/g, name).replace(/\{content\}/g, contentHtml);
			var liJq = $(liTpl).appendTo(getJq(this.dom, this.selectors.menu, 'ul'));
			var dom = $(panelTpl).appendTo(getJq(this.dom, this.selectors.content));
			dom.render();
			panel.dom = dom.get(0);
			this.panels[name] = panel;
			var tab = new Tab(panel, liJq, getJq(this.dom, this.selectors.menu, this.selectors.btns));
			tab.hide();
			this.bind(tab); //绑定事件
			this.tabs[name] = tab;
		},
		removePanel: function(name) {
			if (!name || !this.tabs[name]) return;
			var flag = this.tabs[name].remove();
			if (!flag) return;
			delete this.tabs[name];
			delete this.panels[name];
			if (name === this.showName) {
				this.showName = getJq(this.dom, this.selectors.menu).find('ul li a:eq(0)').attr('name');
				if (this.showName)
					this.show();
			}
			return this;
		},
		refreshPanel : function(name, url){
			if(!name || !this.panels[name] || !url) return;
			var panel = this.panels[name];
			panel.url = url;//更新url
			var loadPage = panel.loadPage;
			if(loadPage)loadPage.refresh(url);//刷新面板
		}
	});
})(jQuery, render);