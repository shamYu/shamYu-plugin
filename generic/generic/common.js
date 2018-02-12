/**
 * author : 刘宇阳
 * date : 2015/6/25
 * desc : 公共js代码
 * depend : jquery JSON power
 */
//定义对象
if(typeof common !== 'object'){
    var common = {};
}

(function ($) {
    'use strict'; //启动严格模式 会对不规范的js写法检查并报错 IE10以上 ECMAscript 5
    var ajaxId = "ajax"; //存储ajax的div id;
    var param = "param"; //参数传递的param ='type:"", logicSymbol:"", connectSymbol:"", bracketType:""'
    ajaxInit(); //初始化ajax配置
    common.ajaxInit = ajaxInit;
    /**
     * ajax请求方法
     * {
     * type //请求类型 save delete query service 默认值service
     * url  请求的url 可以传id或url字符串
     * async 同步或者异步
     * data  请求附带参数
     * success 业务执行成功后执行的函数
     * fail    业务执行失败后执行的函数
     * error  ajax请求出错是执行的函数
     * complete ajax请求完成执行函数
     * }
     * 支持promise方式
     * common.ajax({
     * }).addParam()
     * .success(function(){})
     * .fail(function(){})
     * .error(function(){});
     * promise部分待完善
     * @param options
     */
    common.ajax = function(options){
        if(!options) options = {};
        if(!options.params)options.params = [];
        /**
         * promise对象
         * @type {{success: Function, error: Function, complete: Function}}
         */
        var promise = {
            success : function(fun){
                if(fun && $.isFunction(fun)){
                    options.success = fun;
                }
                return this;
            },
            error : function(fun){
                if(fun && $.isFunction(fun)){
                    options.error = fun;
                }
                return this;
            },
            complete : function(fun){
                if(fun && $.isFunction(fun)){
                    options.complete = fun;
                }
                return this;
            },
            /**
             * 添加参数
             * @param data 参数 可以是值， 也可以是对象
             *   1 or '1111'  or  {
             *              key:
             *              value:
             *              type:
             *          }
             *          or key,value,type
             * @returns {promise}
             */
            addParam : function(data){
                if(data === undefined || data === null) return this;
                if(arguments.length == 3){
                    options.param.push({
                        key : arguments[0],
                        value : arguments[1],
                        type : arguments[2]
                    });
                }else if($.isPlainObject(data)){
                    options.params.push(data);
                }else{
                    var type = getType(data);
                    var obj = {};
                    obj.value = data;
                    switch (type){
                        case 'String' :
                            obj.type = 'STRING';
                            break;
                        case 'Array' :
                            obj.type = type;
                            obj.value = '';
                            for(var i = 0; i < data.length; i++){
                                obj.value = obj.value + data[i] + ',';
                            }
                            obj.value = obj.value.substring(0, obj.value.length - 1);
                            break;
                        case 'Date' :
                            obj.type = 'DATE';
                            obj.value = String(data.getFullYear()) + '-' + String(data.getMonth() + 1) + '-' +  String(data.getDate());
                            break;
                        case 'Number' :
                            obj.type = 'INTEGER';
                            if(String(data).lastIndexOf('.') != -1){
                                obj.type = 'FLOAT';
                            }
                            break;
                        default :
                            alert('传递的类型不对哦');
                            break;
                    }
                    options.params.push(obj);
                }
                return this;
            },
            addParams : function(arr){
                if($.isArray(arr)){
                    for(var i = 0; i < arr.length; i++){
                        options.params.push(arr[i]);
                    }
                }
                return this;
            }
        }
        //异步处理
        setTimeout(function(){
            service(options);
        }, 0)
        //返回promise对象
        return promise;
    };
    /**
     * 配合datagrid使用的查询方法
     */
    common.search = function (dataGrid, form, initParams) {
        var dataGridSelector = $.type(dataGrid) === 'string' ? dataGrid.substring(0,1) === '#' ? $(dataGrid) : $('#' + dataGrid) : $(dataGrid);
        var formSelector = $.type(form) === 'string' ? form.substring(0,1) === '#' ? $(form) : $('#' + form) : $(form);
        var params = new Array();
        $(formSelector).find(':input[name]').each(function () {
            var key = $(this).attr('name');
            if (key) {
                var value = $(this).val();
                if ($(this).attr(param)) {
                    var paramObj = getObject($(this).attr(param)) || {};
                    var type = paramObj.type || 'STRING';
                    var logicSymbol = paramObj.logicSymbol || 'Like';
                    var connectSymbol = paramObj.connectSymbol || 'And';
                    var bracketType = paramObj.bracketType || 'NONE';
                    params.push({
                        key: key,
                        value: value,
                        type: type,
                        logicSymbol: logicSymbol,
                        connectSymbol: connectSymbol,
                        bracketType: bracketType
                    });
                } else {
                    params.push({
                        key: key,
                        value: value,
                        type: 'STRING',
                        logicSymbol: $(this).attr('type') == 'text' ? 'Like' : 'Equals',
                        connectSymbol: 'And',
                        bracketType: 'NONE'
                    });
                }
            }
        });
        if(!initParams || !$.isArray(initParams)) initParams = [];
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
        $(dataGridSelector).datagrid('reload', {
            params: JSON.stringify(initParams)
        });
    };
    /**
     * 判断是否存在的公共方法
     * @param url
     * @param params
     * @returns true/false;
     */
    common.isExist = function(url, params, sql, callback){
        var data = {};
        if(sql && sql != ''){
            data.sql = sql;
        }
        common.ajax({
            url : url,
            type : 'exist',
            data : data,
            params : params
        }).success(
            function(result){
                callback(result && result == 1 ? true : false);
            }
        );
    };
    /**
     * 表单操作集合
     * @type {{}}
     */
    common.form = {
        /**
         * 获取表单数据
         * @param forms
         * @param obj
         * @returns {{}}
         */
        getFormsData : function(forms) {
            var dataObj = {};
            var formId = forms;
            if (formId) {
                var formJq = $.type(formId) === 'string' ? formId.substring(0,1) === '#' ? $(formId  + ' :input') : $('#' + formId + ' :input') : $(':input', formId);
                formJq.each(function() {
                    if ($(this).attr('name')) {
                        var type = $(this).attr('type');
                        var value = '';
                        switch (type){
                            case 'checkbox' :
                                if($(this).is(':checked')){
                                    if(dataObj[$(this).attr('name')]){
                                        value = $(this).val();
                                    }else{
                                        value = dataObj[$(this).attr('name')] + ',' + $(this).val();
                                    }
                                }
                                break;
                            case 'radio':
                                if($(this).is(':checked')){
                                    value = $(this).val();
                                }else{
                                    value = 'noIn';
                                }
                                break;
                            default :
                                value = $(this).val();
                                break;
                        }
                        if(value != 'noIn'){
                            dataObj[$(this).attr('name')] = value;
                        }
                    }
                });
            }
            return dataObj;
        },
        /**
         * 填充数据到html里
         * @param formId 区域的ID
         * @param data  数据
         */
        fillForm : function(formId, data){
            if (formId && data) {
                var core = this;
                var formJq = $.type(formId) === 'string' ? formId.substring(0,1) === '#' ? $(formId  + '  [name]') : $('#' + formId + '  [name]') : $(' [name]', formId);
                formJq.each(function() {
                    var attrName = $(this).attr('name');
                    if (attrName) {
                        var srcVal = data[attrName];
                        if(data[attrName] == undefined && $(this).val()) return;//如果属性在数据里不存在且，原本有值，就不填充
                        if($(this).is(':input')){
                            if($(this).hasClass('norender')){
                                var component = $(this).render('get');
                                if(component){
                                    component.val(srcVal || '');
                                    return;
                                }
                            }
                            var type = $(this).attr('type');
                            switch (type){
                                case 'checkbox':
                                    if(srcVal){
                                        srcVal = $.isArray(srcVal) ?  srcVal : srcVal.split(',');
                                        for(var i = 0; i < srcVal.length; i++){
                                            if($(this).val() == srcVal[i]){
                                                $(this).prop('checked', true);
                                                break;
                                            }else{
                                                $(this).prop('checked', false);
                                            }
                                        }
                                    }else{
                                        $(this).prop('checked', srcVal == $(this).val());
                                    }
                                    break;
                                case 'radio' :
                                    $(this).prop('checked', srcVal == $(this).val());
                                    break;
                                default :
                                    $(this).val(srcVal || '');
                                    break;
                            }
                        }else{
                            $(this).text(srcVal || '');
                        }
                    }
                });
            }
        },
        /**
         * 清空区域内所有带有name属性的标签值
         */
        clearForm : function(formId){
            if (formId) {
                var formJq = $.type(formId) === 'string' ? formId.substring(0,1) === '#' ? $(formId  + ' [name]') : $('#' + formId + ' [name]') : $('[name]', formId);
                formJq.each(function() {
                    if(!$(this).attr('noclear')){
                        if($(this).is(':input')){
                            if($(this).hasClass('norender')){
                                var component = $(this).render('get');
                                if(component){
                                    component.val('');
                                    return;
                                }
                            }
                            var type = $(this).attr('type');
                            switch (type){
                                case 'checkbox' :
                                case 'radio' :
                                    $(this).removeProp("checked");
                                    break;
                                default :
                                    $(this).val('');
                                    break;
                            }
                        }else{
                            $(this).text('');
                        }
                    }
                });
            }
        },
        /**
         * 验证
         * @param id
         * @returns {*|验证结果}
         */
        validate : function(id){
            var $form = $.type(id) === 'string' ? id.substring(0,1) === '#' ? $(id) : $('#' + id) : $(id);
            $form.form("enableValidation");
            return power.validateForm($form);
        }
    }

    /**
     * 模板转换
     */
    common.tpl = {
        reg :  /\{.*?\}/g,//只允许{}包起来的值
        formatFuns : {}, //格式化方法集合
        //添加format代码
        addFormat : function(name, fun){
            if(name && fun && $.isFunction(fun)){
                this.formatFuns[name] = fun;
            }
        },
        replace : function(tpl, data){
            var keyTpls = tpl.match(this.reg);
            var dataArr = data;
            if(!$.isArray(data)){
                dataArr = [];
                dataArr.push(data);
            }
            var html = '';
            for(var n = 0; n  < dataArr.length; n++){
                var temphtml = tpl;
                if(keyTpls && keyTpls.length > 0){
                    for(var i = 0; i < keyTpls.length; i++){
                        var exp = keyTpls[i] && keyTpls[i].length > 2 ? keyTpls[i].substring(1,  keyTpls[i].length-1) : false; //获取表达式
                        if(exp){
                            if(exp == '$index'){
                                temphtml = temphtml.replace(keyTpls[i], n + 1);
                                continue;
                            }
                            var expArr  = exp.split('|');
                            var key = $.trim(expArr[0]);
                            var value = getValue(dataArr[n], key);
                            //执行format
                            if(expArr.length > 1){
                                for(var j = 1; j < expArr.length; j++){
                                    var formatkey = $.trim(expArr[j]);
                                    value = this.formatFuns[formatkey](value); //将参数传进去
                                }
                            }
                            temphtml = temphtml.replace(keyTpls[i], value);//替换模板变成算式
                        }
                    }
                }
                html += temphtml;
            }

            return html;
        }
    };

    /**
     * datagrid常用操作
     */
    common.grid = {
        formatDate : function(value, fmt){
            if(value && value.time){
                return power.dateFormat(new Date(value.time), fmt || 'yyyy-MM-dd');
            }
            return '';
        },
        format : function(value,rowData,rowIndex){
            var $this = $(this), $thisEditor = $this[0]["editor"];
            var $thisOptions = $thisEditor["options"];
            var $data = "";
            var type = $thisEditor.type;
            $thisOptions = $thisOptions || {};
            if("date" == type){
                var fmt = $thisOptions.fmt || "yyyy-MM-dd";
                if(power.isNotEmpty(value)){
                    if(typeof value == "object"){
                        value = power.dateFormat(new Date(value.time), fmt);
                    }
                }
                return value;
            }else if("combobox" == type || "select" == type){
                $data = $($thisOptions["data"]);
                var text;
                $data.each(function(){
                    if(this[$thisOptions.valueField] == value){
                        text = this[$thisOptions.textField];
                    }
                });
                return text;
            }else if("multiselect" == type){
                $data = $($thisOptions["data"]);
                var text = [];
                if(!value)return '';
                $data.each(function(){
                    if(value.indexOf(this[$thisOptions.valueField]) != -1){
                        text.push(this[$thisOptions.textField]);
                    }
                });
                return text;
            }
        },
        /**
         * datagrid自适应高度
         * 前提在list-box样式下
         * @param datagrid 元素对象
         * @param padding //传一个数字代表要减去的padding
         * @param flag//强制重设高度
         */
        autoHeight: function(datagrid, padding, flag){
            var isAuto = $(datagrid).data("isAuto");
            if(!isAuto || flag){
                var listBox = $(datagrid).parents('.list-box:eq(0)');
                if(listBox.length > 0){
                    var wh = $(window).height();
                    var t = listBox.offset().top;
                    if(t > 0 ){
                        var height = wh - t - 10;
                        if(padding){
                            height -= padding;
                        }
                        $(datagrid).parents('.list-box:eq(0)').height(height);
                        setTimeout(function(){$(datagrid).datagrid('resize');},200); //异步执行，
                    }
                    var isBind = $(datagrid).data('isBind');
                    if(!isBind){
                        $(window).resize(function(){
                            common.grid.autoHeight(datagrid, padding, true);
                        });
                        $(datagrid).data('isBind', true);
                    }
                }
            }
        },
        autoResize : function(datagrid, padding){
            var isBind = $(datagrid).data('isBind');
            if(!isBind){
                $(window).resize(function(){
                    setTimeout(function(){$(datagrid).datagrid('resize');},200); //异步执行
                });
                $(datagrid).data('isBind', true);
            }
        }
    };

    /**
     * service 对数据曾删改查的操作
     * {
     * type           //操作类型 save delete query
     * url
     * async
     * data
     * success
     * }
     * @param
     */
    function service(options) {
        if (!options.type) options.type = 'service';
        var params = $.extend({}, options);
        params.url = getUrl(options.url);
        switch (options.type){
            case 'exist' :
                if(!params.data)params.data = {};
                params.data.params = JSON.stringify(options.params);
                params.success = function (data) {
                    if (options.success && data) {
                        options.success(data.result);
                    }
                }
                break;
            case 'query' :
            case 'service' :
                if(!params.data)params.data = {};
                if(!params.data.params){
                    params.data.params = JSON.stringify(options.params);
                }
                params.success = function (data) {
                    if (data) {
                        if (options.success) {
                            options.success(data.result ? data.result : null);
                        }
                    }
                };
                break;
            case 'save' :
                if(!params.url) params.url = getUrl('saveURL');
                params.success = function(data){
                    if(data){
                        //保存成功
                        if(options.success)
                            options.success(data);
                    }
                };
                break;
            case 'delete' :
                if(!params.url) params.url = getUrl('deleteURL');
                params.success = function(data){
                    if(data && data.result == 'success'){
                        //保存成功
                        if(options.success)
                            options.success();
                    }else{
                        if(data.result == 'fail'){
                            power.alert('提示信息', '删除失败，原因是：' + data.msg, 'warning');
                        }
                    }
                };
                break;
            case 'list' :
                if(!params.data)params.data = {};
                params.data.params = JSON.stringify(options.params);
                params.success = function (data) {
                    if(options.success){
                        options.success(data);
                    }
                };
                break;
        }
        ajax(params);
    }
    /**
     * 把 str:"", tre:"", re:""的字符串转换成object
     * @param str
     */
    function getObject(str){
        if(!str || str === '') return false;
        var json = '({' + str +'})';
        return window.eval(json);
    }
    /**
     * 获取url
     * @param urlId
     */
    function getUrl(urlId){
        if(!urlId) return false;
        var url = common.ajaxUrl[urlId];
        if(url){
            return url;
        }
        return urlId;
    }
    /**
     * ajaxInit 方法
     */
    function ajaxInit(){
        var selector = '#' + ajaxId;
        common.ajaxUrl = {}; //存储页面需要的ajaxUrl中；
        $(function(){
            /*
             *  遍历span标签获取ajaxUrl;
             */
            $(selector).find('span[name]').each(function(){
                var key = $(this).attr('name');
                if(key){
                    common.ajaxUrl[key] = $.trim($(this).text());
                }
            });
        });
    }
    /**
     * Ajax请求方法
     * @param options
     */
    function ajax(options){
        var url = options.url || false;
        var dataType = options.dataType || "json"; //返回参数格式
        var async = options.async != undefined ? options.async : true; //同步或异步
        var timeout = options.timeout || 30000; //请求时间
        var data = options.data || {};
        var type = options.type && (options.type == 'get' || options.type == 'post') ? options.type : 'post';
        var success = options.success || function() {};
        var error = options.error;
        var complete = options.complete;
        if(!url){
            power.alert("提示信息", "请求的url为空", "warning");
            return false;
        }
        $.ajax({
            type : type,
            url : url,
            dataType : dataType,
            data : data,
            async : async,
            timeout : timeout,
            success : function(data, textStatus) {
                success(data, textStatus);
            },
            complete : function(XMLHttpRequest, textStatus) {
                if(status=='timeout'){
                    power.alert("提示信息", "请求超时，请检查网络环境", "warning");
                }
                if (options.complete)
                    options.complete(XMLHttpRequest, textStatus);
                XMLHttpRequest = null;
            },
            error : function(XMLHttpRequest, textStatus, errorThrown) {
                if (options.error)
                    options.error(XMLHttpRequest, textStatus);
                XMLHttpRequest = null;
            }
        });
    }

    /**
     * 图片自适应大小，非失真效果
     * @param imgD
     * @param FitWidth
     * @param FitHeight
     * @constructor
     */
    function ImgAutoSize(imgD, FitWidth, FitHeight, callback) {
        var image1 = new Image();
        image1.onload = function() {
            if (this.width > 0 && this.height > 0) {
                if (this.width / this.height >= FitWidth / FitHeight) {
                    if (this.width > FitWidth) {
                        imgD.width = FitWidth;
                        imgD.height = (this.height * FitWidth) / this.width;
                    } else {
                        imgD.width = this.width;
                        imgD.height = this.height;
                    }
                } else {
                    if (this.height > FitHeight) {
                        imgD.height = FitHeight;
                        imgD.width = (this.width * FitHeight) / this.height;
                    } else {
                        imgD.width = this.width;
                        imgD.height = this.height;
                    }
                }
            }
            image1 = null;
            callback();
        }
        image1.src=imgD.src;
    }
    common.ImgAutoSize = ImgAutoSize;

    /**
     * 获取对象类型
     * @param object
     * @returns {*}  Array String Number Date Window HTMLDocument
     */
    function getType(object) {
        return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
    }

    /**
     * 对象获取某一属性的值
     * @param data   {a: '', b:{a:''}}
     * @param express   'b.a' or 'a'
     */
    function getValue(data, express){
        if(!data || !express) return false;
        var index = express.indexOf('.');
        if(index != -1){
            return getValue(data[express.substring(0, index)], express.substring( index + 1));
        }else{
            return data[express];
        }
    }

    /**
     * 绑定事件方法
     */
    common.bindEvent = function(bindings) {
        for (var i in bindings) {
            if(bindings[i].selector) {
                $(bindings[i].element)
                    .on(bindings[i].event,bindings[i].selector , bindings[i].handler);
            }else{
                $(bindings[i].element)
                    .on(bindings[i].event, bindings[i].handler);
            }
        }
    }
    /**
     * 创建方法绑定this环境
     * @param fun
     * @param context
     * @returns {*}
     */
    common.createFunc = function(fun, context){
        if(!context) return fun;
        return function (){
            arguments.push(this);
            fun.apply(context, arguments);
        }
    }
})(jQuery);