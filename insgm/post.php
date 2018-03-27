<!DOCTYPE html>
<html>

<head>
<?php
	include 'include/head.php';
?>
</head>

<body>
<?php 
	include 'include/header.php';
?>
	<div id="page_content" class="clearfix">
		<div id="workspace" style="width: 910px">
			<div id="main" style="width: 600px">
				<div class="main_block" id="news_info_block">
					<div class="news_title">Lorem ipsum dolor sit amet, consectetur.</div>
					<div style="margin-top: 20px">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iure rerum corporis, placeat fugiat. Deserunt, animi ducimus illo voluptates voluptatum quaerat facere voluptas ad officia, officiis temporibus nostrum laborum voluptate soluta.<br/>
						<br/>
						<img alt="" src="http://placehold.it/350x125&amp;text=POSTER" width="100%" /><br/>
						<br/>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse rerum, quisquam doloremque, magni veniam ab voluptatem modi, ipsam quos suscipit quas, sapiente in similique. Consectetur unde sed iure error sint.
					</div>
					<div class="clearfix news_tags_block">
						<div class="news_tags">#Lorem ipsum.</div>
						<div class="news_tags">#Lorem</div>
						<!-- !!! -->
						<script src="http://yastatic.net/es5-shims/0.0.2/es5-shims.min.js"></script>
						<script src="http://yastatic.net/share2/share.js"></script>
						<div class="ya-share2 right" data-services="vkontakte,facebook,odnoklassniki,gplus,twitter" data-counter="" style="margin-top: 11px"></div>
					</div>
					<div class="line_1"></div>
					<div class="clearfix" style="margin-top: 30px">
						<div style="cursor: pointer; loat: left;" onclick="perform_script('page_load.php', 'page=profile&amp;id=26')">
							<img alt="" src="https://uinames.com/api/photos/male/4.jpg" style="float: left; width: 45px; border-radius: 25px">
							<div style="float: left; margin: 2px 0px 0px 20px; font-family: OpenSansSemibold; color: #343434">Scott Ortega
								<div class="news_post_time">26.03.2018 в 22:40</div>
							</div>
						</div>
						<div style="float: right; margin-top: 10px;">
							<img alt="" src="assets/images/icon_views_2.png" style="margin: 0px 8px -3px 0px; display: none"><span class="news_post_info_text_full">123</span>
							<img alt="" src="assets/images/icon_like_2.png" style="margin: 0px 7px -3px 15px; display: none"><span class="news_post_info_text_full" id="likes">123</span>
						</div>
					</div>
				</div>
				<script>
					var comments_data = new CommentsData(2)

				</script>
				<div class="main_block project_info">
					<div class="clearfix title_1">
						<div class="left">КОММЕНТАРИИ (<span id="comments_count">0</span>)</div>
						<div class="right select" id="comments_sorting">
							<div id="status" onclick="comments_list.sorting_open()">
								<span class="text">Новые</span>
								<img alt="" src="assets/images/icon_arrow_gray.png" class="icon">
							</div>
							<div id="select" style="" onmouseenter="comments_list.sorting_close(1)" onmouseleave="comments_list.sorting_close(0)">
								<div onclick="comments_list.sorting_select(1)">Новые</div>
								<div onclick="comments_list.sorting_select(2)">Популярные</div>
							</div>
						</div>
					</div>
					<div id="comments_list">
						<!-- !!! -->
						<script>
							comments_data.comments_count = 0;
							$('#comments_list').html('<div id="load_script"></div>');
							comments_data.init(182, 'Esposito', '491476886403.jpg', 'Ну и хрен с ним.', '01.11.2016 в 17:02', 1478019730, 1, 0, 49, 'c=182', -1, 0);
							comments_data.init(188, 'brnrd', '1681478099508.png', 'Жалко ли? Нет.<br>Не играл там, поэтому мне не понять. ', '02.11.2016 в 15:28', 1478100488, 0, 0, 168, 'c=188', -1, 0);
							$('#comments_list #load_script').html('');

						</script>
					</div>
					<div class="clearfix text-center page_navigation_margin" id="page_navigation" style=""></div>
					<!-- !!! -->
					<script>
						var comments_list = new CommentsList();
						comments_list.init(1, 1);

					</script>
				</div>
			</div>
			<div id="right_side">
				<div class="side_block advertising">
					<div class="block_title">АКТИВНОЕ</div>
					<div class="content_type">
						<div class="cell name">Проекты</div>
						<div class="cell">
							<div class="line"></div>
						</div>
					</div>
					<a href="#" class="button" onclick="perform_script('page_load.php', 'page=project&amp;id=48');return false">
						<div class="project_block clearfix">
							<img class="logo left click" alt="" src="https://pbs.twimg.com/profile_images/378800000084891630/3f7cffb42f5d216e53ff73e82020f7b5_400x400.png">
							<div class="info left">
								<div class="clearfix">
									<div class="name left click">Project X</div>
									<div class="rating left" style="background-color: #cbe075">5.5</div>
								</div>
								<div class="players">Аудитория: <span class="count">∞</span></div>
							</div>
						</div>
					</a>
					<div class="content_type margin">
						<div class="cell name">Пользователи</div>
						<div class="cell">
							<div class="line"></div>
						</div>
					</div>
					<a href="#" class="button" onclick="perform_script('page_load.php', 'page=profile&amp;id=26');return false">
						<div class="profile_block clearfix"><img class="avatar left click" alt="" src="https://uinames.com/api/photos/male/20.jpg">
							<div class="info left">
								<div class="clearfix">
									<div class="name left click">Gregory Stanley</div>
									<div class="rating positive left">+8</div>
								</div>
								<div class="level">Уровень: <span class="count">1
								</span></div>
							</div>
						</div>
					</a>
					<div class="content_type margin">
						<div class="cell name">Обсуждения</div>
						<div class="cell">
							<div class="line"></div>
						</div>
					</div>
					<a href="#" class="button" onclick="perform_script('page_load.php', 'page=discuss&amp;id=10');return false">
						<div class="discuss_block">
							<div class="title">Lorem ipsum dolor sit amet, consectetur adipisicing.</div>
							<div class="stats clearfix">
								<div class="icon_views left"></div>
								<div class="count left">20</div>
								<div class="icon_comments left"></div>
								<div class="count left">6</div>
							</div>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>
</body>
<div id="dialog" class="dialog" onclick="dialog.click()"></div>
<div id="scripts">
</div>

</html>
