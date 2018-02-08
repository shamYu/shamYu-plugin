/**
 * 时间工具类
 * @author 王武
 * @Date 2017-03-17
 * @param exports
 */
(function(exports){
	var objectPrototypeToString = Object.prototype.toString;
	
	var MyDateUtil = {};
	/**
     * 日期匹配的正则表达式
     * Y:年
     * M:月
     * D:日
     * h:小时
     * m:分钟
     * s:秒
     * i:毫秒
     * w:星期(小写的)
     * W:星期(大写的)
     */
    var SIGN_DATE_REG = /([yMdHmsiWw])(\1*)/g;
    /**
     * 默认的pattern
     * 'yyyy-MM-dd HH:mm:ss:iii'
     */
    var DEFAULT_PATTERN = 'yyyy-MM-dd HH:mm:ss:iii';
	/**
	 * 判断是否是时间
	 */
	MyDateUtil.isDate = function(value) {
        return objectPrototypeToString.call(value) === '[object Date]';
    };
	
    /**
     * @description 复制一个日期,如果传入的不是日期,会返回一个最新的日期
     * @param {Date} targetDate
     */
    MyDateUtil.cloneDate = function(targetDate, callBack) {
        //绝对时间,从1970.1.1开始的毫秒数
        var absoluteTime = (this.isDate(targetDate)) ? targetDate.getTime() : undefined;
        var mDate = new Date(absoluteTime);
        var year = mDate.getFullYear(), //
            month = mDate.getMonth(), //
            date = mDate.getDate(), //
            hours = mDate.getHours(), //
            minutes = mDate.getMinutes(), // 
            seconds = mDate.getSeconds(); //
        //!! 代表将后面的转为一个布尔表达式   例如 !!a 就相当于 a||false
        (!!callBack) && callBack(mDate, year, month, date, hours, minutes, seconds);
        return mDate;
    };
	
    /**
     * @description 日期解析,将日期字符串根据特定的匹配字符串解析为日期格式
     * 解析失败会返回null,如果传入了奇怪的匹配字符串,会产生奇怪的时间
     * @param {String} dateString 日期字符串
     * @param {String} pattern 匹配字符串,可以手动传入,或者采取默认
     * 手动传入需要和日期字符串保持一致
     */
    MyDateUtil.parseDate = function(dateString, pattern) {

        try {
            //() 是为了提取匹配的字符串。表达式中有几个()就有几个相应的匹配字符串。
            //(\s*)表示连续空格的字符串。
            //[]是定义匹配的字符范围。比如 [a-zA-Z0-9] 表示相应位置的字符要匹配英文字符和数字。
            //[\s*]表示空格或者*号。
            //{}一般用来表示匹配的长度，比如 \s{3} 表示匹配三个空格，\s[1,3]表示匹配一到三个空格。
            //(\1)是后向引用,代表后面引用前面第一个()中的内容
            //根据日期格式来匹配
            var matchs1 = (pattern || (dateString.length === 10 ? 'yyyy-MM-dd' : (dateString.length === 19 ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd HH:mm:ss:iii'))).match(SIGN_DATE_REG);
            //根据整数来匹配,将实际的时间数据提取出来
            var matchs2 = dateString.match(/(\d)+/g);
            if (matchs1.length > 0) {
                //第一个匹配字符串需要大于0才行
                //生成一个最原始的时间-1970-01-01年的
                var mDate = new Date(1970, 0, 1);
                //遍历,分别设置年月日,分秒等等
                for (var i = 0; i < matchs1.length; i++) {
                    //这个分别是  年,月,日  时,分,秒等等
                    var mTarget = parseInt(matchs2[i], 10);
                    switch (matchs1[i].charAt(0) || '') {
                        //这个matchs1[i]有可能是  YYYY  所以只去第一个字符
                        case 'y':
                            mDate.setFullYear(mTarget);
                            break;
                        case 'M':
                            mDate.setMonth(mTarget - 1);
                            break;
                        case 'd':
                            mDate.setDate(mTarget);
                            break;
                        case 'H':
                            mDate.setHours(mTarget);
                            break;
                        case 'm':
                            mDate.setMinutes(mTarget);
                            break;
                        case 's':
                            mDate.setSeconds(mTarget);
                            break;
                        case 'i':
                            mDate.setMilliseconds(mTarget);
                            break;
                        default:
                            //默认不操作
                    }
                }
                return mDate;
            }
        } catch (e) {
        	console.log(e);
        }
        return null;
    };
    
    /**
     * @description 格式化时间,返回格式化后的字符串
     * 如果格式不合要求,返回null
     * @param {Date} value 目标时间
     * @param {String} pattern 匹配字符串
     */
    MyDateUtil.formatDateToStr = (function() {
        var SIGN_RG = /([yMdHsm])(\1*)/g;
        function padding(s, len) {
            var len = len - (s + "").length;
            for (var i = 0; i < len; i++) {
                s = "0" + s;
            }
            return s;
        }
        return function(value, pattern) {
            if (!MyDateUtil.isDate(value)) {
                return '';
            }
            try {
                pattern = pattern || 'yyyy-MM-dd HH:mm:ss';
                return pattern.replace(SIGN_RG, function($0) {
                    switch ($0.charAt(0)) {
                        case 'y' :
                            return padding(value.getFullYear(), $0.length);
                        case 'M' :
                            return padding(value.getMonth() + 1, $0.length);
                        case 'd' :
                            return padding(value.getDate(), $0.length);
                        case 'w' :
                            return value.getDay() + 1;
                        case 'H' :
                            return padding(value.getHours(), $0.length);
                        case 'm' :
                            return padding(value.getMinutes(), $0.length);
                        case 's' :
                            return padding(value.getSeconds(), $0.length);
                        case 'q' :
                            return Math.floor((this.getMonth() + 3) / 3);
                        default :
                            return '';
                    }
                });
            } catch (err) {
                return '';
            }
        };
    })();
    
    /**
     * @description 得到一个月有多少天
     * @param {Number} month 对应的月份
     */
    MyDateUtil.getMonthDays = function(year,month) {
        switch (month) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                return 31;
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;
                break;
            case 2:
                if (year%4==0) {
                    return 29;
                } else {
                    return 28;
                }
                break;
            default:
                return 0;
                break;
        }
    };
    
    /**
     * @description 天数相加
     * @param {Object} value
     * @param {Date} date
     */
    MyDateUtil.addDays = function(day,date){

    	try{
    		if(date&&this.isDate(date)){
    			var cday = date.getDate();
    			date.setDate(cday+day);
    			return date;
    		}else{
    			var date = new Date();
    			var cday = date.getDay();
    			date.setDay(cday+day);
    			return date;
    		}
    	}catch (e) {
			console.log(e);
		}
    }
    
    /**
     * @description 月数相加
     * @param {Object} value
     * @param {Date} date
     */
    MyDateUtil.addMonths = function(month,date){

    	try{
    		if(date&&this.isDate(date)){
    			var cM = date.getMonth();
    			date.setMonth(cM+month);
    			return date;
    		}else{
    			var date = new Date();
    			var cM = date.getMonth();
    			date.setMonth(cM+month);
    			return date;
    		}
    	}catch (e) {
			console.log(e);
		}
    }
    
    /**
     * @description 小时相加
     * @param {Object} value
     * @param {Date} date
     */
    MyDateUtil.addHours = function(hour,date){

    	try{
    		if(date&&this.isDate(date)){
    			var cH = date.getHours();
    			date.setHours(cH+hour);
    			return date;
    		}else{
    			var date = new Date();
    			var cH = date.getHours();
    			date.setHours(cH+hour);
    			return date;
    		}
    	}catch (e) {
			console.log(e);
		}
    }
    
    /**
     * @description 年份相加减
     * @param {Object} addYear 添加的年 减就用负数 by wwupower
     * @param {Date} date
     */
    MyDateUtil.addYears = function(addYear,date){
    	try{
    		if(!date||!this.isDate(date)){
    			date = new Date();
    		}
    		if(addYear){
    			var cYear = date.getFullYear();
    			date.setFullYear(cYear+addYear);
    		}
    		return date;
    	}catch (e) {
			console.log(e);
		}
    }
    
    /**
     * 获取本周几
     */
    MyDateUtil.getDateOfWeek = function(week,date){
    	var dateInfo = this.cloneDate(date);
    	var day_of_week = dateInfo.getDay();
    	//获取当前周  西方习惯周天开始；国内均从周一开始  修改 1表示周一；7表示周天
    	 if (day_of_week == 0)
             day_of_week = 7;
    	 dateInfo = MyDateUtil.addDays(-day_of_week+week,dateInfo);
    	 return dateInfo;
    }
    
    /**
     * 获取一天的时间区间
     */
    MyDateUtil.getDayIntvs = function(date,addDay){
    	var me = this;
    	var dateInv = {};
    	if(!date){date=new Date();};
    	if(addDay){
    		date=MyDateUtil.addDays(addDay,date);
    	};
    	var bgStr = me.formatDateToStr(date,"yyyy-MM-dd")+" 00:00:00";
		dateInv.beginTime = me.parseDate(bgStr,"yyyy-MM-dd HH:mm:ss");
		var endStr = me.formatDateToStr(date,"yyyy-MM-dd")+" 23:59:59";
		dateInv.endTime = me.parseDate(endStr,"yyyy-MM-dd HH:mm:ss");
		return dateInv;
    }
    
    /**
     * @param nearDay 近几天 必填
     * @param date 当前时间 缺失值
     */
    MyDateUtil.getNearDayIntvs = function(nearDay,date){
    	var me = this,dateInv={};
		if(!date||!this.isDate(date)){
			date = new Date()
		};
		//克隆当前时间
		var endTime = me.cloneDate(date);
    	if(nearDay){
    		date = MyDateUtil.addDays(-nearDay,date);
    	};
    	var bgStr = me.formatDateToStr(date,"yyyy-MM-dd")+" 00:00:00";
		dateInv.beginTime = me.parseDate(bgStr,"yyyy-MM-dd HH:mm:ss");
		var endStr = me.formatDateToStr(endTime,"yyyy-MM-dd")+" 23:59:59";
		dateInv.endTime = me.parseDate(endStr,"yyyy-MM-dd HH:mm:ss");
		return dateInv;
    }
    
    /**
     * @description 获取周时间区间
     * @param {Object} addWeek  0|本周 -1|上周 -2上上周
     * @param {Date} date 时间
     * @param weekBegin 周开始时间 默认周一 
     * @param weekBegin 周截止时间 默认周天
     */
    MyDateUtil.getWeekIntvs = function(date,addWeek,weekBegin,weekEnd){
    	try{
    		var me = this;
    		var dateInv = {};
    		//默认周一到周天
    		if(weekBegin!=0&&!weekBegin){weekBegin = 1};
    		if(weekBegin!=0&&!weekEnd){weekEnd = 7};
    		var date;
    		if(date&&this.isDate(date)){
    			date =me.addDays(7*addWeek,date);
    		}else{
    			date = new Date();
    			date =me.addDays(7*addWeek,date);
    		}
    		//转换格式
    		dateInv.beginTime = me.parseDate(me.formatDateToStr(me.getDateOfWeek(weekBegin,date),"yyyy-MM-dd")+" 00:00:00","yyyy-MM-dd HH:mm:ss") ;
    		dateInv.endTime = me.parseDate(me.formatDateToStr(me.getDateOfWeek(weekEnd,date),"yyyy-MM-dd")+" 23:59:59","yyyy-MM-dd HH:mm:ss") ;
    		return dateInv;
    	}catch (e) {
			console.log(e);
		}
    }
    
    /**
     * @param nearWeek 近几周 1近一周 必填
     * @param date 当前时间 缺失值
     * @param beginWeek 开始周 默认周一  缺失值
     */
    MyDateUtil.getNearWeekIntvs = function(nearWeek,date,beginWeek){
    	try{
    		var me = this,dateInv={};
    		if(!date||!this.isDate(date)){
    			date = new Date()
    		};
    		//获取本周一
    		var beginWeek; 
    		//默认周一
    		if(!beginWeek){
    			beginWeek = 1;
    		}
    		//克隆当前时间
    		var endTime = me.cloneDate(date);
    		//当前周开始
    		var currBeginWeek = MyDateUtil.getDateOfWeek(beginWeek,date);
    		//减去近几周的天数
    		var beginWeekTime = MyDateUtil.addDays(-nearWeek*7,currBeginWeek);
    		//转换格式
    		dateInv.beginTime = me.parseDate(me.formatDateToStr(beginWeekTime,"yyyy-MM-dd")+" 00:00:00","yyyy-MM-dd HH:mm:ss") ;
    		dateInv.endTime = me.parseDate(me.formatDateToStr(endTime,"yyyy-MM-dd")+" 23:59:59","yyyy-MM-dd HH:mm:ss") ;
    		return dateInv;
    	}catch (e) {
			console.log(e);
		}
    }
    
    /**
     * @description 获取月份区间
     * @param {Object} addMonth  0|本月 -1|上月 -2上上月
     * @param {Date} date 时间
     * @param weekBegin 周开始时间 默认周一 
     * @param weekBegin 周截止时间 默认周天
     */
    MyDateUtil.getMonthIntvs = function(date,addMonth){
    	try{
    		var me = this;
    		var dateInv = {};
    		if(!date){date = new Date()};
    		if(addMonth){
    			date =MyDateUtil.addMonths(addMonth,date);
    		};
    		//转换格式
    		var bgStr = me.formatDateToStr(date,"yyyy-MM")+"-01 00:00:00";
    		dateInv.beginTime = me.parseDate(bgStr,"yyyy-MM-dd HH:mm:ss");
    		var year = date.getFullYear();
    		var month = date.getMonth()+1;
    		var maxDay = me.getMonthDays(year,month);
    		var endStr = me.formatDateToStr(date,"yyyy-MM")+"-"+maxDay+" 23:59:59";
    		dateInv.endTime = me.parseDate(endStr,"yyyy-MM-dd HH:mm:ss");
    		return dateInv;
    	}catch (e) {
			console.log(e);
		}
    }
    
    
    /**
     * 获取季度区间时间段
     */
    MyDateUtil.getQuarterIntvs = function(date,addQuarter){
    	var me = this;
    	if(!date){date = new Date()};
    	if(addQuarter){
    		date =MyDateUtil.addMonths(addQuarter*3,date);
    	}
    	var year = date.getFullYear();
    	var dateIntv = {};
    	var month =  date.getMonth()+1;
		if(month>=1&&month<=3){
			dateIntv.beginTime = me.parseDate(year+"-01-01 00:00:00","yyyy-MM-dd HH:mm:ss");
			dateIntv.endTime = me.parseDate(year+"-03-31 23:59:59","yyyy-MM-dd HH:mm:ss");
    	}else if(month>3&&month<=6){
    		dateIntv.beginTime = me.parseDate(year+"-04-01 00:00:00","yyyy-MM-dd HH:mm:ss");
			dateIntv.endTime = me.parseDate(year+"-06-30 23:59:59","yyyy-MM-dd HH:mm:ss");
    	}else if(month>6&&month<=9){
    		dateIntv.beginTime = me.parseDate(year+"-07-01 00:00:00","yyyy-MM-dd HH:mm:ss");
			dateIntv.endTime = me.parseDate(year+"-09-30 23:59:59","yyyy-MM-dd HH:mm:ss");
    	}else if(month>9&&month<=12){
    		dateIntv.beginTime = me.parseDate(year+"-10-01 00:00:00","yyyy-MM-dd HH:mm:ss");
			dateIntv.endTime = me.parseDate(year+"-12-31 23:59:59","yyyy-MM-dd HH:mm:ss");
    	}
		return dateIntv;
    }
    /**
     * @param date 
     * @param addYear 
     */
    MyDateUtil.getYearIntvs = function(date,addYear){
    	var dateIntv = {};
    	if(!date){date = new Date()};
    	if(addYear&&typeof addYear == 'number'){
    		date = MyDateUtil.addYears(addYear,date);
    	}
    	var year = date.getFullYear();
    	dateIntv.beginTime = this.parseDate(year+"-01-01 00:00:00","yyyy-MM-dd HH:mm:ss");
		dateIntv.endTime = this.parseDate(year+"-12-31 23:59:59","yyyy-MM-dd HH:mm:ss");
    	return dateIntv;
    }
    
    
    
    
    
	exports.MyDateUtil = MyDateUtil;
	
	//test
//	console.log();
/*	var dateInv = MyDateUtil.getWeekIntvs(MyDateUtil.parseDate("2017-06-18 00:00:00","yyyy-MM-dd HH:mm:ss"),0,1,5);
	console.log("------week-------");
	console.log(dateInv);
	
	//获取近一周的时间段
//	var nearDateInv = MyDateUtil.getNearWeekIntvs(1,new Date(),2);//最近一周 周二开始
	var nearDateInv = MyDateUtil.getNearWeekIntvs(8);
	console.log("------nearDateInv-------");
	console.log(MyDateUtil.formatDateToStr(nearDateInv.beginTime,"yyyy-MM-dd HH:mm:ss"));
	console.log(MyDateUtil.formatDateToStr(nearDateInv.endTime,"yyyy-MM-dd HH:mm:ss"));
	
	//获取近几天的时间段
	var nearDateInv = MyDateUtil.getNearDayIntvs(1);
	console.log("------nearDay-------");
	console.log(MyDateUtil.formatDateToStr(nearDateInv.beginTime,"yyyy-MM-dd HH:mm:ss"));
	console.log(MyDateUtil.formatDateToStr(nearDateInv.endTime,"yyyy-MM-dd HH:mm:ss"));
	
	*/
	/*
	var dateMonthInv = MyDateUtil.getMonthIntvs();
	console.log("------month-------");
	console.log(dateMonthInv);
	
	var getDayIntvs = MyDateUtil.getDayIntvs();
	console.log("------day-------");
	console.log(MyDateUtil.formatDateToStr(getDayIntvs.beginTime,"yyyy-MM-dd HH:mm:ss"));
	console.log(getDayIntvs);
	
	var quarterIntvs = MyDateUtil.getQuarterIntvs(MyDateUtil.parseDate("2017-12-31 00:00:00","yyyy-MM-dd HH:mm:ss"),-1);
	console.log("------quarter-------");
	console.log(quarterIntvs);
	
	var yearIntv = MyDateUtil.getYearIntvs(new Date(),-1);
	console.log("------yearIntv-------");
	console.log(yearIntv);*/
	
	
	
})(window)
