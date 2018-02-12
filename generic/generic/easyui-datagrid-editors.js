/**
 * author : 刘宇阳
 * date : 2015/12/7
 * desc : easyui datagrid editors扩展
 */
(function ($, render) {
    function bindEvent(jq, options){
        if(!options || !$.isPlainObject(options))return;
        var events = ["onblur", "onchange", "onclick", "ondblclick", "onfocus", "onhelp" ,
            "onkeydown", "onkeypress", "onkeyup", "onmousedown", "onmousemove",
            "onmouseout", "onmouseover", "onmouseup", "onselect"];
        for(var i = 0; i < events.length; i++){
            var event = events[i];
            var handler = options[event];
            if(handler && $.isFunction(handler)){
                jq.bind(event.substring(2), handler);
            };
        }
    }
    $.extend($.fn.datagrid.defaults.editors, {
        /**
         * 扩展date editor
         * 支持格式
         * yyyy, yyyy-MM, yyyy-MM-dd, yyyy-MM-dd hh, yyyy-MM-dd hh:mm, yyyy-MM-dd hh:mm:ss
         */
        date:{
            init: function(container, options){
                var input = $('<input class="datagrid-editable-input Wdate" readonly style="height: 30px;" >').appendTo(container);
                options = options || {};
                var fmt = options.fmt || "yyyy-MM-dd";
                input.click(function(){
                    WdatePicker($.extend({
                        dateFmt : fmt.replace(/hh/i, 'HH')
                    }, options.options ? options.options : {}));
                });
                input.data('fmt', fmt);
                return input.validatebox(options);
            },
            getValue: function(target){
                return $(target).val();
            },
            setValue: function(target, value){
                var fmt = $(target).data('fmt');
                if(value && typeof value === 'object' && value.time)
                    value = new Date(value.time).dateFormat(fmt);
                $(target).val(value);
            },
            resize: function(target, width){
                var input = $(target);
                input.css('width', width + 'px');
            }
        },
        text: {
            init : function(container, options){
                var input = $('<input class="datagrid-editable-input form-input text" >').appendTo(container);
                bindEvent(input, options);
                input.prop('readOnly', options && options.readOnly);
                input.focus(function(){
                    $('.day-content').hide();
                });
                return input.validatebox(options);
            },
            getValue: function(target){
                return $(target).val();
            },
            setValue: function(target, value){
                $(target).val(value);
            },
            resize: function(target, width){
                var input = $(target);
                input.css('width', width + 'px');
            }
        },
        validatebox: {
            init : function(container, options){
                var input = $('<input class="datagrid-editable-input form-input text" >').appendTo(container);
                bindEvent(input, options);
                input.prop('readOnly', options && options.readOnly);
                input.focus(function(){
                    $('.day-content').hide();
                });
                return input.validatebox(options);
            },
            getValue: function(target){
                return $(target).val();
            },
            setValue: function(target, value){
                $(target).val(value);
            },
            resize: function(target, width){
                var input = $(target);
                input.css('width', width + 'px');
            }
        },
        combobox : {
            init : function(container, options){
                var input = $('<input>').appendTo(container);
                if(!options)options = {};
                options.readOnly = options.editable === false ? true : false;
                var component = render.render(input[0], 'combobox', options, true);
                $(component.dom).find(':text').addClass('datagrid-editable-input').validatebox({
                    required : options.required || false,
                    validType : options.validType || []
                });
                $(window).on('mousewheel',function(){
                    setTimeout(function(){
                        component.position(component.element, $(component.element).find('.combo-select')[0]);
                    },20);
                });
                return input;
            },
            getValue : function(target){
                return $(target).render('get').val();
            },
            setValue : function(target, value){
                $(target).render('get').val(value);
            },
            resize : function(target, width){
            },
            destory : function(target){
                var component = $(target).render('get');
                $(target).removeData('component');
                component.destory();
            }
        },
        multiselect : {
            init : function(container, options){
                var input = $('<input>').appendTo(container);
                var component = render.render(input[0], 'multiselect', options, true);
                $(component.dom).find(':text').addClass('datagrid-editable-input').validatebox({
                    required : options.required || false,
                    validType : options.validType || []
                });
                $(window).on('mousewheel',function(){
                    setTimeout(function(){
                        component.position(component.element, $(component.element).find('.ms-content')[0]);
                    },20);
                });
                $('.datagrid-row').click(function(){
                    $(component.dom).find('.ms-content:eq(0)').hide();
                });
                return input;
            },
            getValue : function(target){
                return $(target).render('get').val();
            },
            setValue : function(target, value){
                return $(target).render('get').val(value);
            },
            resize : function(){},
            destory : function(target){
                var component = $(target).render('get');
                $(target).removeData('component');
                component.destory();
            }
        }
    });
})(jQuery, render);