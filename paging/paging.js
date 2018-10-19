/**
 * 分页组件
 * @author 余旺
 * @Date 2018-10-19
 */
(function($){
	Pages.default = {
	        pageSize: 5,
	        totalNum: 15,      //总共的条数
	        selectedPage: 1,     //选中第几页
	        selectBack:function(){}//选中后的回调
	    }
	    function Pages($element, option) {
	        this.pages = {}; //
	        this.$element = $element;
	        var op = this.option = $.extend({}, Pages.default, option);

	        var totalNum = op.totalNum;
	        var pageSize = op.pageSize;
	        var totalPage = parseInt(Math.ceil(totalNum / pageSize));
	        var pageHtml = '<ul class="page-turn">';
	        pageHtml += '<li data-value="prev"><a href="javascript:void(0)">上一页</a></li>'
	        if (totalPage > 0) {
	            for (var p = 1; p <= totalPage; p++) {
	                pageHtml += '<li data-value=' + p + '><a href="javascript:void(0)">' + p + '</a></li>';
	            }
	            pageHtml += '<li data-value="next"><a href="javascript:void(0)">下一页</a></li>';
	            pageHtml += '<li data-value="last"><a href="javascript:void(0)">最后一页</a></li>';
	            pageHtml += '<li><a href="javascript:void(0)">共 ' + totalPage + '页</a> <a>' + totalNum + '条记录</a></li>';
	        }
	        pageHtml += '</ul>';
	        $element.html(pageHtml);
	        var self = this;
	        var selectedPage = op.selectedPage;
	        $('.page-turn li', $element).removeClass('on');//移除所有选中
	        $('.page-turn li', $element).eq(selectedPage).addClass('on');//选中的页数加上class  on

	        //事件监听
	        $element.on('click', '.page-turn li', function () {
	            var value = $(this).attr('data-value');
	            if (!value || value == op.selectedPage) {
	                return false
	            }
	            if(value == 'prev'){
	                value = op.selectedPage - 1;
	                if(value < 1){
	                    alert("前面没有路了，请往后面走，谢谢");
	                    return
	                }
	            };
	            if(value == 'next'){
	                value = op.selectedPage + 1;
	                if(value > totalPage){
	                    alert("后面没有路了，请往前面走，谢谢");
	                    return
	                }
	            };
	            if(value == 'last')value = totalPage;
	            self.changePage($element, value,op);
	        })
	    }

	    Pages.prototype.changePage = function (element, pageNum,op) {
	        element.find('.page-turn li').eq(pageNum).addClass('on').siblings().removeClass('on');
	        op.selectBack(pageNum);
	        this.option.selectedPage = pageNum;
	    }

	    $.fn.pages = function (options) {
	        new Pages(this, options)
	    }
})(Jquery)

   //示例
   /* $(function () {
        $('#pages').pages({
            pageSize: 10,        //每页的多少条
            totalNum: 80,      //总共的条数
            selectBack:function(num){
            }     
        })
    })*/