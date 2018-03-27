var socket;
var socket_id;
var timeout_id;

function Socket_Send(command) 
{
	var data = [];
	data[0] = command;
	data[1] = get_cookie("SID");
    socket.send(JSON_stringify(data, false));
}

function Socket_Update(type) 
{
	var data = [];
	data[0] = "Update";
	data[1] = get_cookie("SID");
	data[2] = type;
    socket.send(JSON_stringify(data, false));
}

function Socket_Action(action, params)
{
	var data = [];
	data[0] = "action";
	data[1] = action;
	data[2] = params;
    socket.json.send(data);
}

function Socket_Connect()
{
	socket = io.connect('https://web.archive.org/web/20161106151617/http://insgm.ru:3001/', {transports: ['websocket', 'flashsocket', 'xhr-polling']});
	socket.on('connect', function () 
	{
		var data = [];
		data[0] = "connect";
		data[1] = get_cookie("SID");
		data[2] = u_id_global;
		socket.json.send(data);
		socket.on('message', function (json_text) { 
			var text = JSON.parse(json_text);
			if(text['event'] == 'connect_request') socket_id = text['data']['id'];
			if(text['event'] == 'notifications')
			{
				if(text['data']['name'] == 'message' && text['data']['game'] == u_profile_load) 
				{
					if(dialog_open != 'dialogs' && text['data']['id'] != u_profile_id) $('.navigation_top #messages .update').show();
				}
				if(text['data']['name'] == 'friend' && text['data']['game'] == u_profile_load) 
				{
					$('.navigation_top #friends .update').show();
					//perform_script('notifications_status.php', 'type=2');
				}
				if(text['data']['name'] == 'notification' && text['data']['game'] == u_profile_load) 
				{
					$('.navigation_top #notifications .update').show();
				}
				if(text['data']['name'] == 'dialog_read') 
				{
					if(text['data']['id'] == u_profile_id) messages_data.fading_all();
				}
				if(text['data']['name'] == 'news_add_image_load') 
				{
					$('#dialog #news_add .input_text #text').val($('#dialog #news_add .input_text #text').val()+'[img]/uploads/news/'+text['data']['image']+'[/img]');
					close_dialog_2();
				}
			}
			else if(text['event'] == 'add_comment') 
			{
				if(text['data']['type'] == 'discuss') discuss_module.comment_add(text['data']);
				else comments_data.init(text['data']['id'], text['data']['nickname'], text['data']['avatar'], text['data']['text'], text['data']['date_text'], text['data']['date'], 0, 0, text['data']['u_id'], text['data']['url'], text['data']['reply'], 1);
			}
			else if(text['event'] == 'delete_comment') 
			{
				if(text['data']['type'] == 'discuss') discuss_module.socket_delete(text['data']['id']);
				else comments_data.delete(text['data']['id'], 0);
			}
			else if(text['event'] == 'edit_comment') 
			{
				if(text['data']['type'] == 'discuss') discuss_module.update(text['data']['id'], text['data']['text']);
				else comments_data.update(text['data']['id'], text['data']['text']);
			}
			else if(text['event'] == 'new_message') messages_data.show(text['data']['id'], text['data']['u_id'], text['data']['u_name'], text['data']['u_avatar'], text['data']['message'], text['data']['time']);
			else if(text['event'] == 'new_dialog') dialogs_data.show(text['data']['id'], text['data']['name'], text['data']['avatar'], text['data']['message'], text['data']['time']);
			else if(text['event'] == 'update_dialog') dialogs_data.new_message(text['data']['id'], text['data']['message'], text['data']['time']);
			else if(text['event'] == 'update_image') 
			{
				if(text['data']['type'] == 1)
				{
					close_dialog();
					$('#logo_big #image').replaceWith('<img alt="" id="image" src="'+static_url+'/uploads/project_logo/'+text['data']['logo']+'">');
				}
				else if(text['data']['type'] == 2) 
				{
					close_dialog();
					perform_script('page_update.php', 'type=1');
				}
				else 
				{
					$('.dialog_content').html('Данное изменение вступит в силу после одобрения администрацией.');
					$('.dialog_content').css('height', '20px');
				}
			}
		});	
	});
	socket.on('disconnect', function () 
	{
		socket.close();
		perform_script('ws_connect.php');
	});
}

function Socket_Disconnect() 
{
    var data = [];
	data[0] = "Disconnect";
	data[1] = get_cookie("SID");
	socket.send(JSON_stringify(data, false));
    socket.close();
}

// Function's

function timeout_script(script, time)
{
	clearTimeout(timeout_id);
	timeout_id = setTimeout(script, time);
}

function JSON_stringify(s, emit_unicode)
{
   var json = JSON.stringify(s);
   return emit_unicode ? json : json.replace(/[\u007f-\uffff]/g,
      function(c) { 
        return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
      }
   );
}

function get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}
/*
     FILE ARCHIVED ON 15:16:17 Nov 06, 2016 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 09:00:34 Mar 27, 2018.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/