/**
 * author : 刘宇阳
 * date : 2015/12/15
 * desc : 处理文件上传的js
 *        封装
 */
(function ($,render) {
    'use strict'; //开启严格检查
    var uuid = 0;
    $.render('file',{
        options : {
            url : '', //请求的url,
            view : false,//是否只展示
            id : '', //关联主键id
            type : '', //预设的type值
            cjr:null,
            queueSizeLimit : 15,
            fileSizeLimit : '50MB',
            orgid : null, //orgid
            multi : true,
            style : '' //显示风格,预留参数
        },
        createDom : function(element, options){
            var tpl = ' <div  class="func-table clearfix">'+
                            '<table cellpadding="0" cellspacing="0" width="' + ( options.view ? '100%' : '80%') + '" class="fl" id="fileTable">'+
                                '<col width="40%"/>'+
                                '<col width="10%"/>'+
                                '<col width="20%"/>'+
                                '<col width="20%"/>'+
                                (options.view ? '' : '<col width="10%"/>')+
                                '<tr class="ftb-hd">'+
                                    '<td>附件名</td>'+
                                    '<td>附件大小</td>'+
                                    '<td>上传人</td>'+
                                    '<td>上传时间</td>'+
                                    (options.view ? '' : '<td>操作</td>')+
                                '</tr>' +
                            '</table>'+
                            (options.view ? '' : '<a href="javascript:;" class="fr btn-adj"><span  id="fileUpload' + (++uuid) + '" class="file_upload"></span></a>')+
                        '</div>' +
                        '<div id="file_queue'+ uuid +'"></div>';
            $(element).html(tpl);
            return element;
        },
        init : function(element, targetElement, options){
            var _this = this;
            _this.context = $(element);
            _this.$table = $(element).find('table:eq(0)');
            _this.options = options;
            if(!options.view){
                this.uploadOptions = {
                    method : 'post',
                    queueID : 'file_queue' + uuid,
                    swf : ctx + '/scripts/plugin/uploadify/uploadify.swf',
                    uploader: this.getUploadUrl(),
                    buttonText : '',
                    formData : {
                        actionType: 'fileUpload',
                        params: this.getUploadParam()
                    },
                    auto: options.auto,
                    multi : options.multi,
                    removeCompleted : false,
                    queueSizeLimit : options.queueSizeLimit,
                    fileSizeLimit : options.fileSizeLimit,
                    onUploadStart : function (file) {
                        $(".uploadify-queue-item").css("max-width", "none");
                    },
                    onUploadSuccess : function(file, data){
                        _this.uploadSuccess(file, data);
                    },
                    onQueueComplete: function (queueData) {}
                };
                if(window.FormData){
                    this.uploadOptions = {
                        method : 'post',
                        queueID : 'file_queue' + uuid,
                        buttonText : '',
                        itemTemplate : '<div class="uploadifive-queue-item"><span class="filename"></span> | <span class="fileinfo"></span><div class="close"></div></div>',
                        auto: options.auto,
                        multi : options.multi,
                        removeCompleted : false,
                        queueSizeLimit : options.queueSizeLimit,
                        fileSizeLimit : options.fileSizeLimit,
                        uploadScript : this.getUploadUrl(),
                        formData : {
                            actionType: 'fileUpload',
                            params: this.getUploadParam()
                        },
                        onUploadComplete : function(file, data){
                            _this.uploadSuccess(file, data);
                        }
                    }
                }
                this.fileUploadSelector = '#fileUpload' + uuid;
                if(window.FormData){
                    $(this.fileUploadSelector, element).uploadifive(this.uploadOptions);
                }else{
                    $(this.fileUploadSelector, element).uploadify(this.uploadOptions);
                }
            }
            this.bind();
            this.load();
        },
        uploadSuccess: function(file, data) {
            if(file.id){
                $("#" + file.id).find(".cancel").remove();
                $("#" + file.id).find(".data").html("完成！");
            }
            if(file.queueItem){
                file.queueItem.find('.close').remove();
            }
            var fileList = JSON.parse(data).result;
            if (fileList && fileList.length > 0) {
                var count = 0;
                for (var i = 0; i < fileList.length; i++) {
                    if (fileList[i].ERROR) {
                        fileList.splice(i--, 1);
                        count++;
                    }
                }
                this.addFile(fileList);
                if (count > 0)Layer.showFailAlert('有' + count + '个文件名称过长，未能上传成功（文件名称只能小于100字符（一个汉字等于两个字符））', 3000);
            }
            if(file.id) {
                $("#" + file.id).remove();
            }
            if(file.queueItem){
                file.queueItem.remove();
            }
        },
        bind : function(){
            var _this = this;
            this.context.on('click', '.e-download', function(){
                fileUtil.download($(this).attr('link-filePath'), $(this).attr('link-name'), _this.options.url);
            });
            this.context.on('click', '.e-remove', function(){
                _this.remove($(this).attr('link-id'), this);
            });
        },
        getUploadUrl : function(){
            var url = this.options.url;
            var uploadUrl = url.substring(0, url.indexOf('methodName=') + 'methodName='.length) + 'upload';
            return (uploadUrl && uploadUrl.indexOf('?') != -1 ? uploadUrl + '&' :  uploadUrl + '?' ) + 'folderName=' + this.options.type;
        },
        load : function(){
            var _this = this;
            common.ajax({
                url : this.options.url,
                data : {
                    actionType : 'getFileList',
                    params : this.getUploadParam()
                }
            }).success(function(fileList){
                _this.$table.find('tr:gt(0)').remove();
                if(fileList && fileList.length > 0){
                    _this.addFile(fileList);
                }else{
                    _this.$table.append('<tr class="nofile"> <td colspan="' + _this.$table.find('tr:eq(0) td').length + '" align="center">暂无附件信息</td> </tr>');
                }
            });
        },
        remove : function(xh, elem){
            if(!xh) return;
            var _this = this;
            Layer.showConfirm("确定删除这个附件吗？", function(index){
                Layer.closeLayer(index);
                common.ajax({
                    url : _this.options.url,
                    data : {
                        actionType : 'deleteFile',
                        params : JSON.stringify([{
                            value : xh,
                            type : 'STRING'
                        }])
                    }
                }).success(function(flag){
                    if(flag){
                        Layer.showSucMsg("删除成功");
                        $(elem).parents('tr:eq(0)').remove();
                        if(_this.$table.find('tr').length == 1) _this.$table.append(' <tr class="nofile"> <td colspan="' + _this.$table.find('tr:eq(0) td').length + '" align="center">暂无附件信息</td> </tr>');
                    }
                });
            });
        },
        addFile : function(fileList){
            if(!fileList || fileList.length < 1) return;
            if(this.context.find('.nofile').length > 0) this.context.find('.nofile').remove();
            var tpl = '<tr id="file{id}">'+
                '<td class="file-name" title="{name}"><a href="javascript:;" class="e-download" link-filePath="{filePath}" link-name="{name}"  class="link">{name}</a></td>'+
                '<td>{size}</td>'+
                '<td>{uploader}</td>'+
                '<td>{uploadTime | dateFormat}</td>'+
                (this.options.view ? '' : '<td><a href="javascript:;" class="e-remove" link-id="{id}"><img src="' + ctx + '/skins/default/ydzfv3/images/icon_delete.png" /></a></td>')+
                '</tr>';
            if(!common.tpl.formatFuns['dateFormat']){
                common.tpl.formatFuns['dateFormat'] = function(date){
                    return power.dateFormat(new Date(date.time), 'yyyy-MM-dd hh:mm');
                }
            }
            this.$table.append(common.tpl.replace(tpl, fileList));
        },
        getUploadParam : function(){
            var params = [{
                value: this.options.id,
                type: 'STRING'
            }, {
                value: this.options.type,
                type: 'STRING'
            }];
            if(this.options.orgid){
                params.push({
                    value : this.options.orgid,
                    type : 'STRING'
                });
            }
            if(this.options.cjr){
                params.push({
                    value : this.options.cjr,
                    type : 'STRING'
                });
            }
            return JSON.stringify(params);
        },
        /*刷新方法*/
        refresh : function(id, type){
            if(id || type){
                if(id) this.options.id = id;
                if(type) this.options.type = type;
                if(this.uploadOptions){
                    this.uploadOptions.uploader = this.getUploadUrl();
                    this.uploadOptions.uploadScript = this.getUploadUrl();
                    this.uploadOptions.formData.params = this.getUploadParam();
                    var $uploader =  $(this.fileUploadSelector, this.context);
                    if(window.FormData){
                        $uploader.uploadifive('destroy');
                        $uploader.uploadifive(this.uploadOptions);
                    }else{
                        //$uploader.uploadify('destroy'); iE8下卸载会报错
                        $uploader.uploadify(this.uploadOptions);
                    }
                }
            }
            this.load();
        }
    });

    function ensure(name, parent, factory){
        return parent[name] ? parent[name] : (parent[name] = factory())
    }
    var fileUtil = ensure('fileUtil', window, Object);
    fileUtil.download = function(filePath, fileName, isExisturl){
        if(filePath && fileName){
            var docType = filePath.substring(filePath.lastIndexOf('.') + 1);
            if('jpg|jpeg|gif|png'.indexOf(docType.toLowerCase()) != -1){
                this.showImage(filePath, isExisturl);
                return;
            }
            var url =  ctx +'/pages/ydzfv3/xxwh/yyyd/downFile.jsp' + '?filePath=' + filePath + '&fileName=' + fileName + '&now=' + new Date().getTime();
            var iframe = $('#downFile4587');
            if(iframe.length > 0){
                iframe.attr('src', url);
            }else{
                $('<iframe id="downFile4587"  style="display:none;"  src=' + url + '></iframe>').appendTo('body');
            }
        }
    };
    fileUtil.showImage = function(filePath, url){
        if(filePath && this.isExist(url, filePath)){
            var element = document.createElement('img');
            element.src = ctx + filePath;
            common.ImgAutoSize(element, 1000, 700, function(){
                var image = element;
                window.top.layer.open({
                    type: 1,
                    title: false,
                    area: [image.width + 'px', image.height + 'px'],
                    skin: 'layui-layer-nobg', //没有背景色
                    shadeClose: true,
                    closeBtn : 2,
                    content: element.outerHTML,
                    success : function(dom){
                        window.top.$('.layui-layer-content',dom).rotate({
                            bind: {
                                click: function () {
                                    var rotate = Number(window.top.$(this).getRotateAngle());
                                    var newRotate = rotate
                                    if(newRotate%90 != 0){
                                        newRotate =newRotate - (newRotate % 90) + 90;
                                    }
                                    window.top.$(this).rotate({angle: rotate, animateTo: newRotate + 90, easing: $.easing.easeInOutExpo})
                                }
                            }

                        });
                    }
                });
            });
        } else {
            Layer.showMsg('文件不存在或已经删除！');
        }
    }
    fileUtil.isExist = function(url, filePath){
        var flag = false;
        $.ajax({
            url : url,
            type : 'post',
            dataType : 'json',
            async : false,
            data : {
                actionType : 'fileIsExist',
                params : JSON.stringify([{
                    value : filePath,
                    type : 'STRING'
                }])
            },
            success : function(data){
                if(data && data.result){
                    flag = true;
                }
            }
        });
        return flag;
    }
})(jQuery, render);