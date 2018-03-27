// Setting

var site_url = 'insgm.ru';
var static_url = 'https://web.archive.org/web/20161106151616/http://insgm.ru/';
document.domain = site_url;

if(cookie_get('screen') == undefined || cookie_get('screen') != $(window).width()+"x"+$(window).height()
|| cookie_get('time_zone') == undefined) 
{
	if(cookie_get('screen') == undefined || cookie_get('screen') != $(window).width()+"x"+$(window).height()) setCookie('screen', $(window).width()+"x"+$(window).height(), {expires: 60 * 60 * 24 * 30, path: "/", domain: site_url});
	else if(cookie_get('time_zone') == undefined)
	{
		var time_zone = new Date();
		time_zone = -time_zone.getTimezoneOffset()/60;
		setCookie('time_zone', time_zone, {expires: 60 * 60 * 24 * 30, path: "/", domain: site_url});
	}
	window.location.reload();
}

var comment_select = -1;
var wall_post_select = -1;
var dc_select = -1;
var wall_post_select_comments = -1;
var dialog_open = 'none';
var dialog_type = 1;
var u_id_global = cookie_get("u_id");
if(u_id_global == undefined) u_id_global = -1;
var u_profile_id = -1;
var u_profile_load = -1;

if(localStorage['load'] == undefined) localStorage['load'] = 1;
Date.prototype.getUnix = function() { return Math.round(this.getTime() / 1000) }

// Socket Callback's

function OnSocketConnect() 
{
	var data = [];
	data[0] = "Connect";
	data[1] = get_cookie("SID");
	socket.send(JSON_stringify(data, false));
}

function OnSocketDisconnect()
{
	perform_script('ws_connect.php');
}

function OnSocketMessage(e) 
{
	var data = jQuery.parseJSON(e.data);
	data_handler(data);
}

// Function's

var list_status = [];
function click_list(id)
{
	var s_id = '';
	if(id == 0) s_id = '.game_select_list';
	else if(id == 1) s_id = '.user_info_list';
	if(!list_status[id])
	{
		list_status[id] = 2;
		$(s_id).slideDown(400, function()
		{
			list_status[id] = 1;
		});
	}
	else if(list_status[id] == 1)
	{
		list_status[id] = 0;
		$(s_id).slideUp(400);
	}
}

$(document).click(function(event) 
{
	$.each(list_status, function(index, value) 
	{ 
		if(value == 1)
		{
			var s_id = '';
			if(index == 0) s_id = '.game_select_list';
			else if(index == 1) s_id = '.user_info_list';
			if ($(event.target).closest(s_id).length) return;
			click_list(index);
			event.stopPropagation();
		}
	});
});

var servers_list_status = [];
function servers_list(id, status, ip, name)
{
	if(status == 1 && !servers_list_status[id])
	{
		servers_list_status[id] = 2;
		$("#servers_list_"+id).slideDown(400, function()
		{
			servers_list_status[id] = 1;
		});
	}
	else if(!status && servers_list_status[id] == 1)
	{
		$("#display_ip_"+id).html('<a class="display_ip" href="samp://'+ip+'">'+ip+'</a>');
		$("#server_name_"+id).html('IP (#'+name+'):');
		servers_list_status[id] = 2;
		$("#servers_list_"+id).slideUp(200, function()
		{
			servers_list_status[id] = 0;
		});
	}
}

function server_select(p_id, id, ip, name)
{
	$("#display_ip_0").html('<a class="display_ip" href="samp://'+ip+'">'+ip+'</a>');
	$("#server_name_0").html('IP (#'+name+'):');
	servers_list_status[0] = 2;
	$("#servers_list_0").slideUp(200, function()
	{
		servers_list_status[0] = 0;
	});
	perform_script('page_load.php', 'page=project&id='+p_id+'&server_id='+id);
	/*$.ajax(
	{
		type: "POST",
		url: "../../scripts/load_s_info.php",
		data: "p_id="+p_id+"&s_id="+id,
		dataType: "html",
		success: function(data) 
		{ 
			$("#online_chart").html(data);
		}
	});*/
}

function load_page(page)
{
	$('#page_content').html('');
	perform_script('page_load.php', page);
}

function set_page(data, reload)
{
	if(reload == undefined) reload = '0';
	data = JSON.parse(data);
	this.page = '/'+data['game']+'/';
	if(data['admin'] != undefined) this.page = this.page+'admin/';
	this.page = this.page+data['page'];
	if(data['page_id'] != undefined) this.page = this.page+'/'+data['page_id'];
	else data['page_id'] = -1;
	if(data['params'] != undefined) this.page = this.page+'?'+data['params'];
	client_info.set_page(data);
	history.pushState(null, null, this.page);
	if(reload == 1) location.href = 'http://'+document.domain+this.page;
}

function close_dialog(noscript, datas) 
{
	if(noscript == undefined) 
	{
		if (datas == undefined) datas = '';
		perform_script('close_dialog.php', datas);
	}
	$('#dialog').hide();
	$('#dialog').html('');
	$('body').css('overflow', 'auto');
	dialog_open = 'none';
}

function open_dialog(script, datas) 
{ 
	if (datas == undefined) datas = '';
	perform_script(script, datas);
	$('#dialog').show();
	$('body').css('overflow', 'hidden');
	dialog_type = 1;
}

function open_dialog_new(script, datas) 
{ 
	perform_script_new(script, datas);
	$('#dialog').show();
	$('body').css('overflow', 'hidden');
	dialog_type = 1;
}

function open_dialog_2(script, datas) 
{ 
	if (datas == undefined) datas = '';
	$('#dialog').append('<div class="dialog_2"></div>');
	perform_script(script, datas);
	$('#dialog .dialog_workspace').hide();
	dialog_type = 2;
}

function close_dialog_2(noscript, datas) 
{
	$('#dialog .dialog_2').remove();
	$('#dialog .dialog_workspace').show();
	dialog_type = 1;
}

function perform_script(script, datas, dtype)
{
	if (dtype == undefined) dtype = 'json';
	if (datas == undefined) datas = '';
	datas = 'game='+client_info.game+'&'+datas;
	$.ajax(
	{
		type: "POST",
		url: "http://"+site_url+"/scripts/"+script,
		data: datas,
		dataType: dtype,
		success: function(data) 
		{ 
			if(data != null && data.length > 0)
			{
				if(dtype == 'html') data = JSON.parse(data);
				data_handler(data); 
				page_update = 1;
			}
		}
	});
}

function perform_script_new(script, datas, callback)
{
	if(datas == undefined) datas = {};
	datas.game = client_info.game;
	if(callback == undefined)
	{
		callback = function(data) 
		{
			if(data != null && data.length > 0)
			{
				data = JSON.parse(data);
				data_handler(data); 
				page_update = 1;
			}
		}
	}
	$.ajax(
	{
		type: "POST",
		url: "http://"+site_url+"/scripts/"+script,
		data: datas,
		dataType: 'html',
		success: callback
	});
}

function page_update(load_data)
{
	$.ajax(
	{
		type: "POST",
		url: "./scripts/page_update.php",
		data: "load_data="+load_data,
		dataType: "json",
		success: function(data)
		{
			data_handler(data);
		}
	});
}
		
function data_handler(data)
{
	if(data == null) return 1;
	var data_count = 0;
	$.each(data, function(index, value) { data_count++; });
	if (data_count != 0)
	{
		for (var i = 0; i < data_count; i++)
		{
			if(data[i][0] != null && data[i][0].length > 1) 
			{
				if(data[i][0] == 'alert') alert(data[i][1]);
				else
				{
					if(data[i][2] == 'script') data[i][1] = '<script>'+data[i][1]+'</script>';
					if(data[i][3] == 'html') $(data[i][0]).html(data[i][1]);
					else if(data[i][3] == 'append') $(data[i][0]).append(data[i][1]);
					else if(data[i][3] == 'remove') $(data[i][0]).remove();
					else if(data[i][3] == 'replance') $(data[i][0]).replaceWith(data[i][1]);
					else if(data[i][3] == 'after') $(data[i][0]).after(data[i][1]);
					else if(data[i][3] == 'before') $(data[i][0]).before(data[i][1]);
				}
			}
		}
	}
}

var t_id = -1;

function start_timer(timer_id, time)
{
	if(t_id != -1) clearTimeout(t_id);
	var date = new Date();
	t_id = setTimeout("process_timer("+timer_id+", "+time+", "+date.getSeconds()+")", 250);
}

function process_timer(timer_id, time, seconds)
{
	if(time != 0)
	{
		var date = new Date();
		if(date.getSeconds() != seconds) time--;
		if(time <= 0) perform_script('page_update.php');
		else 
		{
			var time_minute = Math.floor(time/60);
			var time_second = time-(time_minute*60);
			if(timer_id == 1) $('#last_time').html(''+time_format(2, time_minute)+':'+time_format(2, time_second)+'');
			t_id = setTimeout("process_timer("+timer_id+", "+time+", "+date.getSeconds()+")", 250);
		}
	}
}

function time_format(digits_length, source)
{
    var text = source + '';
    while(text.length < digits_length)
        text = '0' + text;
    return text;
}

function cookie_get(name) 
{
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
  options = options || {};
  var expires = options.expires;
  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }
  value = encodeURIComponent(value);
  var updatedCookie = name + "=" + value;
  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }
  document.cookie = updatedCookie;
}

function cookie_delete(name) 
{
	document.cookie = name + "=" + "; expires=Thu, 01 Jan 1970 00:00:01 GMT";
}

function avatar_hover()
{
	$("#profile_avatar").hover(
		function () {
			if($("div").is("#profile_avatar_edit")) $("#profile_avatar_edit").slideDown(300);
		},
		function () {
			if($("div").is("#profile_avatar_edit")) $("#profile_avatar_edit").slideUp(300);
		}
	);
}

function preloadImages()
{
	for(var i = 0; i<arguments.length; i++) $("<img />").attr("src", arguments[i]);
}

function page_init(page)
{
	if(page == 'project')
	{
		$(".select_rating .rating").slideControl();
		preloadImages("/assets/img/icon_wrap.png");
	}
}

window.onpopstate = function(e) {
    location.href = location.href;
	//alert(window.location.pathname);
	//set_page(window.location.pathname);
	//perform_script('page_load.php', 'page=news')
}
		
$(document).ready(function()
{
	Socket_Connect();
	avatar_hover();
	if(wall_post_select != -1) setTimeout(function() { profile_wall.select('', wall_post_select); }, 300);
	if(wall_post_select_comments != -1) 
	{
		setTimeout(function() { open_dialog('dialogs/profile_wall_comments.php', 'id='+wall_post_select_comments+''); }, 300);
		if(comment_select != -1) setTimeout(function() { comments_data.select('', comment_select); }, 600);
	}
	else if(comment_select != -1) setTimeout(function() { comments_data.select('', comment_select); }, 300);
	else if(dc_select != -1) setTimeout(function() { discuss_module.comment_select('', dc_select); }, 300);
});

// Project

function select_spoiler(id)
{
	if($("#spoiler_"+id+" .s_content").css('display') == 'none') 
	{
		$("#spoiler_"+id+" .s_content").slideDown(400);
		$("#spoiler_"+id+" .right_icon").replaceWith('<img alt="" class="right_icon" src="/assets/img/icon_wrap.png">');
	}
	else 
	{
		$("#spoiler_"+id+" .s_content").slideUp(400);
		$("#spoiler_"+id+" .right_icon").replaceWith('<img alt="" class="right_icon" src="/assets/img/icon_deploy.png">');
	}
}

var rating_timeout = {};
var rating_status = {};
var rating_value = {};
var online_data = {};

var online_options = {
	animation: false,
	showScale: true,
	scaleOverride: false,
	scaleSteps: 3,
	scaleStepWidth: 1,
	scaleStartValue: 7,
	scaleLabel: " <%=value%>",
	scaleShowGridLines : true,
	scaleShowVerticalLines: false,
	scaleFontColor: "#aaa",
	showTooltips: false,
	tooltipEvents: ["mousemove"],
	bezierCurve : true,
	bezierCurveTension : 0.4,
	pointDot : false,
	datasetStroke : false,
	datasetFill : true
};

function select_rating_show(id, type)
{
	if((type == 2 && rating_status[id] == 1) || type == 1)
	{
		clearTimeout(rating_timeout[id]);
		if(id == -1) $("#project").slideDown(400); 
		else $("#server_"+id).slideDown(400); 
		rating_status[id] = 1;
		if(type == 1)
		{
			if(id == -1) rating_value[id] = $("#project .rating").val(); 
			else rating_value[id] = $("#server_"+id+" .rating").val();  
		}
	}
}

function select_rating_hide(p_id, id, time)
{
	rating_timeout[id] = setTimeout(function() { 
		var server_id;
		var rating;
		if(id == -1)
		{
			$("#project").slideUp(400); 
			rating = $("#project .rating").val(); 
		}
		else
		{
			$("#server_"+id).slideUp(400); 
			rating = $("#server_"+id+" .rating").val();  
		}
		rating_status[id] = 0;
		if(rating != rating_value[id]) 
		{
			if(id == -1) $("#p_rating_display").html(rating);
			else $("#s"+id+"_rating_display").html(rating);
			perform_script('s_rating.php', 'p_id='+p_id+'&s_id='+id+'&rating='+rating);
		}
	}, time);
}

function online_zoom(id)
{
	$('#dialog').show();
	$('#dialog').html('<div class="dialog_workspace">\
		<div class="dialog_content" onmouseenter="dialog.mouse_enter()" onmouseleave="dialog.mouse_leave()">\
			<canvas id="chart_online_big" style="width:500px;height:250px"></canvas>\
		</div>\
		<img class="icon_dialog_close" alt="" src="/assets/img/icon_close_2.png">\
		<script>dialog.init()</script>\
	</div>');
	new Chart($("#chart_online_big").get(0).getContext("2d")).Line(online_data[id], online_options);
}

function playing_status_change()
{
	var playering_status = parseInt($('#button_play').attr("status"));
	if(!playering_status) 
	{
		$('#button_play').attr("status", "1");
		$('#button_play').html("Не играю здесь");
		$('#players_count').html(parseInt($('#players_count').html())+1);
	}
	else 
	{
		$('#button_play').attr("status", "0");
		$('#button_play').html("Играю здесь");
		$('#players_count').html(parseInt($('#players_count').html())-1);
	}
	this.params = {};
	this.params.page = client_info.page;
	this.params.page_id = client_info.page_id;
	perform_script_new('update_playing_status.php', this.params);
}

function find_show(id)
{
	if(id == undefined) id = 'projects_menu';
	$(".sorting").hide();
	$("#"+id+" .find").addClass("find_active");
	$("#"+id+" .find_text").show();
	$("#"+id+" .find_close").show();
}

function find_hide(id)
{
	if(id == undefined) id = 'projects_menu';
	$("#"+id+" .find").removeClass("find_active");
	$("#"+id+" .find_text").val('')
	$("#"+id+" .find_text").hide();
	$("#"+id+" .find_close").hide();
	$(".sorting").show();
	if(find_text != '') 
	{
		if(id == 'projects_menu') perform_script('find_projects.php');
		else if(id == 'job_sorting') perform_script('load_job.php', 'section='+content_navigation[0].sorting_status+'&sorting='+$('#sections_list').attr('data-select'));
		find_text = '';
	}
}

var find_timeout_id; 
var find_text = '';
function find_change(id)
{
	if(id == undefined) id = 'projects_menu';
	clearTimeout(find_timeout_id); 
	find_timeout_id = setTimeout(function() {
		if(find_text != $("#"+id+" .find_text").val()) 
		{
			if(id == 'projects_menu') perform_script('find_projects.php', 'text='+$("#"+id+" .find_text").val());
			else if(id == 'job_sorting') perform_script('load_job.php', 'text='+$("#"+id+" .find_text").val()+'&section='+content_navigation[0].sorting_status+'&sorting='+$('#sections_list').attr('data-select'));
		}
		find_text = $("#"+id+" .find_text").val();
	}, 1000);
}

function ProjectsFilters()
{
	this.data = {};
	this.init = function(block, id, name, count, status) 
	{
		if(this.data[block] == undefined) this.data[block] = {};
		this.data[block][id] = {};
		this.data[block][id]['status'] = status;
		this.data[block][id]['name'] = name;
		this.data[block][id]['count'] = count;
		if(!status) $(block).append('<div class="filters_tags click" onclick="filters.click(\''+block+'\', '+id+')" id="'+id+'">'+name+'<span class="count">'+count+'</span></div>');
		else $(block).append('<div class="filters_tags click" onclick="filters.click(\''+block+'\', '+id+')" id="'+id+'">'+name+'<img alt="" src="/assets/img/icon_accept.png" class="icon_accept"></div>');
	};
	this.click = function(block, id)
	{
		if(!this.data[block][id]['status'])
		{
			$(block+' .filters_tags#'+id).replaceWith('<div class="filters_tags click" onclick="filters.click(\''+block+'\', '+id+')" id="'+id+'">'+this.data[block][id]['name']+'<img alt="" src="/assets/img/icon_accept.png" class="icon_accept"></div>');
			this.data[block][id]['status'] = 1;
		}
		else
		{
			$(block+' .filters_tags#'+id).replaceWith('<div class="filters_tags click" onclick="filters.click(\''+block+'\', '+id+')" id="'+id+'">'+this.data[block][id]['name']+'<span class="count">'+this.data[block][id]['count']+'</span></div>');
			this.data[block][id]['status'] = 0;
		}
	};
	this.save = function()
	{
		close_dialog();
		perform_script('projects_filters_save.php', 'data='+JSON.stringify(this.data));
	};
}

function ContentNavigation()
{
	this.init = function(page, max_page, id)
	{
		this.sorting_status = 2;
		this.page = page;
		this.max_page = max_page;
		this.id = id;
		if(id == 1 || id == 2 || id >= 4 && id <= 6) this.name = 'content_navigation[0]';
		else if(id == 3) this.name = 'content_navigation[1]';
		this.update();
	}
	this.sorting = function(item) 
	{
		if(this.sorting_status != item) 
		{
			if(this.id == 1) perform_script('find_projects.php', 'sorting='+item);
			else if(this.id == 5) perform_script('load_job.php', 'section='+item);
			$('.sorting .item#'+this.sorting_status).removeClass('selected');
			$('.sorting .item#'+item).addClass('selected');
			this.sorting_status = item;
		}
	}
	this.page_select = function(page) 
	{
		if(this.page != page) 
		{
			if(find_text != '') perform_script('find_projects.php', 'page='+page+'&sorting='+this.sorting_status+'&text='+find_text);
			else 
			{
				if(this.id == 1) perform_script('find_projects.php', 'page='+page+'&sorting='+this.sorting_status);
				else if(this.id == 2) perform_script('news_page_load.php', 'page='+page);
				else if(this.id == 3) perform_script('s_news_page_load.php', 'page='+page);
				else if(this.id == 4) perform_script('profile_wall_load.php', 'page='+page);
				else if(this.id == 5) perform_script('load_job.php', 'section='+this.sorting_status+'&sorting='+$('#sections_list').attr('data-select')+'&page='+page);
			}
			this.page = page;
			this.update();
		}
	}
	this.page_next = function() 
	{
		this.page++;
		if(find_text != '') perform_script('find_projects.php', 'page='+page+'&sorting='+this.sorting_status+'&text='+find_text);
		else 
		{
			if(this.id == 1) perform_script('find_projects.php', 'page='+this.page+'&sorting='+this.sorting_status);
			else if(this.id == 2) perform_script('news_page_load.php', 'page='+this.page);
			else if(this.id == 3) perform_script('s_news_page_load.php', 'page='+this.page);
			else if(this.id == 4) perform_script('profile_wall_load.php', 'page='+this.page);
			else if(this.id == 5) perform_script('load_job.php', 'section='+this.sorting_status+'&sorting='+$('#sections_list').attr('data-select')+'&page='+this.page);
		}
		this.update();
	}
	this.page_previous = function() 
	{
		this.page--;
		if(find_text != '') perform_script('find_projects.php', 'page='+page+'&sorting='+this.sorting_status+'&text='+find_text);
		else 
		{
			if(this.id == 1) perform_script('find_projects.php', 'page='+this.page+'&sorting='+this.sorting_status);
			else if(this.id == 2) perform_script('news_page_load.php', 'page='+this.page);
			else if(this.id == 3) perform_script('s_news_page_load.php', 'page='+this.page);
			else if(this.id == 4) perform_script('profile_wall_load.php', 'page='+this.page);
			else if(this.id == 5) perform_script('load_job.php', 'section='+this.sorting_status+'&sorting='+$('#sections_list').attr('data-select')+'&page='+this.page);
		}
		this.update();
	}
	this.update = function(max_page)
	{
		if(max_page !== undefined) 
		{
			this.page = 1;
			this.max_page = max_page;
		}
		$('#page_navigation_'+this.id).html('');
		if(this.page != 1) $('#page_navigation_'+this.id).append('<img alt="" class="left" src="/assets/img/icon_page_left.png" onclick="'+this.name+'.page_previous()">');
		$('#page_navigation_'+this.id).append('<div id="pages">');
			if(this.page >= 2)
			{
				$('#page_navigation_'+this.id+' #pages').append('<span class="item click" id="first_page" onclick="'+this.name+'.page_select(1)">1</span><span class="item">..</span>');
			}
			$('#page_navigation_'+this.id+' #pages').append('<span class="item active">'+this.page+'</span>');
			if(this.page < this.max_page)
			{
				$('#page_navigation_'+this.id+' #pages').append('<span class="item">..</span><span class="item click" id="first_page" onclick="'+this.name+'.page_select('+this.max_page+')">'+this.max_page+'</span>');
			}
		$('#page_navigation_'+this.id).append('</div>');
		if(this.page != this.max_page) $('#page_navigation_'+this.id).append('<img alt="" class="right" src="/assets/img/icon_page_right.png" onclick="'+this.name+'.page_next()">');
		if(this.page == 1)
		{
			if(this.max_page < 2) $('#page_navigation_'+this.id+'_block').hide();
			else $('#page_navigation_'+this.id+'_block').show();
		}
	}
}
var content_navigation = [];
content_navigation[0] = new ContentNavigation();
content_navigation[1] = new ContentNavigation();

function CommentsList()
{
	this.sorting = 1;
	this.init = function(page, max_page) 
	{
		this.page = page;
		this.max_page = max_page;
		this.update();
	}
	this.page_select = function(page) 
	{
		if(this.page != page) 
		{
			perform_script('comments_load.php', 'page='+page);
			this.page = page;
			this.update();
		}
	}
	this.page_next = function() 
	{
		this.page++;
		perform_script('comments_load.php', 'page='+this.page);
		this.update();
	}
	this.page_previous = function() 
	{
		this.page--;
		perform_script('comments_load.php', 'page='+this.page);
		this.update();
	}
	this.update = function()
	{
		$('#page_navigation').html('');
		if(this.max_page > 1)
		{
			if(this.page != 1) $('#page_navigation').append('<img alt="" class="left" src="/assets/img/icon_page_left.png" onclick="comments_list.page_previous()">');
			$('#page_navigation').append('<div id="pages">');
				if(this.page >= 2)
				{
					$('#page_navigation #pages').append('<span class="item click" id="first_page" onclick="comments_list.page_select(1)">1</span><span class="item">..</span>');
				}
				$('#page_navigation #pages').append('<span class="item active">'+this.page+'</span>');
				if(this.page < this.max_page)
				{
					$('#page_navigation #pages').append('<span class="item">..</span><span class="item click" id="first_page" onclick="comments_list.page_select('+this.max_page+')">'+this.max_page+'</span>');
				}
			$('#page_navigation').append('</div>');
			if(this.page != this.max_page) $('#page_navigation').append('<img alt="" class="right" src="/assets/img/icon_page_right.png" onclick="comments_list.page_next()">');
			$('#page_navigation').show();
		}
		else $('#page_navigation').hide();
	}
	this.sorting_open = function()
	{
		$('#comments_sorting #status').hide();
		$('#comments_sorting #select').show();
	}
	this.sorting_close = function(cancel)
	{
		if(cancel == 1) clearTimeout(this.sorting_close_timeout);
		else
		{
			this.sorting_close_timeout = setTimeout(function() {
				$('#comments_sorting #status').show();
				$('#comments_sorting #select').hide();
			}, 1000);
		}
	}
	this.sorting_select = function(sorting)
	{
		if(this.sorting != sorting)
		{
			this.sorting = sorting;
			if(sorting == 1) 
			{
				$('#comments_sorting #status .text').html('Новые');
				$('.input_block').show();
			}
			else if(sorting == 2) 
			{
				$('#comments_sorting #status .text').html('Популярные');
				$('.input_block').hide();
			}
			perform_script('comments_load.php', 'page=1&sorting='+sorting);
		}
		$('#comments_sorting #select').hide();
		$('#comments_sorting #status').show();
	}
}

function CommentsData(main_comments)
{
	this.reply_id = -1;
	this.u_id = cookie_get('u_id');
	this.change_time = {};
	this.display_count = 0;
	this.u_rating = [];
	this.main_comments = main_comments;
	this.edit_comment = 0;
	this.data = {};
	this.fading = function(id)
	{
		setTimeout(function() 
		{
			comments_data.change_time[id]--;
			// 247
			$('#'+id+'.comment_block').css('background', 'RGBA(247,247,247,'+(comments_data.change_time[id]/100)+')');
			if(comments_data.change_time[id] != 0) comments_data.fading(id);
			else $('#'+id+'.comment_block').css('background', '#fff');
		}, 100);
	}
	this.init = function(id, nickname, avatar, text, date, unix_date, rating, u_rating, u_id, url, reply, realtime)
	{
		if(realtime == 1 && comments_list.sorting != 1) return 1;
		if(realtime == 1 && reply == -1) this.main_comments++;
		if(!realtime || comments_list.page == 1)
		{
			for(var a = 0; a <= this.comments_count; a++)
			{
				if(reply == -1)
				{
					if(this.data[a] != undefined) continue;
					this.data[a] = {};
					this.data[a].id = id;
					this.comments_count++;
					this.data[a].index = this.comments_count;
					//if(this.data.first == undefined) this.data.first = id;
					this.data[a].reply = {};
					this.data[a].reply.count = 0;
					this.show(this.data[a], id, nickname, avatar, text, date, unix_date, rating, u_rating, u_id, url, reply, realtime);
					if(this.comments_count >= 11)
					{
						for(var b = 0; b <= this.comments_count; b++)
						{
							if(this.data[b] == undefined || this.data[b].index != 1) continue;
							this.delete(this.data[b].id, 1);
							break;
						}
					}
					break;
				}
				else
				{
					if(this.data[a] == undefined || this.data[a].id != reply) continue;
					for(var b = 0; b <= this.data[a].reply.count; b++)
					{
						if(this.data[a].reply[b] != undefined) continue;
						this.data[a].reply[b] = {};
						this.data[a].reply[b].id = id;
						this.data[a].reply[b].main = a
						this.data[a].reply.count++;
						this.data[a].reply[b].index = this.data[a].reply.count;
						//this.data[a].index = this.comments_count;
						//if(this.data[a].reply.first == undefined) this.data[a].reply.first = id;
						this.show(this.data[a].reply[b], id, nickname, avatar, text, date, unix_date, rating, u_rating, u_id, url, reply, realtime);
						break;
					}
					break;
				}
			}
		}
		else if(comments_list.page != 1) perform_script('comments_load.php', 'page='+comments_list.page);
		if(realtime == 1)
		{
			this.change_time[id] = 100;
			this.fading(id);
			this.display_count = parseInt($('#comments_count').html());
			this.display_count++;
			$('#comments_count').html(this.display_count);
			if(comments_list.max_page != Math.ceil(this.main_comments/10))
			{
				comments_list.max_page = Math.ceil(this.main_comments/10);
				comments_list.update();
			}
			//this.delete($('.comment_block:last').attr('id'));
		}
		this.u_rating[id] = u_rating;
	}
	this.show = function(data, id, nickname, avatar, text, date, unix_date, rating, u_rating, u_id, url, reply, realtime) 
	{
		this.block_content = '<div class="comment_data" id="'+id+'">';
			if(reply == -1) this.block_content = this.block_content+'<div class="comment_block" id="'+id+'" onmouseover="comments_data.mouse_over('+id+')" onmouseout="comments_data.mouse_out('+id+')">';
			else 
			{
				if(this.data[data.main].index == 1 && data.index == 1) $('.comment_data#'+this.data[data.main].id+' .comment_block').after('<div class="split_1"></div>');
				else if(data.index != 1) this.block_content = this.block_content+'<div class="split_2"></div>';
				this.block_content = this.block_content+'<div class="comment_block reply_block" id="'+id+'" onmouseover="comments_data.mouse_over('+id+')" onmouseout="comments_data.mouse_out('+id+')">';
			}
				this.block_content = this.block_content+'<img class="avatar click" alt="" src="'+static_url+'/uploads/avatars/min_'+avatar+'" onclick="perform_script(\'page_load.php\', \'page=profile&id='+u_id+'\')">\
				<div class="comment_info">\
					<div class="clearfix top_elements">\
						<div class="nickname"><span onclick="perform_script(\'page_load.php\', \'page=profile&id='+u_id+'\')">'+nickname+'</span><span class="url" style="display: none" onclick="comments_data.select(\''+url+'\', '+id+')">#</span></div>';
						if(this.u_id == u_id)
						{
							this.block_content = this.block_content+'<img class="delete" alt="" src="/assets/img/icon_close.png" style="display: none" onclick="comments_data.delete_click('+id+')">\
							<img class="edit" alt="" src="/assets/img/icon_edit.png" style="display: none" onclick="comments_data.edit('+id+')">';
						}
					this.block_content = this.block_content+'</div>\
					<div class="text">'+text+'</div>\
					<div class="clearfix bottom_elements">\
						<div class="date">'+date+'</div>\
						<div class="rating_elements">\
							<img alt="" class="icon" src="/assets/img/icon_rating.png">';
							if(this.u_id != -1) 
							{
								if(u_rating == 1) this.block_content = this.block_content+'<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="comments_data.rating('+id+', 1)" style="display: none">';
								else this.block_content = this.block_content+'<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="comments_data.rating('+id+', 1)" style="display: none">';
							}
							if(rating > 0) this.block_content = this.block_content+'<div class="comment_rating" style="color: #81c784">+'+rating+'</div>';
							else if(rating < 0) this.block_content = this.block_content+'<div class="comment_rating" style="color: #ef9a9a">'+rating+'</div>';
							else this.block_content = this.block_content+'<div class="comment_rating" style="color: #010101;opacity: 0.5">0</div>';
							if(this.u_id != -1) 
							{
								if(u_rating == -1) this.block_content = this.block_content+'<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="comments_data.rating('+id+', -1)" style="display: none">';
								else this.block_content = this.block_content+'<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="comments_data.rating('+id+', -1)" style="display: none">';
							}
						this.block_content = this.block_content+'</div>';
						if(this.u_id != -1) 
						{
							if(reply == -1) this.block_content = this.block_content+'<div class="reply" style="display: none" onclick="comments_data.reply_select('+id+', \''+nickname+'\')">Ответить</div>';
							else this.block_content = this.block_content+'<div class="reply" style="display: none" onclick="comments_data.reply_select('+this.data[data.main].id+', \''+nickname+'\')">Ответить</div>';
						}
					this.block_content = this.block_content+'</div>\
				</div>\
			</div>';
			if(reply == -1 && data.index != 1) this.block_content = this.block_content+'<div class="split_1"></div>';
			this.block_content = this.block_content+'<div id="reply_comment_'+id+'"></div>\
		</div>';
		if(reply == -1) $('#comments_list').prepend(this.block_content);
		else $('#reply_comment_'+reply).append(this.block_content);
		if(reply != -1 && u_id == this.u_id && realtime == 1)
		{
			var position = $('.comment_data#'+id).offset().top-300;
			$('body').animate({scrollTop:position}, '500');
		}
	}
	this.delete = function(id, hide)
	{
		if($('.comment_data').is('#'+id))
		{
			for(var a = 0; a <= this.comments_count; a++)
			{
				if(this.data[a] == undefined) continue;
				if(this.data[a].id == id)
				{
					for(var b = 0; b <= this.comments_count; b++)
					{
						if(this.data[b] == undefined || this.data[b].id == id
						|| this.data[b].index < this.data[a].index) continue;
						this.data[b].index--;
						if(this.data[b].index == 1) $('.comment_data#'+this.data[b].id+' .split_1').remove();
					}
					if(this.data[a].reply.count != 0)
					{
						for(var b = 0; b <= this.data[a].reply.count; b++)
						{
							if(this.data[a].reply[b] == undefined) continue;
							$('.comment_data#'+this.data[a].reply[b].id).remove();
							delete this.data[a].reply[b];
							if(!hide)
							{
								this.display_count = parseInt($('#comments_count').html());
								this.display_count--;
								$('#comments_count').html(this.display_count);
							}
						}
					}
					this.comments_count--;
					delete this.data[a];
					$('.comment_data#'+id).remove();
					if(!hide)
					{
						this.main_comments--;
						perform_script('comments_load.php', 'page='+comments_list.page);
						if(comments_list.max_page != Math.ceil(this.main_comments/10))
						{
							comments_list.max_page = Math.ceil(this.main_comments/10);
							comments_list.update();
						}
					}
					break;
				}
				else if(this.data[a].reply.count != 0)
				{
					for(var b = 0; b <= this.data[a].reply.count; b++)
					{
						if(this.data[a].reply[b] == undefined || this.data[a].reply[b].id != id) continue;
						for(var c = 0; c < this.data[a].reply.count; c++)
						{
							if(this.data[a].reply[c] == undefined || this.data[a].reply[c].id == id
							|| this.data[a].reply[c].index < this.data[a].reply[b].index) continue;
							this.data[a].reply[c].index--;
							if(this.data[a].reply[c].index == 1) $('.comment_data#'+this.data[a].reply[c].id+' .split_2').remove();
						}
						this.data[a].reply.count--;
						if(this.data[a].reply[b].index == 1 && this.data[a].index == 1) $('.comment_data#'+this.data[a].id+' .split_1').remove();
						delete this.data[a].reply[b];
						$('.comment_data#'+id).remove();
						break;
					}
				}
			}
		}
		if(!hide)
		{
			this.display_count = parseInt($('#comments_count').html());
			this.display_count--;
			$('#comments_count').html(this.display_count);
		}
	}
	this.delete_click = function(id)
	{
		this.params = {};
		this.params.id = id;
		this.params.page = client_info.page;
		this.params.page_id = client_info.page_id;
		perform_script_new('comment_delete.php', this.params);
	}
	this.edit = function(id)
	{
		if(!this.edit_comment)
		{
			this.comment_text = $('.comment_block#'+id+' .text').html();
			$('.comment_block#'+id+' .text').replaceWith('<textarea class="text">'+this.comment_text+'</textarea>');
			$('.comment_block#'+id+' .text').after('<div id="comment_post" class="button_1 button" onclick="comments_data.save('+id+')">Изменить</div>');
			this.edit_comment = 1;
		}
	}
	this.save = function(id)
	{
		if(this.edit_comment == 1)
		{
			if(this.comment_text != $('.comment_block#'+id+' .text').val()) 
			{
				this.params = {};
				this.params.id = id;
				this.params.text = $('.comment_block#'+id+' .text').val();
				this.params.page = client_info.page;
				this.params.page_id = client_info.page_id;
				perform_script_new('comment_edit.php', this.params);
			}
			$('.comment_block#'+id+' .text').replaceWith('<div class="text">'+$('.comment_block#'+id+' .text').val()+'</div>');
			$('.comment_block#'+id+' .button_1').remove();
			this.edit_comment = 0;
		}
	}
	this.update = function(id, text) 
	{ 
		$('.comment_block#'+id+' .text').html(text); 
		this.change_time[id] = 100;
		this.fading(id);
	}
	this.post = function()
	{
		var comment_text = $('#comment.input_block #text').val();
		if(comment_text != null)
		{
			if(!String.prototype.trim) this.comment_trim = comment_text;
			else this.comment_trim = comment_text.trim();
			if(this.comment_trim.length > 0)
			{
				this.params = {};
				this.params.text = comment_text;
				this.params.page = client_info.page;
				this.params.page_id = client_info.page_id;
				if(this.reply_id != -1) this.params.reply = this.reply_id;
				perform_script_new('comment_post.php', this.params);
				$('#comment.input_block #text').val('');
				$('#comment_reply').html('');
				this.reply_id = -1;
			}
		}
	}
	this.mouse_over = function(block_id)
	{
		$('.comment_block#'+block_id+' .top_elements .nickname .url').show();
		if(this.u_id != -1)
		{
			$('.comment_block#'+block_id+' .top_elements .edit').show();
			$('.comment_block#'+block_id+' .top_elements .delete').show();
			$('.comment_block#'+block_id+' .bottom_elements .rating_elements .icon').hide();
			$('.comment_block#'+block_id+' .bottom_elements .rating_elements .like').show();
			$('.comment_block#'+block_id+' .bottom_elements .rating_elements .dislike').show();
			$('.comment_block#'+block_id+' .bottom_elements .reply').show();
		}
	}
	this.mouse_out = function(block_id)
	{
		$('.comment_block#'+block_id+' .top_elements .nickname .url').hide();
		if(this.u_id != -1)
		{
			$('.comment_block#'+block_id+' .top_elements .delete').hide();
			$('.comment_block#'+block_id+' .top_elements .edit').hide();
			$('.comment_block#'+block_id+' .bottom_elements .rating_elements .icon').show();
			$('.comment_block#'+block_id+' .bottom_elements .rating_elements .like').hide();
			$('.comment_block#'+block_id+' .bottom_elements .rating_elements .dislike').hide();
			$('.comment_block#'+block_id+' .bottom_elements .reply').hide();
		}
	}
	this.reply_select = function(id, nickname)
	{
		$('#comment_reply').html('ответ для '+nickname+'<img class="cancel click" alt="" src="/assets/img/icon_close.png" onclick="comments_data.reply_cancel()">');
		$('.input_block #text').val($('.input_block #text').val()+nickname+', ');
		this.reply_id = id;
		var position = $('.input_block').offset().top-100;
		$('body').animate({scrollTop:position}, '500');
		$('.input_block #text').focus();
		//$(window).scrollTop(position);
	}
	this.reply_cancel = function()
	{
		$('#comment_reply').html('');
		this.reply_id = -1;
	}
	this.select = function(params, id)
	{
		var position = $('.comment_data#'+id).offset().top;
		if(params != '') 
		{
			this.url = {};
			this.url.game = client_info.game;
			this.url.page = client_info.page;
			this.url.page_id = client_info.page_id;
			this.url.params = params;
			set_page(JSON.stringify(this.url));
		}
		$(window).scrollTop(position);
		this.change_time[id] = 100;
		this.fading(id);
		comment_select = -1;
	}
	this.rating = function(id, rating)
	{
		this.params = {};
		this.params.id = id;
		this.params.rating = rating;
		perform_script_new('comment_rating.php', this.params);
		if(this.u_rating[id] == rating)
		{
			this.u_rating[id] = 0;
			rating = -rating;
			if(rating == -1)
			{
				$('#'+id+'.comment_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="comments_data.rating('+id+', 1)">');
			}
			else 
			{
				$('#'+id+'.comment_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="comments_data.rating('+id+', -1)">');
			}
		}
		else if(this.u_rating[id] != 0)
		{
			this.u_rating[id] = rating;
			if(rating == 1)
			{
				$('#'+id+'.comment_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="comments_data.rating('+id+', 1)">');
				$('#'+id+'.comment_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="comments_data.rating('+id+', -1)">');
			}
			else 
			{
				$('#'+id+'.comment_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="comments_data.rating('+id+', -1)">');
				$('#'+id+'.comment_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="comments_data.rating('+id+', 1)">');
			}
			rating = rating*2;
		}
		else
		{
			this.u_rating[id] = rating;
			if(rating == 1)
			{
				$('#'+id+'.comment_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="comments_data.rating('+id+', 1)">');
			}
			else 
			{
				$('#'+id+'.comment_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="comments_data.rating('+id+', -1)">');
			}
		}
		var rating_count = parseInt($('#'+id+'.comment_block .rating_elements .comment_rating').html())+rating;
		if(rating_count > 0) $('#'+id+'.comment_block .rating_elements .comment_rating').html('+'+rating_count);
		else $('#'+id+'.comment_block .rating_elements .comment_rating').html(rating_count);
		if(rating_count > 0) $('#'+id+'.comment_block .rating_elements .comment_rating').css({'color':'#81c784','opacity':'1'});
		else if(rating_count < 0) $('#'+id+'.comment_block .rating_elements .comment_rating').css({'color':'#ef9a9a','opacity':'1'});
		else $('#'+id+'.comment_block .rating_elements .comment_rating').css({'color':'#010101','opacity':'0.5'});
	}
}

function ProfileWall()
{
	this.sorting = 1;
	this.u_id = cookie_get('u_id');
	this.change_time = [];
	this.fading = function(id)
	{
		setTimeout(function() 
		{
			profile_wall.change_time[id]--;
			$('.wall_post_block#'+id).css('background', 'RGBA(247,247,247,'+(profile_wall.change_time[id]/100)+')');
			if(profile_wall.change_time[id] != 0) profile_wall.fading(id);
			else $('.wall_post_block#'+id).css('background', '#fff');
		}, 100);
	}
	this.sorting_open = function()
	{
		$('#comments_sorting #status').hide();
		$('#comments_sorting #select').show();
	}
	this.sorting_close = function(cancel)
	{
		if(cancel == 1) clearTimeout(this.sorting_close_timeout);
		else
		{
			this.sorting_close_timeout = setTimeout(function() {
				$('#comments_sorting #status').show();
				$('#comments_sorting #select').hide();
			}, 1000);
		}
	}
	this.sorting_select = function(sorting)
	{
		if(this.sorting != sorting)
		{
			this.sorting = sorting;
			if(sorting == 1) 
			{
				$('#comments_sorting #status .text').html('Новые');
				$('.input_block').show();
			}
			else if(sorting == 2) 
			{
				$('#comments_sorting #status .text').html('Популярные');
				$('.input_block').hide();
			}
			perform_script('profile_wall_load.php', 'page=1&sorting='+sorting);
		}
		$('#comments_sorting #select').hide();
		$('#comments_sorting #status').show();
	}
	this.mouse_over = function(block_id)
	{
		$('.wall_post_block#'+block_id+' .top_elements .nickname .url').show();
		if(this.u_id != -1)
		{
			$('.wall_post_block#'+block_id+' .top_elements .edit').show();
			$('.wall_post_block#'+block_id+' .top_elements .delete').show();
			$('.wall_post_block#'+block_id+' .bottom_elements .rating_elements .icon').hide();
			$('.wall_post_block#'+block_id+' .bottom_elements .rating_elements .like').show();
			$('.wall_post_block#'+block_id+' .bottom_elements .rating_elements .dislike').show();
		}
	}
	this.mouse_out = function(block_id)
	{
		$('.wall_post_block#'+block_id+' .top_elements .nickname .url').hide();
		if(this.u_id != -1)
		{
			$('.wall_post_block#'+block_id+' .top_elements .delete').hide();
			$('.wall_post_block#'+block_id+' .top_elements .edit').hide();
			$('.wall_post_block#'+block_id+' .bottom_elements .rating_elements .icon').show();
			$('.wall_post_block#'+block_id+' .bottom_elements .rating_elements .like').hide();
			$('.wall_post_block#'+block_id+' .bottom_elements .rating_elements .dislike').hide();
		}
	}
	this.select = function(params, id)
	{
		var position = $('.wall_post_block#'+id).offset().top;
		if(params != '') 
		{
			this.url = {};
			this.url.game = client_info.game;
			this.url.page = client_info.page;
			this.url.page_id = client_info.page_id;
			this.url.params = params;
			set_page(JSON.stringify(this.url));
		}
		$(window).scrollTop(position);
		this.change_time[id] = 100;
		this.fading(id);
		wall_post_select = -1;
	}
	this.post = function()
	{
		var wall_text = $('.input_block #text').val();
		if(wall_text != null && wall_text.length > 0)
		{
			perform_script('wall_post_sumbit.php', 'text='+wall_text, 'html');
			$('.input_block #text').val('');
		}
	}
	this.rating = function(id, rating)
	{
		perform_script('wall_post_rating.php', 'id='+id+'&rating='+rating);
		this.u_rating = parseInt($('#'+id+'.wall_post_block .rating_elements').attr('u_rating'));
		if(this.u_rating == rating)
		{
			this.u_rating = 0;
			rating = -rating;
			if(rating == -1)
			{
				$('#'+id+'.wall_post_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="profile_wall.rating('+id+', 1)">');
			}
			else 
			{
				$('#'+id+'.wall_post_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="profile_wall.rating('+id+', -1)">');
			}
		}
		else if(this.u_rating != 0)
		{
			this.u_rating = rating;
			if(rating == 1)
			{
				$('#'+id+'.wall_post_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="profile_wall.rating('+id+', 1)">');
				$('#'+id+'.wall_post_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="profile_wall.rating('+id+', -1)">');
			}
			else 
			{
				$('#'+id+'.wall_post_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="profile_wall.rating('+id+', -1)">');
				$('#'+id+'.wall_post_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="profile_wall.rating('+id+', 1)">');
			}
			rating = rating*2;
		}
		else
		{
			this.u_rating = rating;
			if(rating == 1)
			{
				$('#'+id+'.wall_post_block .rating_elements .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="profile_wall.rating('+id+', 1)">');
			}
			else 
			{
				$('#'+id+'.wall_post_block .rating_elements .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="profile_wall.rating('+id+', -1)">');
			}
		}
		var rating_count = parseInt($('#'+id+'.wall_post_block .rating_elements .comment_rating').html())+rating;
		if(rating_count > 0) $('#'+id+'.wall_post_block .rating_elements .comment_rating').html('+'+rating_count);
		else $('#'+id+'.wall_post_block .rating_elements .comment_rating').html(rating_count);
		if(rating_count > 0) $('#'+id+'.wall_post_block .rating_elements .comment_rating').css({'color':'#81c784','opacity':'1'});
		else if(rating_count < 0) $('#'+id+'.wall_post_block .rating_elements .comment_rating').css({'color':'#ef9a9a','opacity':'1'});
		else $('#'+id+'.wall_post_block .rating_elements .comment_rating').css({'color':'#010101','opacity':'0.5'});
		$('#'+id+'.wall_post_block .rating_elements').attr({'u_rating':this.u_rating});
	}
	this.edit = function(id)
	{
		if(!this.edit_comment)
		{
			this.comment_text = $('.wall_post_block#'+id+' .text').html();
			$('.wall_post_block#'+id+' .text').replaceWith('<textarea class="text">'+this.comment_text+'</textarea>');
			$('.wall_post_block#'+id+' .text').after('<div id="comment_post" class="button_1 button" onclick="profile_wall.save('+id+')">Изменить</div>');
			this.edit_comment = 1;
		}
	}
	this.save = function(id)
	{
		if(this.edit_comment == 1)
		{
			if(this.comment_text != $('.wall_post_block#'+id+' .text').val()) perform_script('wall_post_edit.php', 'id='+id+'&text='+$('.wall_post_block#'+id+' .text').val());
			$('.wall_post_block#'+id+' .text').replaceWith('<div class="text">'+$('.wall_post_block#'+id+' .text').val()+'</div>');
			$('.wall_post_block#'+id+' .button_1').remove();
			this.edit_comment = 0;
		}
	}
}

function Dialog()
{
	this.init = function(type)
	{
		if(type == undefined) type = 1;
		if((type == 1 && !$('.dialog_content').is(':hover'))
		|| (type == 2 && !$('.dialog_2 .dialog_content').is(':hover'))) 
		{
			$('.icon_dialog_close').addClass('active');
			this.mouse_status = 0;
		}
		else this.mouse_status = 1;
	}
	this.mouse_enter = function()
	{
		this.mouse_status = 1;
		$('.icon_dialog_close').removeClass('active');
	}
	this.mouse_leave = function()
	{
		this.mouse_status = 0;
		$('.icon_dialog_close').addClass('active');
	}
	this.click = function()
	{
		if(!this.mouse_status) 
		{
			if(dialog_type == 1) close_dialog(undefined, 'type=1');
			else close_dialog_2();
		}
	}
}
var dialog = new Dialog();

function MessagesData()
{
	this.init = function()
	{
		this.position = 0;
		this.change_time = [];
		dialog_open = 'messages';
		$(".messages_list").scrollTop(1000);
	}
	this.fading = function(id)
	{
		setTimeout(function() 
		{
			messages_data.change_time[id]--;
			// 247
			$('#'+id+'.message.dialog_block').css('background', 'RGBA(247,247,247,'+(messages_data.change_time[id]/100)+')');
			if(messages_data.change_time[id] != 0) messages_data.fading(id);
			else 
			{
				$('#'+id+'.message.dialog_block').css('background', '#fff');
				$('#'+id+'.message.dialog_block').removeClass('selected');
			}
		}, 100);
	}
	this.post = function()
	{
		this.message_text = $('#message.input_block #text').val();
		if(this.message_text != null)
		{
			if(!String.prototype.trim) this.message_trim = this.message_text;
			else this.message_trim = this.message_text.trim();
			if(this.message_trim.length > 0)
			{
				perform_script('message_post.php', 'text='+this.message_text, 'html');
				$('#message.input_block #text').val('');
			}
		}
	}
	this.load = function()
	{
		this.position = this.position+10;
		perform_script('messages_load.php', 'position='+this.position);
	}
	this.show = function(id, u_id, u_name, u_avatar, message, time)
	{
		$('.messages_list').append('<div class="message dialog_block click selected" id="'+id+'">\
									<img class="avatar click" alt="" src="'+static_url+'/uploads/avatars/min_'+u_avatar+'">\
									<div class="dialog_info clearfix">\
										<div class="clearfix top_elements">\
											<div class="nickname">'+u_name+'</div>\
											<div class="right">'+time+'</div>\
										</div>\
										<div class="clearfix bottom_elements">\
											<div class="left">'+message+'</div>\
											<!--<div class="right"><img class="select" alt="" src="/assets/img/icon_dialog_select.png"></div>-->\
										</div>\
									</div>\
								</div>');
		$(".messages_list").scrollTop($(".messages_list").scrollTop()+100);
		if(u_id != u_profile_id)
		{
			this.change_time[id] = 100;
			this.fading(id);
			perform_script('message_read.php', 'from_id='+u_id);
		}
	}
	this.fading_all = function()
	{
		$('.messages_list .message.dialog_block.selected').each(function(i, elem) 
		{
			this.element_id = $(elem).attr('id');
			$('#'+this.element_id+'.message.dialog_block').css('background', '#fff');
			$('#'+this.element_id+'.message.dialog_block').removeClass('selected');
		});
	}
}
var messages_data = new MessagesData();

function DialogsData()
{
	this.init = function()
	{
		this.position = 0;	
		dialog_open = 'dialogs';
		$('.navigation_top #messages .update').hide();
	}
	this.load = function()
	{
		this.position = this.position+10;
		perform_script('dialogs_load.php', 'position='+this.position);
	}
	this.show = function(id, name, avatar, message, time)
	{
		this.dialogs_count = parseInt($('.dialogs_list').attr('count'));
		if(this.dialogs_count != 0) $('.dialogs_list').prepend('<div class="split_1"></div>');
		$('.dialogs_list').prepend('<div class="dialog_block click" id="'+id+'" onclick="perform_script(\'dialog_load.php\', \'page=messages&id='+id+'\')">\
							<img class="avatar click" alt="" src="'+static_url+'/uploads/avatars/min_'+avatar+'">\
							<div class="dialog_info">\
								<div class="clearfix top_elements">\
									<div class="nickname">'+name+'</div>\
									<div class="right" id="time">'+time+'</div>\
								</div>\
								<div class="clearfix bottom_elements">\
									<div class="left" id="message">'+message+'</div>\
									<div class="right count">1</div>\
								</div>\
							</div>\
						</div>');
		$(".dialogs_list").scrollTop(0);
		$('.dialogs_list').attr('count', this.dialogs_count+1);
	}
	this.new_message = function(id, message, time)
	{
		$('#'+id+'.dialog_block #message').html(message);
		$('#'+id+'.dialog_block #time').html(time);
		$('#'+id+'.dialog_block .count').html(parseInt($('#'+id+'.dialog_block .count').html())+1);
		$('#'+id+'.dialog_block .count').show();
		$('.dialogs_list').prepend($('#'+id+'.dialog_block'));
	}
}
var dialogs_data = new DialogsData();

function FriendsData()
{
	this.init = function(section)
	{
		this.section = section;
		this.menu_close_timeout = [];
		$('.navigation_top #friends .update').hide();
	}
	this.section_open = function()
	{
		$('#section #status').hide();
		$('#section #select').show();
	}
	this.section_close = function(cancel)
	{
		if(cancel == 1) clearTimeout(this.section_close_timeout);
		else
		{
			this.section_close_timeout = setTimeout(function() {
				$('#section #status').show();
				$('#section #select').hide();
			}, 1000);
		}
	}
	this.section_select = function(section)
	{
		if(this.section != section)
		{
			this.section = section;
			if(section == 1) open_dialog('dialogs/friends.php', 'section=1');
			else if(section == 2) open_dialog('dialogs/friends.php', 'section=2');
			else if(section == 3) open_dialog('dialogs/friends.php', 'section=3');
		}
		$('#section #select').hide();
		$('#section #status').show();
	}
	this.menu_open = function(id) 
	{ 
		$('#u'+id+'.friend_block .menu #select').show();
	}
	this.menu_close = function(cancel, id)
	{
		if(cancel == 1) clearTimeout(this.menu_close_timeout[id]);
		else
		{
			this.menu_close_timeout[id] = setTimeout(function() {
				$('#u'+id+'.friend_block .menu #select').hide();
			}, 1000);
		}
	}
	this.menu_select = function(action, id)
	{
		if(this.section == 1)
		{
			if(action == 1) open_dialog('dialog_load.php', 'page=messages&u_id='+id);
			else if(action == 2) 
			{
				$('#u'+id+'.friend_block').remove();
				perform_script('friend_remove.php', 'id='+id+'&status=1');
			}
		}
		else if(this.section == 2)
		{
			if(action == 1) open_dialog('dialog_load.php', 'page=messages&u_id='+id);
			else if(action == 2) 
			{
				$('#u'+id+'.friend_block').remove();
				perform_script('friend_request_accept.php', 'id='+id);
			}
		}
		else if(this.section == 3)
		{
			if(action == 1) perform_script('friend_request_accept.php', 'id='+id);
			else if(action == 2) perform_script('friend_request_deny.php', 'id='+id);
			$('#u'+id+'.friend_block').remove();
		}
		$('#u'+id+'.friend_block .menu #select').hide();
	}
	this.friend_select = function(id)
	{
		perform_script('page_load.php', 'page=profile&id='+id+'');
		close_dialog();
	}
}
var friends_data = new FriendsData();

function UserBlock()
{
	this.init = function(page)
	{
		this.page = page;
		this.menu_close_timeout = [];
	}
	this.menu_open = function(id) 
	{ 
		$('.user_block#u'+id+' .menu #select').show();
	}
	this.menu_close = function(cancel, id)
	{
		if(cancel == 1) clearTimeout(this.menu_close_timeout[id]);
		else
		{
			this.menu_close_timeout[id] = setTimeout(function() {
				$('.user_block#u'+id+' .menu #select').hide();
			}, 1000);
		}
	}
	this.menu_select = function(action, id)
	{
		if(this.page == 'moderators')
		{
			if(action == 1) moderators_panel.init(id);
			else if(action == 2) moderators_panel.delete(id);
		}
		$('.user_block#u'+id+' .menu #select').hide();
	}
}
var user_block = new UserBlock();

function NewsAdd()
{
	this.init = function(section, edit, offer_id)
	{
		this.section = section;
		if(edit == undefined) this.edit = -1;
		else this.edit = edit;
		if(offer_id == undefined) this.offer_id = -1;
		else this.offer_id = offer_id;
		this.menu_close_timeout = [];
	}
	this.section_open = function()
	{
		$('.dialog_workspace#news_add #news_type #status').hide();
		$('.dialog_workspace#news_add #news_type #select').show();
	}
	this.section_close = function(cancel)
	{
		if(cancel == 1) clearTimeout(this.section_close_timeout);
		else
		{
			this.section_close_timeout = setTimeout(function() {
				$('.dialog_workspace#news_add #news_type #status').show();
				$('.dialog_workspace#news_add #news_type #select').hide();
			}, 1000);
		}
	}
	this.section_select = function(section)
	{
		if(this.section != section)
		{
			this.section = section;
			if(section == 1) 
			{
				$('.dialog_workspace#news_add #title_text').show();
				$('.dialog_workspace#news_add #title').show();
				$('.dialog_workspace#news_add #load_image').show();
				$('.dialog_workspace#news_add .input_tip#image').show();
				$('.dialog_workspace#news_add #news_type #status .text').html('Полная');
			}
			else if(section == 2) 
			{
				$('.dialog_workspace#news_add #title_text').hide();
				$('.dialog_workspace#news_add #title').hide();
				$('.dialog_workspace#news_add #load_image').hide();
				$('.dialog_workspace#news_add .input_tip#image').hide();
				$('.dialog_workspace#news_add #news_type #status .text').html('Короткая');
			}
		}
		$('.dialog_workspace#news_add #news_type #select').hide();
		$('.dialog_workspace#news_add #news_type #status').show();
	}
	this.post = function()
	{
		if(this.section == 1) 
		{
			this.params = {};
			this.params.title = $('#title').val();
			this.params.tags = $('#tags').val();
			this.params.title_text = $('#title_text').val();
			this.params.text = $('#text').val();
			this.params.type = 1;
			if(this.edit != -1) 
			{
				this.params.edit = 1;
				this.params.id = this.edit;
			}
			if(this.offer_id != -1) this.params.offer_id = this.offer_id;
			perform_script_new('admin_panel/news_add.php', this.params);
		}
		else if(this.section == 2) 
		{
			this.params = {};
			this.params.tags = $('#tags').val();
			this.params.text = $('#text').val();
			this.params.type = 2;
			if(this.edit != -1) 
			{
				this.params.edit = 1;
				this.params.id = this.edit;
			}
			if(this.offer_id != -1) this.params.offer_id = this.offer_id;
			perform_script_new('admin_panel/news_add.php', this.params);
		}
		else if(this.section == 3)
		{
			this.params = {};
			this.params.text = $('.dialog_workspace#news_add #text').val();
			if(this.params.text.length != 0) perform_script_new('dialogs/news_offer.php', this.params);
		}
		else if(this.section == 4)
		{
			this.params = {};
			this.params.text = $('.dialog_workspace#news_add #text').val();
			if(this.params.text.length != 0) perform_script_new('dialogs/project_offer.php', this.params);
		}	
	}
}
var news_add = new NewsAdd();

function ProjectAdd()
{
	this.init = function(edit, type)
	{
		this.genres = [];
		this.genres_count = 0;
		this.servers = {};
		this.servers_count = 0;
		if(type == undefined) this.page = '.dialog_workspace#news_add ';
		else if(type == 2) this.page = '.admin_panel #project_info ';
		this.title = $(this.page+'#title').val();
		this.desc = $(this.page+'#desc').val();
		this.language = $(this.page+'.language').val();
		$(this.page+'.genres_block select').each(function(i, elem) { 
			project_add.genres[i] = $(elem).val(); 
			project_add.genres_count++;
		});
		$(this.page+'.server_block').each(function(i, elem) { 
			project_add.servers[i] = {};
			project_add.servers[i].ip = $(elem).find("#ip").val();
			project_add.servers[i].name = $(elem).find("#name").val();
			project_add.servers_count++;
		});
		if(edit == undefined) this.edit = -1;
		else this.edit = edit;
	}
	this.genres_add = function()
	{
		if(this.genres_count >= 3) return 1; 
		for(this.i_a = 0; this.i_a <= this.genres_count; this.i_a++)
		{
			if(this.genres[this.i_a] != undefined) continue;
			$(this.page+'.genres_list .icon_add').remove();
			$(this.page+'.genres_list').append('<div class="genres_block" id="'+this.i_a+'">\
				<select name="genres">\
					'+$(".genres_list .genres_block#0 select").html()+'\
				</select>\
				<img alt="" src="/assets/img/icon_close.png" class="icon_remove click" onclick="project_add.genres_remove('+this.i_a+')">\
			</div>');
			this.genres[this.i_a] = 'RolePlayGame';
			this.genres_count++;
			if(this.genres_count < 3) $(this.page+'.genres_list .genres_block:last').append('<img alt="" src="/assets/img/icon_add.png" class="icon_add click" onclick="project_add.genres_add()">');
			break;
		}
	}
	this.genres_remove = function(id)
	{
		if(this.genres_count <= 1) return 1; 
		$(this.page+'.genres_list #'+id+'.genres_block').remove();
		$(this.page+'.genres_list .icon_add').remove();
		$(this.page+'.genres_list .genres_block:last').append('<img alt="" src="/assets/img/icon_add.png" class="icon_add click" onclick="project_add.genres_add()">');
		delete this.genres[id];
		this.genres_count--;
	}
	this.servers_add = function()
	{
		if(this.servers_count >= 20) return 1; 
		for(this.i_a = 0; this.i_a <= this.servers_count; this.i_a++)
		{
			if(this.servers[this.i_a] != undefined) continue;
			$(this.page+'.servers_list .icon_add').remove();
			$(this.page+'.servers_list').append('<div class="server_block" id="'+this.i_a+'">\
				<input type="text" class="ip" id="ip" placeholder="IP:Порт">\
				<input type="text" class="ip" id="name" placeholder="Название">\
				<img alt="" src="/assets/img/icon_close.png" class="icon_remove click" onclick="project_add.servers_remove('+this.i_a+')">\
			</div>');
			this.servers[this.i_a] = '';
			this.servers_count++;
			if(this.servers_count < 20) $(this.page+'.servers_list .server_block:last').append('<img alt="" src="/assets/img/icon_add.png" class="icon_add click" onclick="project_add.servers_add()">');
			break;
		}
	}
	this.servers_remove = function(id)
	{
		if(id != 0) 
		{
			$(this.page+'.servers_list #'+id+'.server_block').remove();
			$(this.page+'.servers_list .icon_add').remove();
			$(this.page+'.servers_list .server_block:last').append('<img alt="" src="/assets/img/icon_add.png" class="icon_add click" onclick="project_add.servers_add()">');
			delete this.servers[id];
			this.servers_count--;
		}
		else $(this.page+'.servers_list #'+id+'.server_block input').val('');
	}
	this.post = function()
	{
		this.params = {};
		this.params.title = $(this.page+'#title').val();
		this.params.desc = $(this.page+'#desc').val();
		this.params.language = $(this.page+'.language').val();
		this.params.genres = [];
		$(this.page+'.genres_block select').each(function(i, elem) { project_add.params.genres[i] = $(elem).val(); });
		this.params.servers = {};
		$(this.page+'.server_block').each(function(i, elem) 
		{ 
			this.ip = $(elem).find("#ip").val();
			this.name = $(elem).find("#name").val();
			if(this.ip.length > 0) 
			{
				project_add.params.servers[i] = {};
				project_add.params.servers[i]['ip'] = this.ip; 
				project_add.params.servers[i]['name'] = this.name; 
			}
		});
		if(this.edit != -1) 
		{
			this.params.id = this.edit;
			this.params.edit = 1;
		}
		perform_script_new('admin_panel/project_add.php', this.params);
	}
}
var project_add = new ProjectAdd();

function AdminPanel()
{
	this.init = function(page)
	{
		if(page == 1) this.spoilers = [0,0,0];
		else if(page == 2) this.spoilers = [0,0];
	}
	this.spoiler = function(spoiler)
	{
		if(!this.spoilers[spoiler]) 
		{
			$('.spoiler_content#'+spoiler).slideDown();
			this.spoilers[spoiler] = 1;
		}
		else
		{
			$('.spoiler_content#'+spoiler).slideUp();
			this.spoilers[spoiler] = 0;
		}
	}
}
var admin_panel = new AdminPanel();

function AccountSettings()
{
	this.init = function()
	{
		this.first_name = $('#input_first_name input').val();
		this.last_name = $('#input_last_name input').val();
	}
	this.save = function()
	{
		this.complete = 1;
		$('input[type="text"]').css('border', '1px solid rgb(235, 235, 235)');
		$('input[type="password"]').css('border', '1px solid rgb(235, 235, 235)');
		$('.icon_warning').hide();
		this.params = {};
		this.first_name_new = $('#input_first_name input').val().trim();
		this.last_name_new = $('#input_last_name input').val().trim();
		if(this.first_name_new != this.first_name) 
		{
			if(this.first_name_new.length > 18)
			{
				$('#input_first_name input').css('border', '1px solid #e07575');
				$('#input_first_name.icon_warning').show();
				$('#input_first_name .tt_w').html('Используйте не более 18 символов');
				this.complete = 0;
			}
			else this.params.firstname = this.first_name_new;
		}
		if(this.last_name_new != this.last_name) 
		{
			if(this.last_name_new.length > 18)
			{
				$('#input_last_name input').css('border', '1px solid #e07575');
				$('#input_last_name.icon_warning').show();
				$('#input_last_name .tt_w').html('Используйте не более 18 символов');
				this.complete = 0;
			}
			else this.params.lastname = this.last_name_new;
		}
		this.password = $('#input_password input').val().trim();
		this.password_confirm = $('#input_confirm_password').val().trim();
		if(this.password != null && this.password_confirm != null && this.password.length > 0)
		{
			if(this.password.length < 6 || this.password.length > 50 || this.password != this.password_confirm)
			{
				$('#input_password input').css('border', '1px solid #e07575');
				$('#input_password .icon_warning').show();
				if(this.password.length < 6) $('#input_password .tt_w').html('Пароль слишком короткий');
				else if(this.password.length > 50) $('#input_password .tt_w').html('Используйте не более 50 символов');
				else if(this.password != this.password_confirm) 
				{
					$('#input_confirm_password').css('border', '1px solid #e07575');
					$('#input_password .tt_w').html('Пароли не совпадают');
				}
				this.complete = 0;
			}
			else this.params.password = this.password;
		}
		if(this.complete == 1)
		{
			close_dialog();
			if(count_object(this.params) > 0) perform_script_new('account_settings_save.php', this.params);
		}
	}
}
var account_settings = new AccountSettings();

function ClientInfo()
{
	this.game = '';
	this.page = '';
	this.page_id = 0;
	this.set_page = function(data)
	{
		this.game = data['game'];
		this.page = data['page'];
		this.page_id = data['page_id'];
		if(data['admin'] != undefined) this.admin = data['admin'];
	}
}
var client_info = new ClientInfo();

function UserProfileRated(rate)
{
	$('#u_rating .tt_w .dislike').replaceWith('<img alt="" class="dislike left" src="/assets/img/icon_thumb_dislike_outline.png">');
	$('#u_rating .tt_w .like').replaceWith('<img alt="" class="like left" src="/assets/img/icon_thumb_like_outline.png">');
	perform_script('u_profile_rated.php', 'rate='+rate+'');
}

function news_like()
{
	var likes_count = parseInt($('#likes #count').html())+1;
	$('#likes').replaceWith('<img alt="" src="/assets/img/icon_like_click.png" style="margin: 0px 7px -3px 15px;width: 16px"><span class="news_post_info_text_full" id="likes" style="color: #df5b65">'+likes_count+'</span>');
	this.params = {};
	this.params.page = client_info.page;
	this.params.page_id = client_info.page_id;
	perform_script_new('news_like.php', this.params);
}

function DiscussModule()
{
	this.change_time = [];
	this.u_rating = [];
	this.edit_comment = 0;
	this.init = function(u_rating)
	{
		this.discuss_u_rating = u_rating;
	}
	this.dialog_add = function(id)
	{
		this.complete = 1;
		$('input[type="text"], textarea').css('border', '1px solid rgb(235, 235, 235)');
		$('.icon_warning').hide();
		$('#tags .icon_info').show();
		this.title = $('#title input').val();
		if(this.title != null)
		{
			this.title = this.title.trim();
			if(this.title.length < 1 || this.title.length > 250)
			{
				$('#title input').css('border', '1px solid #e07575');
				$('#title .icon_warning').show();
				if(this.title.length < 1) $('#title .tt_w').html('Вы не указали тему');
				else if(this.title.length > 250) $('#title .tt_w').html('Используйте не более 250 символов');
				this.complete = 0;
			}
		}
		this.tags = $('#tags input').val();
		if(this.tags != null)
		{
			this.tags = this.tags.trim();
			if(this.tags.length < 1 || this.tags.length > 50)
			{
				$('#tags .icon_info').hide();
				$('#tags input').css('border', '1px solid #e07575');
				$('#tags .icon_warning').show();
				if(this.tags.length < 1) $('#tags .tt_w').html('Вы не указали тэги');
				else if(this.tags.length > 100) $('#tags .tt_w').html('Используйте не более 100 символов');
				this.complete = 0;
			}
		}
		this.text = $('#text textarea').val();
		if(this.text != null)
		{
			this.text = this.text.trim();
			if(this.text.length < 1 || this.text.length > 1000)
			{
				$('#text textarea').css('border', '1px solid #e07575');
				$('#text .icon_warning').show();
				if(this.text.length < 1) $('#text .tt_w').html('Вы не указали суть обсуждения');
				else if(this.text.length > 1000) $('#text .tt_w').html('Используйте не более 1000 символов');
				this.complete = 0;
			}
		}
		if(this.complete == 1)
		{
			this.params = {};
			this.params.title = this.title;
			this.params.tags = this.tags;
			this.params.text = this.text;
			if(id != -1) this.params.discuss_id = id;
			perform_script_new('discuss_add.php', this.params, function(data) {
				data = JSON.parse(data);
				close_dialog();
				discuss_module.open(data.discuss_id, new Date().getUnix());
			});
		}
	}
	this.menu_open = function() 
	{ 
		$('#discuss_info .menu #select').show();
	}
	this.menu_close = function(cancel)
	{
		if(cancel == 1) clearTimeout(this.menu_close_timeout);
		else
		{
			this.menu_close_timeout = setTimeout(function() {
				$('#discuss_info .menu #select').hide();
			}, 1000);
		}
	}
	this.menu_select = function(action)
	{
		if(action == 1) 
		{
			this.params = {};
			this.params.discuss_id = client_info.page_id;
			open_dialog_new('dialogs/discuss_add.php', this.params);
		}
		else if(action == 2) 
		{
			this.params = {};
			this.params.discuss_id = client_info.page_id;
			perform_script_new('discuss_delete.php', this.params, function(data) {
				perform_script('page_load.php', 'page=community');
			});
		}
		$('#discuss_info .menu #select').hide();
	}
	this.fading = function(id)
	{
		setTimeout(function() 
		{
			discuss_module.change_time[id]--;
			$('#id'+id+'.comment_block').css('background', 'RGBA(247,247,247,'+(discuss_module.change_time[id]/100)+')');
			if(discuss_module.change_time[id] != 0) discuss_module.fading(id);
			else $('#id'+id+'.comment_block').css('background', '#fff');
		}, 100);
	}
	this.open = function(id, update)
	{
		this.params = {};
		this.params.page = 'discuss';
		this.params.id = id;
		this.views = localStorage_array('discuss_views');
		if(this.views[id] == undefined || this.views[id] < update) this.params.view = 1;
		this.views[id] = new Date().getUnix();
		localStorage['discuss_views'] = JSON.stringify(this.views);
		perform_script_new('page_load.php', this.params);
		return false;
	}
	this.add = function(data)
	{
		var html = '';
		if($('#discuss_list .discuss_block').length != 0) html = html+'<div class="line_1"></div>';
		html = html+'<a href="/'+client_info.game+'/discuss/'+data.id+'" onclick="return discuss_module.open('+data.id+', '+data.update+')"><div class="discuss_block clearfix click" id="id'+data.id+'" onmouseenter="$(\'.discuss_block#id'+data.id+' .stats\').slideDown(300)" onmouseleave="$(\'.discuss_block#id'+data.id+' .stats\').slideUp(300)">';
			this.views = localStorage_array('discuss_views');
			if(this.views[data.id] == undefined || this.views[data.id] < data.update) html = html+'<div class="icon active left"></div>';
			else html = html+'<div class="icon left"></div>';
			html = html+'<div class="info left">\
				<div class="title">'+data.title+'</div>\
				<div class="reply">Последнее: <span>'+data.last_name+'</span>, '+data.last_date+'</div>\
				<div class="stats clearfix">\
					<div class="icon_views left"></div>\
					<div class="count left">'+data.views+'</div>\
					<div class="icon_comments left"></div>\
					<div class="count left">'+data.comments+'</div>\
					<div class="icon_tags left"></div>\
					<div class="tags left">';
						data.tags.forEach(function(element, index) {
							if(index != 0) html = html+'<div class="split left"></div>';
							html = html+'<div class="item left">'+element+'</div>';
						});
					html = html+'</div>\
				</div>\
			</div>\
			<div class="info right">\
				<div class="author">Автор: <span>'+data.create_name+'</span></div>\
				<div class="date">'+data.create_date+'</div>\
			</div>\
		</div></a>';
		$('#discuss_list').append(html);
	}
	this.socket_delete = function(id, hide)
	{
		if($('.comment_block').is('#id'+id))
		{
			if('id'+id != $('.comment_block:first-child').attr('id')) $('.comment_block#id'+id).prev(".split_1").remove();
			else 
			{
				$('.comment_block#id'+id).next(".split_1").remove();
			}
			$('.comment_block#id'+id).remove();
			this.display_count = parseInt($('#comments_count').html());
			this.display_count--;
			$('#comments_count').html(this.display_count);
		}
	}
	this.update = function(id, text) 
	{ 
		$('.comment_block#id'+id+' .text').html(text); 
		this.change_time[id] = 100;
		this.fading(id);
	}
	this.comment_delete = function(id)
	{
		this.params = {};
		this.params.id = id;
		this.params.page_id = client_info.page_id;
		perform_script_new('dc_delete.php', this.params);
	}
	this.comment_edit = function(id)
	{
		if(!this.edit_comment)
		{
			this.comment_text = $('.comment_block#id'+id+' .text').html();
			$('.comment_block#id'+id+' .text').replaceWith('<textarea class="text">'+this.comment_text+'</textarea>');
			$('.comment_block#id'+id+' .text').after('<div id="comment_post" class="button_1 button" onclick="discuss_module.comment_save('+id+')">Изменить</div>');
			this.edit_comment = 1;
		}
	}
	this.comment_save = function(id)
	{
		if(this.edit_comment == 1)
		{
			if(this.comment_text != $('.comment_block#id'+id+' .text').val()) 
			{
				this.params = {};
				this.params.id = id;
				this.params.text = $('.comment_block#id'+id+' .text').val();
				this.params.page_id = client_info.page_id;
				perform_script_new('dc_edit.php', this.params);
			}
			$('.comment_block#id'+id+' .text').replaceWith('<div class="text">'+$('.comment_block#id'+id+' .text').val()+'</div>');
			$('.comment_block#id'+id+' .button_1').remove();
			this.edit_comment = 0;
		}
	}
	this.comment_add = function(data)
	{
		this.u_rating[data.id] = data.u_rating;
		var html = '';
		if($('#comments_list .comment_block').length != 0) html = html+'<div class="split_1"></div>';
		html = html+'<div class="comment_block" id="id'+data.id+'" onmouseenter="discuss_module.comment_in('+data.id+')" onmouseleave="discuss_module.comment_out('+data.id+')">\
			<img class="avatar click" alt="" src="'+static_url+'/uploads/avatars/min_'+data.u_avatar+'" onclick="perform_script(\'page_load.php\', \'page=profile&id='+data.u_id+'\')">\
			<div class="comment_info">\
				<div class="clearfix top_elements">\
					<div class="nickname"><span onclick="perform_script(\'page_load.php\', \'page=profile&id='+data.u_id+'\')">'+data.u_name+'</span><span class="url" style="display: none;" onclick="discuss_module.comment_select(\'c='+data.id+'\', '+data.id+')">#</span></div>';
					if(u_id_global == data.u_id)
					{
						html = html+'<img class="delete" alt="" src="/assets/img/icon_close.png" style="display: none" onclick="discuss_module.comment_delete('+data.id+')">\
						<img class="edit" alt="" src="/assets/img/icon_edit.png" style="display: none" onclick="discuss_module.comment_edit('+data.id+')">';
					}
				html = html+'</div>\
				<div class="text">'+data.text+'</div>\
				<div class="clearfix bottom_elements">\
					<div class="date">'+data.date+'</div>\
					<div class="rating_elements">\
						<img alt="" class="icon" src="/assets/img/icon_rating.png" style="display: block;">';
						if(data.u_rating == 1) html = html+'<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="discuss_module.comment_rating('+data.id+', 1)" style="display: none">';
						else html = html+'<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="discuss_module.comment_rating('+data.id+', 1)" style="display: none">';
						if(data.rating > 0) html = html+'<div class="comment_rating" style="color: #81c784">+'+data.rating+'</div>';
						else if(data.rating < 0) html = html+'<div class="comment_rating" style="color: #ef9a9a">'+data.rating+'</div>';
						else html = html+'<div class="comment_rating" style="color: #010101;opacity: 0.5">0</div>';
						if(data.u_rating == -1) html = html+'<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="discuss_module.comment_rating('+data.id+', -1)" style="display: none">';
						else html = html+'<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="discuss_module.comment_rating('+data.id+', -1)" style="display: none">';
					html = html+'</div>\
					<div class="reply" style="display: none;" onclick="discuss_module.comment_rating('+data.id+', \''+data.u_name+'\')">Ответить</div>\
				</div>\
			</div>\
		</div>';
		$('#comments_list').append(html);
		if(data.realtime != undefined)
		{
			this.display_count = parseInt($('#comments_count').html());
			this.display_count++;
			$('#comments_count').html(this.display_count);
		}
	}
	this.comment_in = function(id)
	{
		$('#id'+id+'.comment_block .url').show();
		if(u_id_global != -1)
		{
			$('#id'+id+'.comment_block .like').show();
			$('#id'+id+'.comment_block .dislike').show();
			$('#id'+id+'.comment_block .edit').show();
			$('#id'+id+'.comment_block .delete').show();
			$('#id'+id+'.comment_block .rating_elements .icon').hide();
		}
	}
	this.comment_out = function(id)
	{
		$('#id'+id+'.comment_block .url').hide();
		if(u_id_global != -1)
		{
			$('#id'+id+'.comment_block .like').hide();
			$('#id'+id+'.comment_block .dislike').hide();
			$('#id'+id+'.comment_block .edit').hide();
			$('#id'+id+'.comment_block .delete').hide();
			$('#id'+id+'.comment_block .rating_elements .icon').show();
		}
	}
	this.comment_select = function(params, id)
	{
		var position = $('.comment_block#id'+id).offset().top;
		if(params != '') 
		{
			this.url = {};
			this.url.game = client_info.game;
			this.url.page = client_info.page;
			this.url.page_id = client_info.page_id;
			this.url.params = params;
			set_page(JSON.stringify(this.url));
		}
		$(window).scrollTop(position);
		this.change_time[id] = 100;
		this.fading(id);
		dc_select = -1;
	}
	this.post = function()
	{
		var comment_text = $('#comment.input_block #text').val();
		if(comment_text != null)
		{
			if(!String.prototype.trim) this.comment_trim = comment_text;
			else this.comment_trim = comment_text.trim();
			if(this.comment_trim.length > 0)
			{
				this.params = {};
				this.params.text = comment_text;
				this.params.page_id = client_info.page_id;
				perform_script_new('dc_post.php', this.params);
				$('#comment.input_block #text').val('');
			}
		}
	}
	this.comment_rating = function(id, rating)
	{
		this.params = {};
		this.params.id = id;
		this.params.discuss = client_info.page_id;
		this.params.rating = rating;
		if(id == -1) 
		{
			this.element = '#discuss_info .rating_elements';
			this.u_rating_2 = this.discuss_u_rating;
		}
		else 
		{
			this.element = '#id'+id+'.comment_block .rating_elements';
			this.u_rating_2 = this.u_rating[id];
		}
		perform_script_new('dc_rating.php', this.params);
		if(this.u_rating_2 == rating)
		{
			if(id == -1) this.discuss_u_rating = 0;
			else this.u_rating[id] = 0;
			rating = -rating;
			if(rating == -1)
			{
				$(this.element+' .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="discuss_module.comment_rating('+id+', 1)">');
			}
			else 
			{
				$(this.element+' .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="discuss_module.comment_rating('+id+', -1)">');
			}
		}
		else if(this.u_rating_2 != 0)
		{
			if(id == -1) this.discuss_u_rating = rating;
			else this.u_rating[id] = rating;
			if(rating == 1)
			{
				$(this.element+' .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="discuss_module.comment_rating('+id+', 1)">');
				$(this.element+' .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike_outline.png" onclick="discuss_module.comment_rating('+id+', -1)">');
			}
			else 
			{
				$(this.element+' .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="discuss_module.comment_rating('+id+', -1)">');
				$(this.element+' .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like_outline.png" onclick="discuss_module.comment_rating('+id+', 1)">');
			}
			rating = rating*2;
		}
		else
		{
			if(id == -1) this.discuss_u_rating = rating;
			else this.u_rating[id] = rating;
			if(rating == 1)
			{
				$(this.element+' .like').replaceWith('<img alt="" class="like" src="/assets/img/icon_thumb_like.png" onclick="discuss_module.comment_rating('+id+', 1)">');
			}
			else 
			{
				$(this.element+' .dislike').replaceWith('<img alt="" class="dislike" src="/assets/img/icon_thumb_dislike.png" onclick="discuss_module.comment_rating('+id+', -1)">');
			}
		}
		var rating_count = parseInt($(this.element+' .comment_rating').html())+rating;
		if(rating_count > 0) $(this.element+' .comment_rating').html('+'+rating_count);
		else $(this.element+' .comment_rating').html(rating_count);
		if(rating_count > 0) $(this.element+' .comment_rating').css({'color':'#81c784','opacity':'1'});
		else if(rating_count < 0) $(this.element+' .comment_rating').css({'color':'#ef9a9a','opacity':'1'});
		else $(this.element+' .comment_rating').css({'color':'#010101','opacity':'0.5'});
	}
}
var discuss_module = new DiscussModule();

function ModeratorsPanel()
{
	this.u_id = -1;
	this.init = function(u_id)
	{
		this.u_id = u_id;
		this.params = {};
		this.params.p_id = client_info.page_id;
		if(u_id != -1)
		{
			this.params.u_id = u_id;
			open_dialog_new('dialogs/admin_panel/moderator_add.php', this.params);
		}
		else open_dialog_new('dialogs/admin_panel/moderator_add.php', this.params);
	}
	this.delete = function(id)
	{
		$('.user_block#u'+id).remove();
		if($('#moderators_list .user_block').length < 1) $('#moderators .line_1').remove();
		this.params = {};
		this.params.u_id = id;
		this.params.p_id = client_info.page_id;
		perform_script_new('admin_panel/moderator_delete.php', this.params);
	}
	this.save = function()
	{
		this.complete = 1;
		$('input[type="text"]').css('border', '1px solid rgb(235, 235, 235)');
		$('.icon_warning').hide();
		if(this.u_id == -1) 
		{
			this.u_id = $('#u_id input').val();
			if(this.u_id != null)
			{
				this.u_id = this.u_id.trim();
				if(this.u_id.length < 1)
				{
					$('#u_id input').css('border', '1px solid #e07575');
					$('#u_id .icon_warning').show();
					$('#u_id .tt_w').html('Вы не указали ID');
					this.complete = 0;
				}
			}
		}
		this.position_name = $('#position_name input').val();
		if(this.position_name != null)
		{
			this.position_name = this.position_name.trim();
			if(this.position_name.length < 1 || this.position_name.length > 50)
			{
				$('#position_name input').css('border', '1px solid #e07575');
				$('#position_name .icon_warning').show();
				if(this.position_name.length < 1) $('#position_name .tt_w').html('Вы не указали должность');
				else if(this.position_name.length > 50) $('#position_name .tt_w').html('Используйте не более 50 символов');
				this.complete = 0;
			}
		}
		if(this.complete == 1)
		{
			this.params = {};
			this.params.u_id = this.u_id;
			this.params.position_name = this.position_name;
			this.params.position = $('.admin_select input:checked').val();
			this.params.p_id = client_info.page_id;
			perform_script_new('admin_panel/moderator_add.php', this.params, function(data) {
				data = JSON.parse(data);
				if(!data['fail']) 
				{
					close_dialog();
					if(data['role'] == 1) this.role_name = 'Сотрудник';
					else if(data['role'] == 2) this.role_name = 'Модератор';
					else if(data['role'] == 3) this.role_name = 'Администратор';
					$('.user_block#u'+data['id']).remove();
					if($('#moderators_list .user_block').length < 1) $("#moderators_list").before('<div class="line_1"></div>');
					$('#moderators_list').prepend('<div id="u'+data['id']+'" class="user_block">\
						<div class="left">\
							<div class="avatar">\
								<img class="icon click" alt="" src="'+static_url+'/uploads/avatars/min_'+data['avatar']+'" onclick="perform_script(\'page_load.php\', \'page=profile&id='+data['id']+'\')">\
							</div>\
							<div class="nickname clearfix" ><div class="left click" onclick="perform_script(\'page_load.php\', \'page=profile&id='+data['id']+'\')">'+data['nickname']+'</div></div>\
							<div class="level">'+data['position']+' ('+this.role_name+')</div>\
						</div>\
						<div class="right menu click">\
							<img class="icon" alt="" src="/assets/img/icon_menu.png" onmouseenter="user_block.menu_open('+data['id']+')">\
							<div id="select" style="display: none" onmouseenter="user_block.menu_close(1, '+data['id']+')" onmouseleave="user_block.menu_close(0, '+data['id']+')">\
								<div onclick="user_block.menu_select(1, '+data['id']+')">Изменить</div>\
								<div onclick="user_block.menu_select(2, '+data['id']+')">Удалить</div>\
							</div>\
						</div>\
					</div>');
				}
				else if(data['fail'] >= 1 && data['fail'] <= 3)
				{
					$('#u_id input').css('border', '1px solid #e07575');
					$('#u_id .icon_warning').show();
					if(data['fail'] == 1) $('#u_id .tt_w').html('Данного пользователя не существует');
					else if(data['fail'] == 2) $('#u_id .tt_w').html('У вас нет прав для управления этим пользователем');
					else if(data['fail'] == 3) $('#u_id .tt_w').html('Вы не можете добавить себя');
				}
			});
		}
	}
}
var moderators_panel = new ModeratorsPanel();

function SectionNavigation()
{
	this.sections = [];
	this.sorting = [];
	this.sorting_close_timeout = [];
	this.page = [];
	this.max_page = [];
	this.id = [];
	this.type = [];
	this.init = function(data)
	{
		this.id[data.slot] = data.id;
		this.sections[data.slot] = [];
		if(data.page == undefined) this.page[data.slot] = 1;
		else this.page[data.slot] = data.page;
		this.sorting[data.slot] = 0;
		this.max_page[data.slot] = data.max_page;
		this.type[data.slot] = data.type;
		if(data.items != undefined)
		{
			for(key in data.items) this.sections[data.slot][key] = data.items[key];
		}
		this.update(data.slot);
	}
	this.open = function(slot)
	{
		$('.section_sorting#'+this.id[slot]+' .status').hide();
		$('.section_sorting#'+this.id[slot]+' .select').show();
	}
	this.close = function(slot, cancel)
	{
		if(cancel == 1) clearTimeout(this.sorting_close_timeout[slot]);
		else
		{
			this.sorting_close_timeout[slot] = setTimeout(function() {
				$('.section_sorting#'+section_navigation.id[slot]+' .status').show();
				$('.section_sorting#'+section_navigation.id[slot]+' .select').hide();
			}, 1000);
		}
	}
	this.select = function(slot, sorting)
	{
		if(this.sorting[slot] != sorting)
		{
			this.page[slot] = 1;
			this.sorting[slot] = sorting;
			$('.section_sorting#'+this.id[slot]+' .status .text').html(this.sections[slot][sorting]);
			if(this.id[slot] == 'users') perform_script_new('users_load.php', {'sorting':sorting}, function(data) {
				$('#community_users #users_list').html(data);
			});
			else if(this.id[slot] == 'discuss') perform_script_new('discuss_load.php', {'sorting':sorting}, function(data) {
				$('#community_discuss #discuss_list').html(data);
			});
			this.update(slot);
		}
		$('.section_sorting#'+this.id[slot]+' .select').hide();
		$('.section_sorting#'+this.id[slot]+' .status').show();
	}
	this.page_select = function(slot, page) 
	{
		if(this.page[slot] != page[slot]) 
		{
			this.page[slot] = page;
			if(this.id[slot] == 'users') perform_script_new('users_load.php', {'sorting':this.sorting[slot],'page':this.page[slot]}, function(data) {
				$('#community_users #users_list').html(data);
			});
			else if(this.id[slot] == 'discuss_comments') perform_script_new('dc_load.php', {'discuss_id':client_info.page_id,'page':this.page[slot]}, function(data) {
				$('#discuss_comments #comments_list').html(data);
			});
			this.update(slot);
		}
	}
	this.page_next = function(slot) 
	{
		this.page[slot]++;
		if(this.id[slot] == 'users') perform_script_new('users_load.php', {'sorting':this.sorting[slot],'page':this.page[slot]}, function(data) {
			$('#community_users #users_list').html(data);
		});
		else if(this.id[slot] == 'discuss') perform_script_new('discuss_load.php', {'sorting':this.sorting[slot],'page':this.page[slot]}, function(data) {
			$('#community_discuss #discuss_list').append(data);
		});
		else if(this.id[slot] == 'discuss_comments') perform_script_new('dc_load.php', {'discuss_id':client_info.page_id,'page':this.page[slot]}, function(data) {
			$('#discuss_comments #comments_list').html(data);
		});
		this.update(slot);
	}
	this.page_previous = function(slot) 
	{
		this.page[slot]--;
		if(this.id[slot] == 'users') perform_script_new('users_load.php', {'sorting':this.sorting[slot],'page':this.page[slot]}, function(data) {
			$('#community_users #users_list').html(data);
		});
		else if(this.id[slot] == 'discuss_comments') perform_script_new('dc_load.php', {'discuss_id':client_info.page_id,'page':this.page[slot]}, function(data) {
			$('#discuss_comments #comments_list').html(data);
		});
		this.update(slot);
	}
	this.update = function(slot)
	{
		if(this.type[slot] == 1)
		{
			$('#page_navigation_'+this.id[slot]).html('');
			if(this.page[slot] != 1) $('#page_navigation_'+this.id[slot]).append('<img alt="" class="left" src="/assets/img/icon_page_left.png" onclick="section_navigation.page_previous('+slot+')">');
			$('#page_navigation_'+this.id[slot]).append('<div id="pages">');
				if(this.page[slot] >= 2)
				{
					$('#page_navigation_'+this.id[slot]+' #pages').append('<span class="item click" id="first_page" onclick="section_navigation.page_select('+slot+', 1)">1</span><span class="item">..</span>');
				}
				$('#page_navigation_'+this.id[slot]+' #pages').append('<span class="item active">'+this.page[slot]+'</span>');
				if(this.page[slot] < this.max_page[slot])
				{
					$('#page_navigation_'+this.id[slot]+' #pages').append('<span class="item">..</span><span class="item click" id="first_page" onclick="section_navigation.page_select('+slot+', '+this.max_page[slot]+')">'+this.max_page[slot]+'</span>');
				}
			$('#page_navigation_'+this.id[slot]).append('</div>');
			if(this.page[slot] != this.max_page[slot]) $('#page_navigation_'+this.id[slot]).append('<img alt="" class="right" src="/assets/img/icon_page_right.png" onclick="section_navigation.page_next('+slot+')">');
			if(this.page[slot] == 1)
			{
				if(this.max_page[slot] < 2) $('#page_navigation_'+this.id[slot]+'_block').hide();
				else $('#page_navigation_'+this.id[slot]+'_block').show();
			}
			if(this.id[slot] == 'discuss_comments')
			{
				if(this.page[slot] != this.max_page[slot]) $('#comment.input_block').hide();
				else $('#comment.input_block').show();
			}
		}
		else if(this.type[slot] == 2)
		{
			if(this.max_page[slot] <= this.page[slot]) $('#discuss.button_more').hide();
			else $('#discuss.button_more').show();
		}
	}
}
var section_navigation = new SectionNavigation();

function right_menu_select(item)
{
	var old_item = $('#sections_list').attr('data-select');
	if(old_item != item)
	{
		find_hide('job_sorting');
		$('#sections_list .item#c'+old_item).removeClass('active');
		$('#sections_list .item#c'+old_item).addClass('click');
		$('#sections_list .item#c'+item).addClass('active');
		$('#sections_list .item#c'+item).removeClass('click');
		$('#sections_list').attr('data-select', item);
		perform_script('load_job.php', 'section='+content_navigation[0].sorting_status+'&sorting='+item);
	}
}

function JobModule()
{
	this.open = function(id, update)
	{
		this.params = {};
		this.params.page = 'job';
		this.params.id = id;
		this.views = localStorage_array('job_views');
		if(this.views[id] == undefined || this.views[id] < update) this.params.view = 1;
		this.views[id] = new Date().getUnix();
		localStorage['job_views'] = JSON.stringify(this.views);
		perform_script_new('page_load.php', this.params);
		return false;
	}
	this.menu_open = function() 
	{ 
		$('#job_info .dots_menu #select').show();
	}
	this.menu_close = function(cancel)
	{
		if(cancel == 1) clearTimeout(this.menu_close_timeout);
		else
		{
			this.menu_close_timeout = setTimeout(function() {
				$('#job_info .dots_menu #select').hide();
			}, 1000);
		}
	}
	this.menu_select = function(action)
	{
		if(action == 1) 
		{
			this.params = {};
			this.params.job_id = client_info.page_id;
			open_dialog_new('dialogs/job_edit.php', this.params);
		}
		else if(action == 3) 
		{
			this.params = {};
			this.params.job_id = client_info.page_id;
			perform_script_new('job_delete.php', this.params, function(data) {
				perform_script('page_load.php', 'page=job');
			});
		}
		$('#job_info .dots_menu #select').hide();
	}
	this.select_salary = function()
	{
		if($('#select_pay_type select').val() == 1)
		{
			$('#select_pay_count').html('<div class="input_text_block left" id="input_salary">\
				<input type="text" placeholder="Сумма" class="outline">\
				<img src="/assets/img/icon_warning.png" alt="" class="icon_warning" onmouseenter="$(\'#input_salary .tt_w.warning\').fadeIn()" onmouseleave="$(\'#input_salary .tt_w.warning\').fadeOut()">\
				<div class="tt_w tt_top warning"></div>\
			</div>\
			<div class="currency left">руб.</div>');
			$('#select_pay_count').removeClass('hide');
		}
	}
	this.save = function(section, id)
	{
		this.complete = 1;
		$('input[type="text"]').css('border', '1px solid rgb(235, 235, 235)');
		$('textarea').css('border', '1px solid rgb(235, 235, 235)');
		$('#select_pay_type select').css('border', '1px solid rgb(235, 235, 235)');
		$('.icon_warning').hide();
		$('.icon_info').show();
		this.title = $('#input_title input').val();
		if(this.title != null)
		{
			this.title = this.title.trim();
			if(this.title.length < 1 || this.title.length > 150)
			{
				$('#input_title input').css('border', '1px solid #e07575');
				$('#input_title .icon_warning').show();
				if(this.title.length < 1) $('#input_title .tt_w').html('Вы не указали заголовок');
				else if(this.title.length > 150) $('#input_title .tt_w').html('Используйте не более 150 символов');
				this.complete = 0;
			}
		}
		this.tags = $('#input_tags input').val();
		if(this.tags != null)
		{
			this.tags = this.tags.trim();
			if(this.tags.length < 1 || this.tags.length > 75)
			{
				$('#input_tags input').css('border', '1px solid #e07575');
				$('#input_tags .icon_warning').show();
				$('#input_tags .icon_info').hide();
				if(this.tags.length < 1) $('#input_tags .tt_w').html('Вы не указали тэги');
				else if(this.tags.length > 75) $('#input_tags .tt_w').html('Используйте не более 75 символов');
				this.complete = 0;
			}
		}
		this.desc = $('#input_desc textarea').val();
		if(this.desc != null)
		{
			this.desc = this.desc.trim();
			if(this.desc.length < 1 || this.desc.length > 1000)
			{
				$('#input_desc textarea').css('border', '1px solid #e07575');
				$('#input_desc .icon_warning').show();
				if(this.desc.length < 1) $('#input_desc .tt_w').html('Вы не указали описание');
				else if(this.desc.length > 1000) $('#input_desc .tt_w').html('Используйте не более 1000 символов');
				this.complete = 0;
			}
		}
		this.require = $('#input_require textarea').val();
		if(this.require != null)
		{
			this.require = this.require.trim();
			if(this.require.length < 1 || this.require.length > 500)
			{
				$('#input_require textarea').css('border', '1px solid #e07575');
				$('#input_require .icon_warning').show();
				if(this.require.length < 1) $('#input_require .tt_w').html('Вы не указали требования');
				else if(this.require.length > 75) $('#input_require .tt_w').html('Используйте не более 500 символов');
				this.complete = 0;
			}
		}
		this.pay_type = $('#select_pay_type select').val();
		if(this.pay_type == null)
		{
			$('#select_pay_type select').css('border', '1px solid #e07575');
			this.complete = 0;
		}
		else
		{
			this.salary = $('#input_salary input').val();
			if(this.salary != null)
			{
				if(this.salary < 1 || this.salary > 999999 || isNaN(+this.salary))
				{
					$('#input_salary input').css('border', '1px solid #e07575');
					$('#input_salary .icon_warning').show();
					if(isNaN(+this.salary)) $('#input_salary .tt_w').html('Можно указать только число');
					else if(this.salary < 1) $('#input_salary .tt_w').html('Вы не указали сумму');
					else if(this.salary > 999999) $('#input_salary .tt_w').html('Нельзя указать более 999.999 руб.');
					this.complete = 0;
				}
			}
		}
		if(this.complete == 1)
		{
			this.params = {};
			this.params.title = this.title;
			this.params.tags = this.tags;
			this.params.sorting = $('#select_sorting select').val();
			this.params.desc = this.desc;
			this.params.require = this.require;
			this.params.pay_type = this.pay_type;
			this.params.salary = this.salary;
			this.params.section = section;
			if(id != -1) this.params.job_id = id;
			perform_script_new('job_edit.php', this.params, function(data) {
				data = JSON.parse(data);
				if(data['job_id'] != undefined)
				{
					close_dialog();
					perform_script('page_load.php', 'page=job&id='+data['job_id']);
				}
			});
		}
	}
}
var job_module = new JobModule();

function NewsMenu()
{
	this.open = function() 
	{ 
		$('.dots_menu #select').show();
	}
	this.close = function(cancel)
	{
		if(cancel == 1) clearTimeout(this.menu_close_timeout);
		else
		{
			this.menu_close_timeout = setTimeout(function() {
				$('.dots_menu #select').hide();
			}, 1000);
		}
	}
	this.select = function(action)
	{
		this.params = {};
		if(client_info.page == 'news') this.params.type = 1;
		else this.params.type = 2;
		this.params.id = client_info.page_id;
		if(action == 1) open_dialog_new('dialogs/admin_panel/news_edit.php', this.params);
		else if(action == 2) 
		{
			perform_script_new('admin_panel/news_delete.php', this.params, function(data) {
				perform_script('page_load.php', 'page=news');
			});
		}
		$('.dots_menu #select').hide();
	}
}
var news_menu = new NewsMenu();

function profileCreate()
{
	perform_script_new('profile_create.php', '', function() {
		perform_script('page_load.php', 'page=profile&id='+u_id_global);
		close_dialog(1);
	});
}

function registration_form(vk)
{
	this.complete = 1;
	$('input[type="text"]').css('border', '1px solid rgb(235, 235, 235)');
	if(!vk)
	{
		$('input[type="email"]').css('border', '1px solid rgb(235, 235, 235)');
		$('input[type="password"]').css('border', '1px solid rgb(235, 235, 235)');
		$('#select_gender select').css('border', '1px solid rgb(235, 235, 235)');
	}
	$('.icon_warning').hide();
	this.name = $('#input_name input').val();
	if(this.name != null)
	{
		this.name = this.name.trim();
		if(this.name.length < 3 || this.name.length > 18)
		{
			$('#input_name input').css('border', '1px solid #e07575');
			$('#input_name .icon_warning').show();
			if(this.name.length < 3) $('#input_name .tt_w').html('Никнейм слишком короткий');
			else if(this.name.length > 18) $('#input_name .tt_w').html('Используйте не более 18 символов');
			this.complete = 0;
		}
	}
	if(!vk)
	{
		this.email = $('#input_email input').val();
		if(this.email != null)
		{
			this.email = this.email.trim();
			if(this.email.length < 5 || this.email.length > 320)
			{
				$('#input_email input').css('border', '1px solid #e07575');
				$('#input_email .icon_warning').show();
				if(this.email.length < 5) $('#input_email .tt_w').html('Некорректный E-Mail');
				else if(this.email.length > 320) $('#input_email .tt_w').html('Некорректный E-Mail');
				this.complete = 0;
			}
		}
		this.password = $('#input_password input').val();
		this.password_confirm = $('#input_confirm_password').val();
		if(this.password != null && this.password_confirm != null)
		{
			this.password = this.password.trim();
			this.password_confirm = this.password_confirm.trim();
			if(this.password.length < 6 || this.password.length > 50 || this.password != this.password_confirm)
			{
				$('#input_password input').css('border', '1px solid #e07575');
				$('#input_password .icon_warning').show();
				if(this.password.length < 6) $('#input_password .tt_w').html('Пароль слишком короткий');
				else if(this.password.length > 50) $('#input_password .tt_w').html('Используйте не более 50 символов');
				else if(this.password != this.password_confirm) 
				{
					$('#input_confirm_password').css('border', '1px solid #e07575');
					$('#input_password .tt_w').html('Пароли не совпадают');
				}
				this.complete = 0;
			}
		}
		this.gender = $('#select_gender select').val();
		if(this.gender == null || isNaN(+this.gender) || this.gender < 1 || this.gender > 2)
		{
			$('#select_gender select').css('border', '1px solid #e07575');
			this.complete = 0;
		}
	}
	if(this.complete == 1)
	{
		this.params = {};
		this.params.name = this.name;
		if(!vk)
		{
			this.params.email = this.email;
			this.params.pass = this.password;
			this.params.gender = this.gender;
		}
		this.params.submit = 1;
		perform_script_new('dialogs/registration.php', this.params, function(data) {
			data = JSON.parse(data);
			if(data['error'] != undefined)
			{
				$('#input_name input').css('border', '1px solid #e07575');
				$('#input_name .icon_warning').show();
				if(!vk)
				{
					$('#input_name .tt_w').html('Аккаунт с данным никнеймом или E-Mail уже существует');
					$('#input_email input').css('border', '1px solid #e07575');
					$('#input_email .icon_warning').show();
					$('#input_email .tt_w').html('Аккаунт с данным никнеймом или E-Mail уже существует');
				}
				else $('#input_name .tt_w').html('Данный никнейм уже занят');
			}
			else data_handler(data);
		});
	}
}

function login_form()
{
	this.complete = 1;
	$('input[type="text"]').css('border', '1px solid rgb(235, 235, 235)');
	$('input[type="password"]').css('border', '1px solid rgb(235, 235, 235)');
	$('.icon_warning').hide();
	this.login_text = $('#input_login input').val();
	if(this.login_text != null)
	{
		this.login_text = this.login_text.trim();
		if(this.login_text.length < 1 || this.login_text.length > 320)
		{
			$('#input_login input').css('border', '1px solid #e07575');
			$('#input_login .icon_warning').show();
			if(this.login_text.length < 1) $('#input_login .tt_w').html('Вы не указали логин');
			else if(this.login_text.length > 320) $('#input_login .tt_w').html('Используйте не более 320 символов');
			this.complete = 0;
		}
	}
	this.password = $('#input_password input').val();
	if(this.password != null)
	{
		this.password = this.password.trim();
		if(this.password.length < 1 || this.password.length > 50)
		{
			$('#input_password input').css('border', '1px solid #e07575');
			$('#input_password .icon_warning').show();
			if(this.password.length < 1) $('#input_password .tt_w').html('Вы не указали пароль');
			else if(this.password.length > 50) $('#input_password .tt_w').html('Используйте не более 50 символов');
			this.complete = 0;
		}
	}
	if(this.complete == 1)
	{
		this.params = {};
		this.params.login = this.login_text;
		this.params.password = this.password;
		this.params.submit = 1;
		perform_script_new('dialogs/login.php', this.params, function(data) {
			data = JSON.parse(data);
			if(data['error'] != undefined)
			{
				if(data['error'] == 3)
				{
					$('#input_login input').css('border', '1px solid #e07575');
					$('#input_login .icon_warning').show();
					$('#input_login .tt_w').html('Аккаунта с указанным логином не существует');
				}
				if(data['error'] == 4)
				{
					$('#input_password input').css('border', '1px solid #e07575');
					$('#input_password .icon_warning').show();
					$('#input_password .tt_w').html('Неверный пароль');
				}
			}
			else data_handler(data);
		});
	}
}

function recovery_form()
{
	this.complete = 1;
	$('input[type="text"]').css('border', '1px solid rgb(235, 235, 235)');
	$('.icon_warning').hide();
	this.login_text = $('#input_login input').val();
	if(this.login_text != null)
	{
		this.login_text = this.login_text.trim();
		if(this.login_text.length < 1 || this.login_text.length > 320)
		{
			$('#input_login input').css('border', '1px solid #e07575');
			$('#input_login .icon_warning').show();
			if(this.login_text.length < 1) $('#input_login .tt_w').html('Вы не указали логин');
			else if(this.login_text.length > 320) $('#input_login .tt_w').html('Используйте не более 320 символов');
			this.complete = 0;
		}
	}
	if(this.complete == 1)
	{
		this.params = {};
		this.params.login = this.login_text;
		this.params.submit = 1;
		perform_script_new('dialogs/recovery.php', this.params, function(data) {
			data = JSON.parse(data);
			if(data['error'] != undefined)
			{
				$('#input_login input').css('border', '1px solid #e07575');
				$('#input_login .icon_warning').show();
				$('#input_login .tt_w').html('Аккаунта с указанным логином не существует');
			}
			else data_handler(data);
		});
	}
}

function localStorage_array(key)
{
	var value = {};
	if(localStorage[key] != undefined) value = JSON.parse(localStorage[key]);
	return value;
}

var dialogs_info = {};
dialogs_info[1] = {
  title: 'КОНТАКТЫ',
  text: '<a href="https://web.archive.org/web/20161106151616/https://vk.com/insgm" target="_blank">Группа ВКонтакте</a><br>E-Mail: support@insgm.ru'
};

dialogs_info[2] = {
  title: 'РЕКЛАМА',
  text: 'Мы предоставляем несколько видов рекламы на нашем портале:<br>- Рассказать о вашем проекте в новостях;<br>- Добавление проекта в каталог;<br>- Добавление проекта в раздел "Интересное";<br>- Реклама проекта (из нашего каталога)/профиля/обсуждения на страницах портала;<br>- Баннерная реклама внешних сайтов на страницах портала;<br>- Закрепление вакансии/резюме;<br><br>Подробнее узнать всё и заказать вы можете написав нам на E-Mail или в сообщения группы ВКонтакте.<br><br><a href="https://web.archive.org/web/20161106151616/https://vk.com/insgm" target="_blank">Группа ВКонтакте</a><br>E-Mail: business@insgm.ru'
};

function show_dialog(dialog_id)
{
	$('#dialog').html('<div class="dialog_workspace">\
		<div class="dialog_content" onmouseenter="dialog.mouse_enter()" onmouseleave="dialog.mouse_leave()" id="friends">\
			<div class="block_title">'+dialogs_info[dialog_id].title+'</div>\
			'+dialogs_info[dialog_id].text+'\
		</div>\
		<img class="icon_dialog_close" alt="" src="/assets/img/icon_close_2.png">\
		<script>dialog.init()</script>\
	</div>');
	$('#dialog').show();
	$('body').css('overflow', 'hidden');
}

function count_object(obj)
{
    var count = 0; 
    for(var prs in obj) count++;
    return count; 
}
/*
     FILE ARCHIVED ON 15:16:16 Nov 06, 2016 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 09:00:35 Mar 27, 2018.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/