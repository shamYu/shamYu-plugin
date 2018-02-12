/**
 * author : 刘宇阳
 * date : 2015/11/2
 * desc : 截图控件调用
 */
var niuniuCapture = null;
var savedPictureContent = '';
var extendName = '';

var WatermarkPicturePath = "";
var WatermarkTextValue = "";

/*******************************************************************************/
//设置截图的参数
var emPensize = 1;		//设置画笔大小
var emDrawType = 2;		//设置是腾讯风格还是360风格 0： 腾讯风格   1： 360风格
var emTrackColor = 3;		//自动识别的边框的颜色
var emEditBorderColor = 4;	//文本输入的边框颜色
var emTransparent = 5;		//工具栏的透明度
var emWindowAware = 6;		//设置是否禁用随着DPI放大
var emSetSaveName = 8;		//设置保存时的开始文字     免费版本无效
var emSetMagnifierBkColor = 9; //设置放大镜的背景色，不设置则透明
var emSetMagnifierLogoText = 10; //设置放大镜上的LOGO字符，可提示快捷键，如： 牛牛截图(CTRL + SHIFT + A)     免费版本无效
var emSetWatermarkPictureType = 20;						//设置水印的类型
var emSetWatermarkPicturePath = 21;						//设置水印的路径
var emSetWatermarkTextType = 22;						//设置水印文字的类型
var emSetWatermarkTextValue = 23;
function capturePlugin() {
    return document.getElementById('niuniuCapture');
}
niuniuCapture = capturePlugin;
//判断是否需要扩展
function IsNeedCrx() {
    var isChrome = IsRealChrome();
    var chromeMainVersion = GetChromeMainVersion();
    if (isChrome && chromeMainVersion > 41) {
        return true;
    }
    return false;
}

/**
 * 获取谷歌版本
 * @returns {*}
 * @constructor
 */
function GetChromeMainVersion() {
    var gsAgent = navigator.userAgent.toLowerCase();
    var gsChromeVer = "" + (/chrome\/((\d|\.)+)/i.test(gsAgent) && RegExp["$1"]);

    if (gsChromeVer != "false")
        return parseInt(gsChromeVer);
    return 0;
    //return gsChromeVer;
}
/**
 * 判断是否是谷歌
 * @returns {boolean}
 * @constructor
 */
function IsRealChrome() {
    try {
        var isChrome = window.navigator.userAgent.indexOf("Chrome") != -1;
        if (isChrome) {
            if (chrome && chrome.runtime) {
                return true;
            }
        }
        return false;
    }
    catch (e) {
    }
    return false;
}
//初始化控件
function initCapture() {
    if (!IsNeedCrx()) {
        LoadPlugin();
    }
    else {
        BindChromeCallback();
    }
}

/**
 * 加载控件
 * @param containerId 容器id
 * @constructor
 */
function LoadPlugin() {
    $('#capturecontainer').html();
    $('#capturecontainer').html('<object id="niuniuCapture" type="application/x-niuniuwebcapture" width="0" height="0"><param name="onload" value="pluginLoaded" /></object>');
}

//此函数用于绑定在Chrome42以上的版本时，扩展在截图完成后进行事件通知的处理
function BindChromeCallback() {
    document.addEventListener('NiuniuCaptureEventCallBack', function (evt) {
        var _aoResult = evt.detail;
        if (_aoResult.Result == -2) {
            ShowChromeInstallDownload();
        }
        if (_aoResult.Result != -1) {
            OnCaptureFinishedEx(_aoResult.Type, _aoResult.x, _aoResult.y, _aoResult.Width, _aoResult.Height, _aoResult.Info, _aoResult.Content, _aoResult.LocalPath);
        }
        else {
            alert("出错：" + _aoResult.Info);
        }
    });
}

/**
 * 截图完成调用事件
 * @param type
 * @param x
 * @param y
 * @param width
 * @param height
 * @param info
 * @param content
 * @param localpath
 * @constructor
 */
function OnCaptureFinishedEx(type, x, y, width, height, info, content, localpath) {
    switch (type) {
        case 1:
        {
            saveImage(content, localpath);//截图完成
            break;
        }
        case 2:
        {
            //您取消了截图
            break;
        }
        case 3:
        {
            //您保存了截图到本地
            saveImage(content, localpath);//截图完成
            break;
        }
        case 4:
        {
            if (info == '0') {
                //从剪贴板获取到了截图
                //UploadCaptureData(content, localpath);
            }
            else {
                //从剪贴板获取图片失败
            }
            break;
        }
    }
}

/**
 * 截图调用方法
 * @constructor
 */
function Capture() {
    DoCapture("1.jpg", 0, 0, 0, 0, 0, 0);
}

/**
 * 显示下载处理
 * @constructor
 */
function ShowChromeInstallDownload() {
    alert("您需要先下载Chrome扩展安装包进行安装，请按浏览器的提示操作。");
    var date = new Date();
    $('#downCapture').attr('src', ctx + "/capture/CaptureInstallChrome.exe?" + date.getMinutes() + date.getSeconds());
}

function pluginLoaded() {
    if (!pluginValid()) {
        return false;
    }
    //此处可以通过niuniuCapture().GetLocation()获取控件的路径，可心通过GetVersion获取版本号
    var myencodedauth = "niuniu";
    //此函数必需调用，传递正确的参数，且必需先于其他函数调用
    niuniuCapture().InitCapture(myencodedauth);
    niuniuCapture().InitParam(emPensize, 2);
    niuniuCapture().InitParam(emDrawType, 0);
    niuniuCapture().InitParam(emTrackColor, rgb2value(255, 0, 0));
    niuniuCapture().InitParam(emEditBorderColor, rgb2value(0, 0, 255));
    niuniuCapture().InitParam(emTransparent, 220);
    //如果是gb2312编码的网页，可以直接通过如下接口设置
    //niuniuCapture().InitParam(emSetSaveName, "我的截图LOGO");
    //niuniuCapture().InitParam(emSetMagnifierLogoText, "截图");

    // 以下以gb2312的base64编码来设置LOGO文字及保存名字，以便在UTF-8编码的页面中也能使用
    // 可以在如下站点进行将中文转换成base64字符串   http://tools.jb51.net/tools/base64_decode-gb2312.php
    //设置截图LOGO文字    //我的截图LOGO
    niuniuCapture().InitParamByBase64(emSetSaveName, "ztK1xL3YzbxMT0dP");
    //设置保存名称        //我的截图保存名
    niuniuCapture().InitParamByBase64(emSetMagnifierLogoText, "ztK1xL3Yzbyxo7Tmw/s=");
    //添加控件的事件监听
    addEvent(niuniuCapture(), 'CaptureFinishedEx', OnCaptureFinishedEx);
    //以下这个事件主要是用于兼容旧的浏览器控件的事件通知
    addEvent(niuniuCapture(), 'CaptureFinished', OnCaptureFinished);
}

function DoCapture(name, hide, AutoCapture, x, y, width, height) {
    if (IsNeedCrx()) {
        DoCaptureForChrome(name, hide, AutoCapture, parseInt(x), parseInt(y), parseInt(width), parseInt(height));
        return;
    }
    if (pluginValid()) {
        niuniuCapture().Capture(name, hide, AutoCapture, x, y, width, height);
    }
    else {
        alert("您需要先下载控件进行安装，请按浏览器的提示操作。");
        var date = new Date();
        $('#downCapture').attr('src', ctx + "/capture/CaptureInstall.exe?" + date.getMinutes() + date.getSeconds());
    }
}
/**
 * 判断是否有控件
 * @returns {boolean}
 */
function pluginValid()
{
    if(niuniuCapture().valid)
    {
        return true;
    }
    return false;
}
/**
 * 谷歌截图处理
 * @param name
 * @param hide
 * @param AutoCapture
 * @param x
 * @param y
 * @param width
 * @param height
 * @constructor
 */
function DoCaptureForChrome(name, hide, AutoCapture, x, y, width, height)
{
    var obj = NewCaptureParamObject(name, hide, AutoCapture, x, y, width, height);
    try
    {
        var json = JSON.stringify(obj);
        var CrxEventFlag = 'NiuniuCaptureEvent';
        var objFlag = $('#' + CrxEventFlag);
        if(objFlag.length < 1)
        {
            ShowChromeInstallDownload();
            return;
        }
        else
        {
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(CrxEventFlag, true, false, json);
            document.dispatchEvent(evt);
        }
    }
    catch(e)
    {
        ShowChromeInstallDownload();
    }
}
/**
 * 谷歌参数设置
 * @param defaultpath
 * @param hideCurrWindow
 * @param autoCaptureFlag
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns {Object}
 * @constructor
 */
function NewCaptureParamObject(defaultpath, hideCurrWindow, autoCaptureFlag, x, y, width, height){
    var obj=new Object();
    obj.IsGBK = 0;				//是否是GBK编码，这样会涉及到编码转换
    obj.AuthKey = $.md5("niuniu");  //
    obj.Pensize = 2;		//设置画笔大小
    obj.DrawType = 0;			//设置是腾讯风格还是360风格
    obj.TrackColor=rgb2value(255,0,0);		//自动识别的边框的颜色
    obj.EditBorderColor=rgb2value(0,255,0);	//文本输入的边框颜色
    obj.Transparent = 230;		//工具栏的透明度
    obj.SetSaveName="截图";									//设置保存时的开始文字
    obj.SetMagnifierLogoText="截图";						//设置放大镜上的LOGO字符
    obj.SetWatermarkPictureType=3;						//设置水印的类型
    obj.SetWatermarkPicturePath=WatermarkPicturePath;						//设置水印的路径
    obj.SetWatermarkTextType=1;							//设置水印文字的类型
    obj.SetWatermarkTextValue=WatermarkTextValue;						//设置水印文字


    //以下是截图时传递的参数
    obj.DefaultPath = defaultpath;
    obj.HideCurrentWindow = hideCurrWindow;
    obj.AutoCaptureFlag = autoCaptureFlag;
    obj.x = x;
    obj.y = y;
    obj.Width = width;
    obj.Height = height;
    return obj;
}

function rgb2value(r, g, b)
{
    return r | g << 8 | b << 16;
}
