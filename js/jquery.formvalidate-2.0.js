/* ----------------------------------------------------------------------

* File name:		jquery.formvalidate.js
* Version:			2.0
* Description:	    validate form
* Website: 			generic jQuery plugin
* Version:			2017-01-01
* Author:			Chenjinggang

---------------------------------------------------------------------- */
;
(function($,window,document,undefined){
	var CheckRules = {
			//插件默认正则
			'email-validate':{
				rule : '^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$',
				tip : '邮箱格式不正确'
			},
			'phone-validate':{
				rule : '^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$',
				tip : '手机号码输入不正确'
			},
			'tel-validate':{
				rule : '([0-9]{3,4}-)?[0-9]{7,8}',
				tip : '座机号码输入不正确'
			},
			//自定义正则
			'validateExp':{
			}
 		},
 		defaults = {
	 		warn_color : 'red',
	 		sus_color : 'green',
	 		sign : '*'
 		},
 		pluginName = 'formvalidate';

 	function Formvalidate($element,valiType,options){
 		this.element = $element;
 		this.settings = $.extend({},defaults,options);
 		this.valiType = valiType;
 		this._defaults = defaults;
        this._name = pluginName;
        this.version = 'v2.0';
        this.init(valiType);
 	}
 	//扩展原型链(函数作为对象的一个属性时，并且作为对象的一个属性被调用时，函数中的this指向该对象)
 	Formvalidate.prototype = {
 		init : function(){
 			var that = this,
 				$element = that.element,
 				valiType = that.valiType;
 			return this.validation(that,$element,valiType);
 		},
 		/**
		 * 功能描述：正则校验字段值 的格式
		 * targetValue: 校验的目标值
		 * tipId：提示展示区域id
		 */
 		validateFieldWithReg : function(instance,$element,targetValue,$tip){
 			var result = true;
			for(o in CheckRules){
				var _ruleExp = $element.attr(o),
					_id = $element.attr('id'),
					labelText = $("#" + _id + "Label").text();
				if(_ruleExp !== undefined){
					var rule = "",
						ruleTip = "";
					if(o == 'validateExp') {  //自定义正则校验
						rule = _ruleExp.split(":")[0];
						ruleTip = _ruleExp.split(":")[1];
						if(!ruleTip) ruleTip = labelText + "输入格式有误";
					} else {  //通用正则校验
						rule = CheckRules[o].rule;
						ruleTip = _ruleExp;
					}				
					var reg=new RegExp(rule,'g');
					if(!reg.test(targetValue)){
						if(_ruleExp){
							$tip.text(ruleTip);
						}else{
							$tip.text(CheckRules[o].tip);
						}
						result = false;
					}else {
						$tip.text(instance.settings.sign);
						result = true;
					}
				}	
			}
			return result;			
 		},
 		/**
		 * 功能描述：校验字段的长度(最大长度、最小长度)
		 * valiType: minlength(最小长度)、maxslength(最大长度)
		 * targetValue: 校验的目标值
		 * tipId：提示展示区域id
		 */
		validateFieldLength : function(instance,$element,valiType,targetValue,targetLabel,$tip){
			var result = true,
			_valiType = $element.attr(valiType),
			defaultTip = "";
			if(_valiType){
					var ruleArr = _valiType.split(":"),
						ruleLength = ruleArr[0]-0,
						ruleTip = ruleArr[1];
						
				if( (valiType == "minlength" && targetValue.length<ruleLength)
					|| (valiType == "maxslength" && targetValue.length >ruleLength)){ //最小长度验证
					if(ruleTip && ruleTip.length>0){
							$tip.text(ruleTip);
						} else {
							defaultTip = targetLabel+"输入长度不能小于" + ruleLength + "个字符";
							if(valiType == 'maxslength')
								defaultTip = targetLabel+"输入长度不能大于" + ruleLength + "个字符";
							$tip.text(defaultTip);
						}
						result = false;
				}else{
					$tip.text(instance.settings.sign);
					result = true;
				}
			}
			return result;		
		},
		/**
		 * 功能描述: 两次输入的值是否相同
		 *
		 */
		fieldInputTwiceIdentified : function($element,targetValue,lableText,$tip){
			 var result = true, 
				 equal2Rule = $element.attr('equalField');
			 if(equal2Rule){
				 var ruleArr = equal2Rule.split(":"),
					originFieldValue = $("#" + ruleArr[0]).val(),
					originFieldLabel = $("#" + ruleArr[0] + "Label").text(),
					equalTip =  ruleArr[1];
				 if(targetValue != originFieldValue){
					 if(equalTip){
						$tip.text(equalTip);
						return result = false;
					 } 
					$tip.text(lableText + "的值与" + originFieldLabel + "的值不一致");
					return result = false;
				 }
			 }
			 return result;
		},
		/**
		 * 功能描述:字段值 唯一校验
		 * 配置格式：unique="/companyTemp/verifyCompanyCode"
		 * 服务返回格式：
		 * 	if(company != null){
		 *		return SuccessOrFailure.FAILURE("该企业编码已经存在!");
		 *	}else{
		 *		return SuccessOrFailure.SUCCESS("该企业编码可以使用!");
		 *	}
		 */
		validateFieldValueUnique : function(instance,$element,targetValue,$tip){
			var result = true,
				fieldCode = $element.attr('id'),
				uniqueUri = $element.attr("unique");
			if(uniqueUri){
				var url =  uniqueUri;
				var params = {};
					params[fieldCode] = targetValue;
				$.post(url,params,function(data){
					if(data.success){
						$tip.css("color",instance.settings.sus_color)
									  .html(data.message)
									  .attr("isenable",true);
						result = true;
					}else{
						$tip.html(data.message)
									  .attr("isenable",false);
						result = false;
					}
				});
			}
			return result;
		},		
		/**
		 * 功能描述:具体处理核心函数
		 *
		 */
		validateCore : function(instance,$element){
			var result = true,
				value = $element.val(),			
				lableText = $("#" + $element.attr("id")+"Label").text(),
				tipId = $element.attr("id")+"Tip",
				$tip = $("#" + tipId);
			if(!value){
				$element.addClass("isNotNull");
				return false;
			}
			//正则校验字段值 的格式
			if(!instance.validateFieldWithReg(instance,$element,value,$tip)){
				return false;
			}

			//最小长度校验
			if(!instance.validateFieldLength(instance,$element,'minlength',value,lableText,$tip)){
				return false;
			}

			//最大长度校验
			if(!instance.validateFieldLength($element,'maxslength',value,lableText,$tip)){
				return false;
			}
			 
			 //2次输入值一致校验
			if(!instance.fieldInputTwiceIdentified($element,value,lableText,$tip)) {
				return false;
			}
			 
			 //字段值唯一校验
			 if(!instance.validateFieldValueUnique(instance,$element,value,$tip)) {
					return false;
				}
			return result;
		},
		 /**
		 * 功能描述:实时进行校验提示
		 * formId  验证的表单范围
		 * valiType 验证的方式（realTime,submit）实时验证 、提交验证
		 * email-validate="提示信息"(提示信息可以省略，只配置：email-validate，使用默认提示)
		 * phone-validate="提示信息"(提示信息可以省略，只配置：phone-validate，使用默认提示)     --> 验证手机
		 * tel-validate="提示信息"(提示信息可以省略，只配置：tel-validate，使用默认提示) 		  --> 验证座机
		 * validateExp="^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}$:由数字字母组成(6-15位)"   -->自定义正则表达式以及提示,省略提示，采用默认提示
		 * minlength="15:输入最小长度不能超过15个字符"
		 * maxslength="25:输入最大长度不能超过25个字符"
		 * unique="/companyTemp/verifyUserCode"  唯一校验，访问地址，提示
		 * equalField：2次输入值是否相同,例：equalField="password(起一个对比字段Id):'两次输入的密码不一样!'"
		 */
	    validation : function(instance,$form,valiType){
			var result = true;
			if(valiType == 'realTime') {
				$('[isNotNull],[validateExp][email-validate][phone-validate][tel-validate]',$form).each(function(){
					$(this).blur(function(){  //绑定失去焦点事件
						result = instance.validateCore(instance,$(this));	
					});
					
					$(this).focus(function(){  //绑定获取焦点事件
						$(this).removeClass("isNotNull");
						var tipId = $(this).attr("id")+"Tip";
						$("#"+tipId).css("color",instance.settings.warn_color)
							        .text(instance.settings.sign);
					});
				});
			}else{
				$('[isNotNull],[validateExp][email-validate][phone-validate][tel-validate]',$form).each(function(){
					result = instance.validateCore(instance,$(this));	
					if(!result)return false;
				});
			}
			return result;
		}
	};
	/**
	 * 表单提交验证
	 * @param formId
	 */
	 $.fn.validateForm = function(options){
	 	return new Formvalidate(this,'submit',options);
	 }
	
	/**
	 * 输入实时校验
	 * @param formId
	 */
	 $.fn.validateRealTime = function(options){
	 	return new Formvalidate(this,'realTime',options);
	 }


})(jQuery,window,document);

