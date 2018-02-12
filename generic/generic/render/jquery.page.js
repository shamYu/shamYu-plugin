/**
 * Author : 刘宇阳
 * Date : 2015-12-05
 * Desc : jquery分页插件
 */
(function($){
	'use strict'; //启动严格模式 会对不规范的js写法检查并报错 IE10以上 ECMAscript 5
	$.render('page', {
		options: {
			showPageNum: 5, //现实page的num 例： 1 2 3 4 5 or 5 6 7 8 9
			pageSize: 10, //每页显示条数
			onloadSuccess: function() {}, //成功之后返回的函数
			url: '', //请求url
			params: {} //参数
		},
		createDom: function(element) {
			var template = '<ul class="pagination fl ">' +
				'<li data-page-num="first"><a href="javascript:;" title="第一页"><span>&laquo;</span></a></li>' +
				'<li data-page-num="last"><a href="javascript:;" title="最后一页"><span>&raquo;</span></a></li>' +
				'</ul>' +
				'<span class="page-text fl page-num">共0页</span>' +
				'<span class="page-text fl page-total">总0条</span>'+
				'<span class="page-text fl page-to">到第'+
				'<input type="number" min="1" onkeyup="this.value=this.value.replace(/\D/, \'\');" value="1" class="layui-laypage-skip" style="width:50px;height:30px;">'+
				'页 <input type="button" class="to-page" value="确定" /></span>';
			$(element).html(template);
			return element;
		},
		init: function(element, targetElement, options) {
			var page = $.extend(this, {
				element: element,
				total: 0, //总数
				data: {}, //返回的数据
				pageNum: 0, //总页数
				page: 1
			}, options);
			$(element).on('click', '.pagination li', function() {
				var pageNum = $(this).attr('data-page-num');
				if (pageNum === 'first') {
					page.toPage(1);
					return;
				}
				if (pageNum === 'last') {
					page.toPage(page.pageNum);
					return;
				}
				page.toPage(pageNum);
			});
			$(element).on('click', '.to-page', function() {
				var numObj = $('input[type=number]')[0];
				var pageNum = $(numObj).val();
				if(pageNum > 0 && pageNum <= page.pageNum){
					page.toPage(pageNum);
				}else{
					Layer.showAlert('请输入总页数以内的页码！');
				}
				
			});
			page.load();
		},
		destory : function(){
			this.data = undefined;//清空数据
			$(this.element).off().remove();
		},
		toPage: function(pageNum) {
			if (!pageNum || this.page === pageNum) return;
			this.page = Number(pageNum);
			this.load();
		},
		load: function(options) {
			if (this.busy) return; // 防止频繁点击
			this.busy = true;
			$.extend(this, options);
			var url = this.url;
			if (!url) return false;
			var data = this.params || {};
			data.page = this.page;
			data.rows = this.pageSize;
			var _this = this;
			var index = window.Layer ? window.Layer.loading() : 0;
			$.ajax({
				url: url,
				type: 'post',
				data: data,
				dataType: 'json',
				success: function(data) {
					_this.total = data.total ? data.total : data.length ? data.length : 0;
					_this.data = data;
					_this.pageNum = Math.ceil(_this.total / _this.pageSize);
					_this.domOption(); //dom操作
					if (!data || (data.rows && data.rows.length === 0) || (data.length && data.length === 0)) {
						$(_this.element).hide();
					} else {
						$(_this.element).show();
						if (_this.pageNum === 1) {
							$(_this.element).find('ul').hide();
						} else {
							$(_this.element).find('ul').show();
						}
					}
					if (_this.onloadSuccess && $.isFunction(_this.onloadSuccess))
						_this.onloadSuccess(data);
				},
				complete: function() {
					_this.busy = false;
					window.Layer ? window.Layer.closeLayer(index) : 0;
				}
			});
		},
		domOption: function() {
			this.changeHtml();
			$(this.element).find('.page-num').text('共' + this.pageNum + '页');
			$(this.element).find('.page-total').text('总' + this.total + '条');
		},
		changeHtml: function() {
			var page = this;
			var html = '<li data-page-num="{num}"><a href="javascript:;" class="{cur}">{num}</a></li>';
			var size = page.pageNum;
			var element = page.element;
			if (size > page.showPageNum) {
				size = page.showPageNum;
			}
			var liLength = $(element).find('li').length;
			if (liLength > 2) {
				$(element).find('li').each(function(i) {
					if (i > 0 && i < liLength - 1) {
						$(this).remove();
					}
				});
			}
			if (size === 0) return;
			var cpNum = Math.floor(Number(page.showPageNum) / 2);
			var startNum = Number(page.page) - Number(cpNum);
			var endNum = Number(page.page) + Number(page.showPageNum) - Number(cpNum) - 1;
			if (page.page <= cpNum) {
				startNum = 1;
				endNum = page.showPageNum;
			}
			if (page.pageNum <= page.showPageNum) {
				endNum = page.pageNum;
			} else if (page.pageNum - page.page <= cpNum) {
				startNum = Number(page.pageNum) - Number(page.showPageNum) + 1;
				endNum = page.pageNum;
			}
			var liHtml = '';
			//循环生成html
			for (var i = startNum; i <= endNum; i++) {
				var num = i;
				var cur = '';
				if (i === page.page) {
					cur = 'cur';
				}
				liHtml += html.replace(/\{cur\}/g, cur).replace(/\{num\}/g, num);
			}
			$(element).find('li:eq(0)').after(liHtml);
		}
	});
})(jQuery);