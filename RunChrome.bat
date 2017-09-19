::关闭所有正在运行的chrome进程
TASKKILL /IM chrome.exe /F
::以扩展权限启动chrome,这里需要用户下面一行中,!第二个! 引号内部chrome的路径,替换成自己的电脑上的chrome路径
start "chrome" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir
::关闭自己这个窗口
exit