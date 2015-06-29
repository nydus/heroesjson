"use strict";

var base = require("xbase"),
	fs = require("fs"),
	path = require("path");

//var test = "1-0.75*(100+2)+9/7+-2";
//var test = "100 * -0.25";
//var test = "100*-0.5";
//var test = "-1*-2";
var test = "(6 / 1) +1  * 0.0507 * 100";

base.info(test);
base.info(parenthesize(test));
base.info(eval(parenthesize(test)));
function parenthesize(formula)
{
	var result = [];
	var seenOperator = false;
	var lastOpenParenLoc = 0;
	var seenOneParenClose = true;
	formula.replace(/ /g, "").split("").forEach(function(c, i)
	{
		if("+-/*".contains(c) && seenOperator && seenOneParenClose && !"+-/*(".contains(result.last()))
		{
			result.splice(lastOpenParenLoc, 0, "(");
			result.push(")");
		}

		if(c==="(")
			seenOneParenClose = false;

		if(c===")")
			seenOneParenClose = true;

		if("+-/*".contains(c) && i!==0 && !"+-/*(".contains(result.last()))
			seenOperator = true;
		result.push(c);
	});

	return result.join("");
}
