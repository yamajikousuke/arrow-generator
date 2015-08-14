/*global Raphael:true*/
(function() {
    if (Raphael.vml) {
        Raphael.el.strokeLinearGradient = function() {
            // not supporting VML yet
            return this; // maintain chainability
        };
    } else {
        var setAttr = function(el, attr) {
            var key;
            if (attr) {
                for (key in attr) {
                    if (attr.hasOwnProperty(key)) {
                        el.setAttribute(key, attr[key]);
                    }
                }
            } else {
                return document.createElementNS("http://www.w3.org/2000/svg", el);
            }

            return null;
        };

        var defLinearGrad = function(defId, stops) {
            var def = setAttr("linearGradient");
            var i, l;
            def.id = defId;

            for (i = 0, l = stops.length; i < l; i += 1) {
                var stopEle = setAttr("stop");
                var stop = stops[i];
                setAttr(stopEle, stop);

                def.appendChild(stopEle);
            }

            return def;
        };

        Raphael.el.strokeLinearGradient = function(defId, width, stops) {

            if (stops) {
                this.paper.defs.appendChild(defLinearGrad(defId, stops));
            }

            setAttr(this.node, {
                "fill": "url(#" + defId + ")",
                "stroke-width": width
            });

            return this; // maintain chainability
        };

        Raphael.st.strokeLinearGradient = function(defId, width, stops) {
            return this.forEach(function(el) {
                el.strokeLinearGradient(defId, width, stops);
            });
        };

        Raphael.fn.defineLinearGradient = function(defId, stops) {

            this.defs.appendChild(defLinearGrad(defId, stops));
        };

    }
}());

var paper = new Raphael("paper");
var arrowArray = [];
var arrow_cx_Array = [];
var arrow_cy_Array = [];
var arrow_set_num = 0; //デフォルトの矢印
var arrow_value_set_num = 0;
var arrow_scale = 1;
var arrow_deg = 0;
var arrow_old_deg = 0;
var color_start = color_end = smile.arrow_init_color;

//arrow
var arrow = paper.path(smile.arrow[arrow_set_num].path).attr({fill:smile.arrow_init_color,stroke:"none"});
arrow.x = smile.arrow[arrow_set_num].base_coodinate.x;
arrow.y = smile.arrow[arrow_set_num].base_coodinate.y;
arrowArray.push(arrow);
arrow_cx_Array[arrow_set_num] = arrow.getBBox().width/ 2;
arrow_cy_Array[arrow_set_num] = arrow.getBBox().height/ 2;
arrowArray[arrow_set_num].translate(arrow.x, arrow.y);

//arrowスケールスライダー
var arrow_slider = $( "#arrow-scale-slider" ).slider({
	value: 50, min: 10, max: 150, step:5,
	start: function( event, ui ) {

	},
	slide: function( event, ui ) {
		arrow_scale = ui.value / 50;
		$("#disp_scale").text(arrow_scale);

		var matrix = Raphael.matrix();
		arrowArray[arrow_set_num].matrix.e = arrowArray[arrow_set_num].x;
		arrowArray[arrow_set_num].matrix.f = arrowArray[arrow_set_num].y;
		matrix.translate(arrowArray[arrow_set_num].matrix.e, arrowArray[arrow_set_num].matrix.f);
		matrix.scale(arrow_scale, arrow_scale, arrow_cx_Array[arrow_set_num] ,arrow_cy_Array[arrow_set_num]);
		matrix.rotate(-arrow_deg, arrow_cx_Array[arrow_set_num], arrow_cy_Array[arrow_set_num]);
		arrowArray[0].transform(matrix.toTransformString());
	}
});

//矢印rotateスライダー
$( "#arrow-rotate-slider" ).slider({
	value: 0, min: 0, max: 360, step:15,
	slide: function( event, ui ) {
		arrow_deg = ui.value;
		$("#disp_deg").text(arrow_deg);
		arrowArray[arrow_set_num].rotate(arrow_old_deg - arrow_deg, arrow_cx_Array[arrow_set_num], arrow_cy_Array[arrow_set_num]);
		arrowArray[arrow_set_num].matrix.e = arrowArray[arrow_set_num].x;
		arrowArray[arrow_set_num].matrix.f = arrowArray[arrow_set_num].y;
		arrow_old_deg = arrow_deg;
	}
});



//アクション定義
var simpleActionModel = {
   transform: function(num){
            elattrs = [{path: smile.arrow[num].path}];
	    arrowArray[0].animate(elattrs[0], 250);
	},
   show: function(num){
		for(i=0;i<smile.arrow_num;i++) this.hideAll(i);
		arrowArray[num].show();
	},
   hide: function(obj){
		obj.hide();
	},
   hideAll: function(i){
		arrowArray[i].hide();
	},
  color:function(color){
	color_start = color_end = color;
	for(i=0;i<smile.arrow_num;i++) arrowArray[i].attr( "fill", color );
   },
   grad1:function(color_start,color_end){
	$("#grad1").remove();
	paper.defineLinearGradient("grad1", [{
	    "id": "s1",
	    "offset": "0",
	    "style": "stop-color:"+ color_start +";stop-opacity:1;"},
	{
	    "id": "s2",
	    "offset": "1",
	    "style": "stop-color:"+ color_end +";stop-opacity:1;"}]);
	arrowArray[arrow_set_num].strokeLinearGradient ("grad1", 0);
   },
   grad2:function(color_start,color_end){
	$("#grad1").remove();
	paper.defineLinearGradient("grad1", [{
	    "id": "s1",
	    "offset": "0",
	    "style": "stop-color:"+ color_start +";stop-opacity:1;"},
	{
	    "id": "s2",
	    "offset": "1",
	    "style": "stop-color:"+ color_end +";stop-opacity:1;"}]);
	arrowArray[arrow_set_num].strokeLinearGradient ("grad1", 0);
   }
};

//アクション実装
for(i=0;i<smile.arrow_num;i++){
	//クリック処理実装
	j = i + 1;
	$('#arrow'+ j).click({val:i},function(e){
		arrow_value_set_num = e.data.val;
		simpleActionModel.transform(e.data.val);
		$(".arr").css({'border' : '1px solid #ccc'});
		$(this).css({'border' : '1px solid rgb(84, 84, 84)'});
	});
}

//arrowArray[arrow_set_num].show();

//色パレット設定
$("#arrow-color").spectrum({
    hideAfterPaletteSelect:false,
    preferredFormat: "hex",
    showInput: true,
    showButtons: false,
    color: smile.arrow_init_color,//初期値
    showPalette: true,
    palette: [
        ['rgb(230, 0, 18);', 'rgb(235, 97, 0);','rgb(243, 152, 0);','rgb(252, 200, 0);','rgb(255, 251, 0);','rgb(207, 219,0);', 'rgb(143, 195, 31);'],
        ['rgb(34, 172, 56);','rgb(0, 153, 68);','rgb(0, 155, 107);','rgb(0, 158,150);', 'rgb(0, 160, 193);','rgb(0, 160, 233);','rgb(0, 134, 209);'],
        ['rgb(0, 104, 183);','rgb(0, 71,157);', 'rgb(29, 32, 136);','rgb(96, 25, 134);','rgb(146, 7, 131);','rgb(190, 0, 129);','rgb(228, 0,127);'],
        ['rgb(229, 0, 106);','rgb(229, 0, 79);','rgb(230, 0, 51);','rgb(0, 0, 0);']
    ],
    move: function(c) {
	simpleActionModel.color(c.toHexString());
    },
    change: function(c) {
	simpleActionModel.color(c.toHexString());
    }
});


$("#arrow-grade1").spectrum({
    hideAfterPaletteSelect:false,
    preferredFormat: "hex",
    showInput: true,
    showButtons: false,
    color: smile.arrow_init_color,//初期値
    showPalette: true,
    palette: [
        ['rgb(230, 0, 18);', 'rgb(235, 97, 0);','rgb(243, 152, 0);','rgb(252, 200, 0);','rgb(255, 251, 0);','rgb(207, 219,0);', 'rgb(143, 195, 31);'],
        ['rgb(34, 172, 56);','rgb(0, 153, 68);','rgb(0, 155, 107);','rgb(0, 158,150);', 'rgb(0, 160, 193);','rgb(0, 160, 233);','rgb(0, 134, 209);'],
        ['rgb(0, 104, 183);','rgb(0, 71,157);', 'rgb(29, 32, 136);','rgb(96, 25, 134);','rgb(146, 7, 131);','rgb(190, 0, 129);','rgb(228, 0,127);'],
        ['rgb(229, 0, 106);','rgb(229, 0, 79);','rgb(230, 0, 51);','rgb(0, 0, 0);']
    ],
    move: function(c) {
	color_end = c.toHexString();
	simpleActionModel.grad1(color_start, color_end);
    },
    change: function(c) {
	color_end = c.toHexString();
	simpleActionModel.grad1(color_start, color_end);
    }
});

$("#arrow-grade2").spectrum({
    hideAfterPaletteSelect:false,
    preferredFormat: "hex",
    showInput: true,
    showButtons: false,
    color: smile.arrow_init_color,//初期値
    showPalette: true,
    palette: [
        ['rgb(230, 0, 18);', 'rgb(235, 97, 0);','rgb(243, 152, 0);','rgb(252, 200, 0);','rgb(255, 251, 0);','rgb(207, 219,0);', 'rgb(143, 195, 31);'],
        ['rgb(34, 172, 56);','rgb(0, 153, 68);','rgb(0, 155, 107);','rgb(0, 158,150);', 'rgb(0, 160, 193);','rgb(0, 160, 233);','rgb(0, 134, 209);'],
        ['rgb(0, 104, 183);','rgb(0, 71,157);', 'rgb(29, 32, 136);','rgb(96, 25, 134);','rgb(146, 7, 131);','rgb(190, 0, 129);','rgb(228, 0,127);'],
        ['rgb(229, 0, 106);','rgb(229, 0, 79);','rgb(230, 0, 51);','rgb(0, 0, 0);']
    ],
    move: function(c) {
	color_start = c.toHexString();
	simpleActionModel.grad2(color_start, color_end);
    },
    change: function(c) {
	color_start = c.toHexString();
	simpleActionModel.grad2(color_start, color_end);
    }
});

$(function(){

$("#disp_deg").text(arrow_deg);
$("#disp_scale").text(arrow_scale);


$("#paper-bg-color").spectrum({
    hideAfterPaletteSelect:false,
    preferredFormat: "hex",
    showInput: true,
    showButtons: false,
    color: "#d0d0d0",//初期値
    showPalette: true,
    palette: [
        ['rgb(230, 0, 18);', 'rgb(235, 97, 0);','rgb(243, 152, 0);','rgb(252, 200, 0);','rgb(255, 251, 0);','rgb(207, 219,0);', 'rgb(143, 195, 31);'],
        ['rgb(34, 172, 56);','rgb(0, 153, 68);','rgb(0, 155, 107);','rgb(0, 158,150);', 'rgb(0, 160, 193);','rgb(0, 160, 233);','rgb(0, 134, 209);'],
        ['rgb(0, 104, 183);','rgb(0, 71,157);', 'rgb(29, 32, 136);','rgb(96, 25, 134);','rgb(146, 7, 131);','rgb(190, 0, 129);','rgb(228, 0,127);'],
        ['rgb(229, 0, 106);','rgb(229, 0, 79);','rgb(230, 0, 51);','rgb(208, 208, 208);','rgb(148, 148, 148);','rgb(255, 255, 255);','rgb(0, 0, 0);']
    ],
    move: function(c) {
	var paper_bg_color = c.toHexString();
	$('#paper_bg').css({'background-color' : paper_bg_color});

    },
    change: function(c) {
	var paper_bg_color = c.toHexString();
	$('#paper_bg').css({'background-color' : paper_bg_color});
    }


   });

//    $( "#arrs" ).selectable();

$('#view_svg').click(function(){
    $('#input_svg').css({'display':'block'});
    var svg_code = $("#paper").html();
    $('#input_svg').text(svg_code);
    $('#dialog-svg').dialog({
      width: 600,
      height: 500,
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
        }
      }
    });
});

$('#input_svg').click(function(){$(this).select();});

});

function render(svg) {
    var canvas = document.getElementById("thecanvas");
    canvg(canvas, svg);
}

function renderCustom() {
	svgString=remove_newline($('#paper').html());
	render(svgString);
	var cnvs = document.getElementById('thecanvas');
	var date = new Date();
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	var fileName = "arrow_" + y + m + d + h + mi + s;
	savePNG(cnvs, fileName,'canvg/saveme.php');
}

function remove_newline(text){
   text = text.replace(/\r\n/g, "");//IE
   text = text.replace(/\n/g, "");//Firefox
   text = text.replace(/\t/g, "");
   return text;
 } 

