"use strict";

var base = require("xbase"),
	fs = require("fs"),
	path = require("path");

//var test = "1-0.75*(100+2)+9/7+-2";
//var test = "100 * -0.25";
//var test = "100*-0.5";
//var test = "-1*-2";
var test = "(2.025-1.35/1.35)*100";

base.info(test);
base.info(parenthesize(test));
base.info(eval(parenthesize(test)));

base.info("\n");
base.info(test);
base.info(fullyParenthesize(test));
base.info(eval(fullyParenthesize(test)));

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

function fullyParenthesize(formula)
{
	var result = [].pushMany("(", formula.replace(/[^+/*-]/g, "").length+1);

	formula.replace(/ /g, "").split("").forEach(function(c, i)
	{
		if(c==="(" || c===")")
			return;

		if("+-/*".contains(c))
			result.push(")");

		result.push(c);
	});

	result.push(")");

	return result.join("");
}