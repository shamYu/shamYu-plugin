		function ajax(obj){
			
			var xhr=null;
			
			try{
				xhr=new XMLHttpRequest();			
			}catch(e){
				xhr=new ActiveXObject('Microsoft XMLHTTP');
			}
			//如果参数data是json对象，将其进行序列化操作
			if(typeof obj.data=='object'){
				var arr=[];
				for(var prop in obj.data){
					arr.push(prop+'='+obj.data[prop])
				}
				obj.data=arr.join('&');
			}
						
			if(obj.method=='GET'&&obj.data){
				obj.url+='?'+obj.data
			}
			
			xhr.open(obj.method,obj.url,true);
			
			if(obj.method=='POST'&&obj.data){
				xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
				xhr.send(obj.data);
			}else{
				xhr.send();
			}
			
			var promise=new Promise(function(success,err){
				xhr.onreadystatechange=function(){
					if(xhr.readyState==4){
						if(xhr.status==200){			
							if(obj.dataType=='json'){
								var data=JSON.parse(xhr.responseText);
								success && success(data);
							}else{
								success && success(xhr.responseText);
							}					
						}else{
							err(xhr.status);
						}
					}
				}
			})
			
			return promise			
		}