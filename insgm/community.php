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
		<div id="workspace" style="width: 960px">
			<div id="main" style="width: 650px">
				<div class="main_block" id="community_discuss">
					<div class="clearfix title_1 margin_30">
						<div class="left">ОБСУЖДЕНИЯ</div>
						<div class="right select section_sorting" id="discuss">
							<div class="status" onclick="section_navigation.open(1)">
								<span class="text">Новые</span>
								<img alt="" src="assets/images/icon_arrow_gray.png" class="icon">
							</div>
							<div class="select" style="" onmouseenter="section_navigation.close(1, 1)" onmouseleave="section_navigation.close(1, 0)">
								<div onclick="section_navigation.select(1, 0)">Новые</div>
								<div onclick="section_navigation.select(1, 1)">Популярные</div>
							</div>
						</div>
					</div>
					<div class="clearfix" id="discuss_list">
						<div id="load">
							<!-- !!! -->
							<script>
								$('#discuss_list #load').remove()

							</script>
						</div>
					</div>
					<div id="discuss" class="button_more click" style="" onclick="section_navigation.page_nex(1)">ПОКАЗАТЬ ЕЩЕ</div>
					<!-- !!! -->
					<script>
						section_navigation.init({
							'id': 'discuss',
							'items': ['Новые', 'Популярные'],
							'slot': '1',
							'max_page': '2',
							'type': '2'
						});

					</script>
				</div>
				<div class="main_block" id="community_users">
					<div class="clearfix title_1">
						<div class="left">ПОЛЬЗОВАТЕЛИ</div>
						<div class="right select section_sorting" id="users">
							<div class="status" onclick="section_navigation.open(0)">
								<span class="text">Активные</span>
								<img alt="" src="assets/images/icon_arrow_gray.png" class="icon">
							</div>
							<div class="select" style="" onmouseenter="section_navigation.close(0, 1)" onmouseleave="section_navigation.close(0, 0)">
								<div onclick="section_navigation.select(0, 0)">Активные</div>
								<div onclick="section_navigation.select(0, 1)">Популярные</div>
								<div onclick="section_navigation.select(0, 2)">Лучшие</div>
							</div>
						</div>
					</div>
					<div class="clearfix" id="users_list"></div>
					<div class="main_block main_block_4" id="page-navigation_users_block" style="">
						<div class="clearfix text_center page_navigation" id="page_navigation_users">
						</div>
					</div>
					<script>
						section_navigation.init({
							'id': 'users',
							'items': ['Активные', 'Популярные', 'Лучшие'],
							'max_page': '0',
							'slot': '0',
							'type': '1'
						});

					</script>
				</div>
			</div>
			<div id="right_side"></div>
		</div>
	</div>
</body>
<div id="dialog" class="dialog" onclick="dialog.click()"></div>
<div id="scripts"></div>

</html>
