
$(function(){
	
	var itemW=$(".item-con-wrap").width();
	
	//左右显示隐藏逻辑
	$("#con-item>ul>li").mouseover(function(){
		if($(this).next().hasClass("active")){
			return
		}else{
			$("#con-item div:animated").stop(true,true);
			$(".item-con.active").animate({"width":0},700).removeClass("active");
			$(this).next().animate({"width":itemW},700).addClass("active");
		}		
	})
	
	//tab点击处理定时器逻辑，每次点击打开关闭两个计时器，再打开新的。---------------------------------------------------------------------------------------------------------->
	
	var tabImgH=$(".tab-img li").height();
	var tabImgW=$(".tab-img li").width();
	var tabImgL=$(".tab-div.active").find(".sLeft li").length;
	$(".tab-img.sLeft ul").width(tabImgW*tabImgL);
	var $ImgT=$(".tab-div.active").find(".sTop");
	var $ImgL=$(".tab-div.active").find(".sLeft");
	var timerT=setInterval(showImg($ImgT,'Top'),1500);
	var timerL=setInterval(showImg($ImgL,'Left'),1500);
	
	$("#tab-wrap ul li").click(function(){
		if ($(this).hasClass("active")){
			return
		}else{
			var index=$(this).index();
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			$("#tab-c-wrap>div:visible").fadeOut().removeClass("active");
			$("#tab-c-wrap>div").eq(index).fadeIn().addClass("active");
			
			$ImgT=$(".tab-div.active").find(".sTop");
			$ImgL=$(".tab-div.active").find(".sLeft");
			clearInterval(timerT);
			clearInterval(timerL);		
			timerT=setInterval(showImg($ImgT,'Top'),1500);
			timerL=setInterval(showImg($ImgL,'Left'),1500);
		}
		
	})
	
	$(".sTop").hover(function(){
		clearInterval(timerT);
	},function(){
		timerT=setInterval(showImg($ImgT,'Top'),1500);
	})
	
	$(".sLeft").hover(function(){
		clearInterval(timerL);
	},function(){
		timerL=setInterval(showImg($ImgL,'Left'),1500);
	})
	
	//定时器传入返回函数声明的函数调用，可实现传参。
	function showImg(obj,dir){
		return function(){
			if(obj!=null){
				var str="margin"+dir;
				var $oNowul=obj.find("ul");
				var tCss={};
				if(dir=="Top"){
					tCss[str]=-tabImgH;
					$oNowul.animate(tCss,500,function () {
						$oNowul.find("li").eq(0).appendTo($oNowul);
						$oNowul.css(str,0);
					});
				}else{
					tCss[str]=-tabImgW;
					$oNowul.delay(500).animate(tCss,500,function () {
						$oNowul.find("li").eq(0).appendTo($oNowul);
						$oNowul.css(str,0);
					});
				}
			}else{
				return
			}
			
		}
	}
	
	//轮番大图逻辑------------------------------------------------------------------------------------------------------------------------------------------->
	
	var winW=$(window).width();
	var timerNav=setInterval(showNav("left"),3000);
	var iNow=0;
	var oNowImg=$("#navimg ul li").eq(iNow);
	var iNavL=$("#navimg ul li").length;
	var oPre={};
	var oNow={};
	var btnoff=true;
	
	//窗口大小变化需要重新处理
	$(window).resize(function(){
		winW=$(window).width();
		$("#navimg ul li").each(function () {
			var ileft=parseInt($(this).css("left"));
			if(ileft>0){
				$(this).css("left",winW);
			}
			if (ileft<0){
				$(this).css("left",-winW);
			}
		})
		clearInterval(timerNav);
		timerNav=setInterval(showNav("left"),3000);		
	})
	
	$("#navimg ul li").not(oNowImg).each(function () {
		$(this).css("left",winW);
	})
	
	//鼠标移入轮番大图区域
	$("#navimg").hover(function(){
		btnoff=true;
		$("#icon-item").show();
		$("#arrow").show();
		clearInterval(timerNav);
	},function(){
		$("#icon-item").hide();
		$("#arrow").hide();
		timerNav=setInterval(showNav("left"),3000);
	})
	
	//箭头逻辑
	$(".arrow-l").click(showNav("right"));
	$(".arrow-r").click(showNav("left"));
	
	//小点逻辑
	$("#icon-item span").click(function(){
		if(btnoff){
			btnoff=false;
			var index=$(this).index();
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			if(index>iNow){
				$("#navimg ul li").eq(index).css('left',winW);
				$("#navimg ul li").eq(iNow).animate({"left":-winW},1000);
			}
			if(index<iNow){
				$("#navimg ul li").eq(index).css('left',-winW);
				$("#navimg ul li").eq(iNow).animate({"left":winW},1000);
			}
			$("#navimg ul li").eq(index).animate({"left":0},1000,function(){
				btnoff=true;
			})
			iNow=index;
		}
	})
	
	//轮番图传入的函数调用，用了闭包。少些些代码。
	function showNav(dir){
		return function(){
			if (btnoff) {
				btnoff=false;
				var iPre=iNow;
				if(dir=="left"){
					if (iNow==iNavL-1) {
						iNow=0;
					}else{
						iNow++
					};
					oPre.left=-winW;
					$("#navimg ul li").eq(iNow).css('left',winW);
				}else{
					if (iNow==0){
						iNow=iNavL-1;
					}else{
						iNow--;
					};
					oPre.left=winW;
					$("#navimg ul li").eq(iNow).css('left',-winW);
				}
				$("#icon-item span").removeClass("active");
				$("#icon-item span").eq(iNow).addClass("active");
				oNow.left=0;
				$("#navimg ul li").eq(iPre).animate(oPre,1000);
				$("#navimg ul li").eq(iNow).animate(oNow,1000,function(){
					btnoff=true;
				});
			}		
		}
	}
	
	//导航菜单移入移出----------------------------------------------------------------------------------------------------------------------------------------------------->
	
	$("#nav>ul>li").hover(function () {
		$(this).find("div").stop(true,false).slideDown();
	},function () {
		$(this).find("div").stop(true,false).slideUp();
	})
	
	$('#login').on('click',function () {
		$('body').prepend('<div id="mask"></div>');
		$('#login_w').fadeIn(1000);
	});
	
	$('#close').on('click',function () {
		$('#login_w').fadeOut(1000);
		$('#mask').fadeOut(1000);
	})
	
	//惊喜部分，针线活。------------------------------------------------------------------------------------------------------------------------------------------------->
	
	var aColor=["#9ace2b","#e5d12d","#ffb005","#ed5b28","#e13f5d","#e54488","#b15bde","#6d5bde","#5b80de","#1cb2ea","#3ed496"];
	var colorL=aColor.length;
	var iNowcolor=0;
	var timerShow=setInterval(showBall,1000);
	var timerSpur=null;
	var stopSpur=true;
	$("#greenball").hover(function () {
		clearInterval(timerShow);
	},function () {
		timerShow=setInterval(showBall,1000);
	})
	
	$("#greenball").click(function () {
		clearInterval(timerSpur);
		timerSpur=setInterval(showSpur,2000);
	});
	
	function showSpur () {
		$("#squb-L").animate({
			"left":0,
			"marginLeft":0,
			"width":200,
			"height":200,
			"marginTop":-100,
			"borderRadius":100,
			"fontSize":60,
			"lineHeight":200
		},1000).animate({
			"left":600,
			"marginLeft":-50,
			"width":100,
			"height":100,
			"marginTop":-50,
			"borderRadius":50,
			"fontSize":14,
			"lineHeight":100
		},1000,function () {
			$("#squb-L").css("backgroundColor",aColor[iNowcolor])
		});
		$("#squb-R").animate({
			"left":980,
			"marginLeft":0,
			"width":200,
			"height":200,
			"marginTop":-100,
			"borderRadius":100,
			"fontSize":60,
			"lineHeight":200
		},1000).animate({
			"left":600,
			"width":100,
			"height":100,
			"marginTop":-50,
			"marginLeft":-50,
			"borderRadius":50,
			"fontSize":14,
			"lineHeight":100
		},1000,function(){
			$("#squb-R").css("backgroundColor",aColor[iNowcolor])
		});
	}
	function showBall(){
		if(iNowcolor==colorL-1){
			iNowcolor=0;
		}else{
			iNowcolor++;
		}
		$("#greenball").animate({
			"width":200,
			"height":200,
			"marginLeft":-100,
			"marginTop":-100,
			"lineHeight":200
		},500).animate({
			"width":150,
			"height":150,
			"marginLeft":-75,
			"marginTop":-75,
			"lineHeight":150
		},500,function () {
			$("#greenball").css("backgroundColor",aColor[iNowcolor])
		});
		$("#shadowball").animate({
			"width":300,
			"height":300,
			"marginLeft":-150,
			"marginTop":-150,
			"opacity":0,
			"borderWidth":0
		},1000,function(){
			$("#shadowball").css({
				"width":140,
				"height":140,
				"marginLeft":-76,
				"marginTop":-76,
				"opacity":1,
				"borderWidth":6,
				"borderColor":aColor[iNowcolor]
			})
		})
		
	}

})
