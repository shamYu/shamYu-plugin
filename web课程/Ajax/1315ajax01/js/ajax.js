		function ajax(obj){
			
			var xhr=null;
			
			try{
				xhr=new XMLHttpRequest();			
			}catch(e){
				xhr=new ActiveXObject('Microsoft XMLHTTP');
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
					
			xhr.onreadystatechange=function(){
				if(xhr.readyState==4){
					if(xhr.status==200){
//						将结果传出
//						if(success){
//							success(xhr.responseText);
//						}
						//如果dataType配置了json值，就默认将服务器返回的结果转换为json对象(数组)
						if(obj.dataType=='json'){
							var data=JSON.parse(xhr.responseText);
							obj.success && obj.success(data);
						}else{
							obj.success && obj.success(xhr.responseText);
						}					
					}
				}
			}
		}