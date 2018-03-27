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
				<div class="main_block main_block_2">
					<div class="clearfix" id="job_sorting">
						<div class="sorting">
							<div class="item selected" onclick="content_navigation[0].sorting(2)" id="2">Работа</div>
							<div class="item" onclick="content_navigation[0].sorting(1)" id="1">Исполнители</div>
						</div>
						<input type="text" class="find_text" placeholder="Поиск..." onkeyup="find_change('job_sorting')" autofocus>
						<img alt="" class="find nomargin right click" src="/assets/images/icon_find.png" onclick="find_show('job_sorting')">
						<img alt="" class="find_close nomargin right click" src="assets/images/icon_close.png" onclick="find_hide('job_sorting')">
					</div>
				</div>
				<div id="job_list"></div>
				<div class="main_block main_block_3" id="page_navigation_5_block" style="">
					<div class="clearfix text_center page_navigation" id="page_navigation_5"></div>
				</div>
				<!-- !!! -->
				<script>
					content_navigation[0].init(1, 0, 5)

				</script>
			</div>
			<div id="right_side">
				<div class="side_block">
					<div class="block_title">РАЗДЕЛЫ</div>
					<div id="sections_list" data-select="1">
						<div class="item active" id="c1" onclick="right_menu_select(1)">
							<div class="icon" id="i1"></div>Программирование
						</div>
						<div class="item click" id="c2" onclick="right_menu_select(2)">
							<div class="icon" id="i2"></div>Игровые локации</div>
						<div class="item click" id="c3" onclick="right_menu_select(3)">
							<div class="icon" id="i3"></div>Дизайн</div>
						<div class="item click" id="c4" onclick="right_menu_select(4)">
							<div class="icon" id="i4"></div>Иллюстрации</div>
						<div class="item click" id="c5" onclick="right_menu_select(5)">
							<div class="icon" id="i1"></div>Обслуживание</div>
						<div class="item click" id="c6" onclick="right_menu_select(6)">
							<div class="icon" id="i5"></div>Безопаность</div>
						<div class="item click" id="c7" onclick="right_menu_select(7)">
							<div class="icon" id="i6"></div>Менеджмент</div>
						<div class="item click" id="c8" onclick="right_menu_select(8)">
							<div class="icon" id="i7"></div>Видео\Аудио</div>
						<div class="item click" id="c9" onclick="right_menu_select(9)">
							<div class="icon" id="i8"></div>Прочее</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
<div id="dialog" class="dialog" onclick="dialog.click()"></div>
<div id="scripts"></div>

</html>
