@echo on
cmd /c "hexo clean"
cmd /c "hexo g"
git add -A
git commit -m "auto deploy %date% %time%"
git push
pause
