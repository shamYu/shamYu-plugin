/**
 * author : 刘宇阳
 * date : 2015/12/15
 * desc : 钉住页面组件
 */
(function ($, render) {
    'use strict'; //开启严格检查
    $.render('pin',{
        options : {
            top : 0,//指定距离顶部的距离
            container : null,//指定固定在哪个容器内部默认是父容器
            scroller : null //指定拥有滚动条的元素，
        },
        init : function(element, targetElement, options){
            this.fixedJq = $(element);
            this.container = options.container ? $(options.container) : $(element).parent();
            this.top = options.top;
            this.position = this.fixedJq.position();
            this.scroller = options.scroller ? $(options.scroller) : window;
            var that = this;
            $(this.scroller).on('scroll', function(){
                that.onscoll();
            });
        },
        onscoll : function(){
            var form = this.top || 0;
            var to = -(this.container.height() - this.fixedJq.height());
            if(this.fixedJq.height() == 0) return;
            var range = Number(this.container.offset().top) - Number($(window).scrollTop());
            if(range < Number(form) && range > to){
                this.fixedJq.css({
                    position : 'fixed',
                    top : form,
                    zIndex : 997,
                    left : this.fixedJq.offset().left,
                    width : this.fixedJq.outerWidth()
                });
            }else if(range <= to){
                this.fixedJq.css({
                    position : 'absolute',
                    top : -to + this.position.top,
                    zIndex : 997,
                    left : ''
                });
            }else{
                this.restore();
            }
        },
        restore :  function(){
            this.fixedJq.css({
                position: '',
                top: '',
                zIndex : '',
                width: '',
                left: ''
            });
        },
        destory : function(){
            $(this.scroller).off('scroll');
        }
    });
})(jQuery, render);