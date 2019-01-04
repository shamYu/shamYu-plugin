$(document).ready(function(){

    $('.modalLink').modal({
        trigger: '.modalLink',          // id or class of link or button to trigger modal
        olay:'div.overlay',             // id or class of overlay
        modals:'div.modal',             // id or class of modal
        animationEffect: 'fadeIn',   // overlay effect | slideDown or fadeIn | default=fadeIn
        animationSpeed: 400,            // speed of overlay in milliseconds | default=400
        moveModalSpeed: 'slow',         // speed of modal movement when window is resized | slow or fast | default=false
        background: '000',           // hexidecimal color code - DONT USE #
        opacity: 0.7,                   // opacity of modal |  0 - 1 | default = 0.8
        openOnLoad: false,              // open modal on page load | true or false | default=false
        docClose: true,                 // click document to close | true or false | default=true    
        closeByEscape: true,            // close modal by escape key | true or false | default=true
        moveOnScroll: true,             // move modal when window is scrolled | true or false | default=false
        resizeWindow: true,             // move modal when window is resized | true or false | default=false
        video: 'http://player.vimeo.com/video/2355334?color=eb5a3d',    // enter the url of the video
        videoClass:'video',             // class of video element(s)
        close:'.closeBtn'               // id or class of close button
    });
	
	var whichone = 0;
	var navwhichone = 0;
	$(".modalup ul li").mouseover(function(){
		whichone = $(".modalup ul li").index(this);
		$(".downbtn .show").removeClass("show");
		$(".downcont").eq(whichone).addClass("show");
		});
	$(".modalup ul li a").mouseover(function(){
		$(".modalup ul li .active").removeClass("active");
		$(this).addClass("active");
		});
		
	$(".menu ul li a").click(function(){
		navwhichone = $(".menu ul li a").index(this);
		$(".downbtn .show").removeClass("show");
		$(".downcont").eq(navwhichone).addClass("show");
		$(".modalup ul li .active").removeClass("active");
		$(".modalup ul li a").eq(navwhichone).addClass("active");
		})
	$(".button a").click(function(){
		$(".downbtn .show").removeClass("show");
		$(".downcont").eq(0).addClass("show");
		$(".modalup ul li .active").removeClass("active");
		$(".modalup ul li a").eq(0).addClass("active");
		})
			  
	$("#img3").rotate({ 
	   bind: 
		 { 
			mouseover : function() { 
				$(this).rotate({animateTo:40});
			},
			mouseout : function() { 
				$(this).rotate({animateTo:0});
			}
		 } 
	   
	});

});