{
	var lookupXMLRef = options.lookupXMLRef;

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

	var addNumbers = function(num1, num2)
	{
		var dec1 = findDec(num1);
		var dec2 = findDec(num2);
		var fixed = dec1>dec2 ? dec1 : dec2;
		var n = (num1+num2).toFixed(fixed);
		return +n;
	}

	var multiplyNumbers = function(num1, num2)
	{
		var dec1 = findDec(num1);
		var dec2 = findDec(num2);
		var fixed = dec1>dec2 ? dec1 : dec2;
		var n = (num1*num2).toFixed(fixed);
		return +n;
	}
}

START
  = additive

additive
	= left:multiplicative _ "+" _ right:additive { return addNumbers(left, right); }
	/ multiplicative

multiplicative
	= left:primary _ "*" _ right:multiplicative { return multiplyNumbers(left, right); }
	/ primary

primary
	= integer
	/ xmlprimary
	/ neg:"-"? _? "(" additive:additive ")" { return neg ? (-1*additive) : additive; }

xmlprimary
	= neg:"-"? _? chars:[A-Za-z0-9,._\[\]]+ { return lookupXMLRef(chars.join(""), neg); }

integer "integer"
	= neg:"-"? _? digits:[0-9-]+ { return parseInt((neg ? "-" : "") + digits.join(""), 10); }

_ "whitespace"
	= whitespace*

__ "whitespace"
	= whitespace+

whitespace "whitespace"
	= [ \t\v\f\r\n\u00A0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]
