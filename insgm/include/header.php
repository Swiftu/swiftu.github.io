	<div class="content">
		<div class="game_select_list">
			<div onclick="perform_script('game_select.php', 'game=1')" class="item click">GTA: SA-MP</div>
			<div onclick="perform_script('game_select.php', 'game=2')" class="item click">GTA: CR-MP</div>
			<div onclick="perform_script('game_select.php', 'game=3')" class="item click">GTA: MTA</div>
		</div>
	</div>
	<div class="navigation_top">
		<div class="content">
			<div class="clearfix" id="game_select" onclick="click_list(0)">
				<img class="icon" alt="" src=assets/images/icon_game_select.png>
				<div class="name" id="game_name">GTA: SA-MP</div>
				<img class="arrow" alt="" src="assets/images/icon_arrow.png">
			</div>
			<!-- !!! -->
			<div class="clearfix" id="top_menu">
				<div class="top_menu" onclick="show_dialog(2)">Реклама</div>
				<div class="top_menu" onclick="show_dialog(1)">Контакты</div>
				<div class="top_menu" onclick="perform_script('page_load.php','page=job')">Работа</div>
				<div class="top_menu"><a href="https://youtube.com/" class="button" target="_blank" style="color: #fff"><img class="icon_youtube left" alt="" src="assets/images/icon_yt.png">Канал</a></div>
			</div>
			<div id="profile">
				<div style="cursor: pointer;" onclick="open_dialog('dialogs/login.php')">
					<div class="login_text">Авторизация</div>
					<img class="login_icon" alt="" src="assets/images/icon_profile.png">
				</div>
			</div>
		</div>
	</div>
	<div class="navigation_bottom">
		<div class="content">
			<!--<img class="logo" alt="" src="/assets/img/logo.png">-->
			<div class="logo_text click" onclick="perform_script('page_load.php)', 'page=main')">INSIDE GAMING</div>
			<div class="clearfix" id="bottom_menu">
				<div class="bottom_menu" onclick="load_page('page=commuity')">СООБЩЕСТВО</div>
				<div class="bottom_menu" onclick="load_page('page=monitoring')">ПРОЕКТЫ</div>
				<div class="bottom_menu active" onclick="load_page('page=news')">НОВОСТИ</div>
				<!--<div class="update_count">4</div>-->
			</div>
		</div>
	</div>