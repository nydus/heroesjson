{
	var lookupXMLRef = options.lookupXMLRef;
	var heroid = options.heroid;
	var heroLevel = options.heroLevel;

	function isInt(num)
	{
		return typeof num === 'number' && parseFloat(num) == parseInt(num, 10) && !isNaN(num);
	}

	function findDec(num)
	{
		var a = Math.abs(num);
		num = a, count = 1;

		while(!isInt(num) && isFinite(num))
		{
			num = a * Math.pow(10,count++);
		}

		return count-1;
	}

	var doNumbers = function(num1, num2, op)
	{
		var dec1 = findDec(num1);
		var dec2 = findDec(num2);
		var fixed = dec1>dec2 ? dec1 : dec2;
		var n;
		if(op==="+")
			n = (num1+num2);
		else if(op==="*")
			n = (num1*num2);
		else if(op==="-")
			n = (num1-num2);
		else if(op==="/")
			n = (num1/num2);

		n = n.toFixed(fixed);
		return +n;
	}
}

START
	= any
 
any
	= multiplicative
	/ divisive
	/ additive
	/ subtractive
	/ primary
 
primary
	= float
	/ integer
	/ xmlref
	/ "-" _ any:any { return -1*any; }
	/ "(" any:any ")" { return any; }
	/ "" { return 0; }
	
additive
	= left:primary _ "+" _ right:any { return doNumbers(left, right, "+"); }
 
multiplicative
	= left:primary _ "*" _ right:any { return doNumbers(left, right, "*"); }
 
subtractive
	= left:primary _ "-" _ right:any { return doNumbers(left, right, "-"); }
 
divisive
	= left:primary _ "/" _ right:any { return doNumbers(left, right, "/"); }
   
float "float"
	= neg:"-"? _? left:[0-9]* "." right:[0-9]+ { return parseFloat((neg ? "-" : "") + left.join("") + "." + right.join("")); }
 
integer "integer"
	= neg:"-"? _? digits:[0-9]+ { return parseInt((neg ? "-" : "") + digits.join(""), 10); }

xmlref "xmlref"
	= neg:"-"? _? chars:[A-Za-z0-9,._\[\]]+ { return lookupXMLRef(heroid, heroLevel, chars.join(""), neg); }

_ "whitespace"
	= whitespace*

__ "whitespace"
	= whitespace+

whitespace "whitespace"
	= [ \t\v\f\r\n\u00A0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]
