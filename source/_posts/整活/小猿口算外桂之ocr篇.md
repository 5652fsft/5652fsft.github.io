---
title: 小猿口算外桂之ocr篇
date: 2024-10-18 12:00:00
categories: 
- 整活
cover: assets/007.jpg
description: 使用安卓模拟器 + OpenCV + Tesseract OCR 识别题目数字，u2 控制模拟滑动自动作答小猿口算的脚本。
math: true
---

初代版本，小问题很多，亟待优化——2024.10.16

使用了安卓模拟器运行 Android 虚拟机，open-cv 及 Tesseract-OCR 进行 ocr 识别，u2 控制模拟滑动。

### 部署教程
下载 [tesseract](https://github.com/tesseract-ocr/tesseract) 。

接着 `pip install opencv-python numpy pyautogui pytesseract keyboard uiautomator2`

然后 `adb connect 127.0.0.1:port` 端口号取决于用的啥模拟器（部分模拟器不自带 adb 需自行下载并配置环境变量）

```python
import cv2
import uiautomator2 as u2
import numpy as np
import pyautogui
import pytesseract
import keyboard
import sys
import time

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe' # 设置 Tesseract-OCR 的路径

# 跟踪状态的变量
not_found_count = 0
last_not_found_time = 0
last_numbers = None  # 存储上次识别的数字
skip_count = 0  # 跳过次数计数器

# 连接到设备
d = u2.connect()

def log_time(label, start_time):
    """打印执行时间的辅助函数"""
    elapsed_time = time.time() - start_time
    print(f"{label} 耗时：{elapsed_time:.4f} 秒")

def capture_area():
    region = (180, 400, 460, 130)  # (x, y, width, height)
    screenshot = pyautogui.screenshot(region=region)
    return np.array(screenshot)

def recognize_numbers(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # 使用OpenCV库将输入的彩色图像转换为灰度图像
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)  # 对灰度图像应用阈值操作，将图像转换为二值图像
    # 阈值设置为150，意味着所有灰度值大于或等于150的像素点将被设置为255（白色），其余的将被设置为0（黑色）
    # 使用下划线 _ 来忽略函数返回的第一个值（阈值操作后的灰度图），只保留二值化后的图像thresh
    text = pytesseract.image_to_string(thresh, config='--psm 6')  # 使用pytesseract库将二值化后的图像中的文本内容识别出来
    return [int(s) for s in text.split() if s.isdigit()]
    # 将识别出的文本分割成字符串，然后检查每个字符串是否只包含数字。如果是，就将其转换为整数，并返回一个包含所有识别出的数字的列表

def handle_insufficient_numbers():
    global not_found_count, last_not_found_time

    current_time = time.time()
    not_found_count = not_found_count + 1 if current_time - last_not_found_time <= 1 else 1
    last_not_found_time = current_time

    print("未找到足够的数字进行比较")
    if not_found_count >= 50:
        click_buttons()
        print("程序暂停中")
        time.sleep(13)
        print("准备重新开始程序...")
        time.sleep(0.3)
        main()

def click_buttons():
    print("执行点击按钮操作")
    pyautogui.click(405, 1175)  # 点击“开心收下”按钮
    time.sleep(0.3)
    pyautogui.click(581, 1383)  # 点击“继续”按钮
    time.sleep(0.3)
    pyautogui.click(540, 1263)  # 点击“继续PK”按钮

def draw_comparison(numbers):
    global not_found_count, last_numbers, skip_count

    if len(numbers) < 2:
        handle_insufficient_numbers()
        return

    # 如果当前数字与上一个数字相同，则增加跳过计数
    if last_numbers is not None and last_numbers == numbers:
        skip_count += 1
        print(f"当前结果与上次相同，跳过此次执行 (次数: {skip_count})")
        if skip_count > 10:  # 如果跳过次数超过10，则强制执行一次
            skip_count = 0
            execute_drawing_logic(numbers)
        return

    execute_drawing_logic(numbers)  # 执行当前数字的绘制逻辑

    not_found_count = 0  # 重置未找到计数
    last_numbers = numbers  # 更新上次识别的数字
    skip_count = 0  # 重置跳过次数

def execute_drawing_logic(numbers):
    first, second = numbers[:2]  # 获取前两个数字
    print(f"识别的数字: {first}, {second}")

    if first > second:
        print(f"{first} > {second}")
        draw_greater_than()
    elif first < second:
        print(f"{first} < {second}")
        draw_less_than()

def draw_greater_than():
    swipe(True)  # 输入大于号

def draw_less_than():
    swipe(False)  # 输入小于号

def swipe(is_greater):
    # 执行滑动操作
    start_time = time.time()
    swipe_points = {
        True: [(360, 1210), (420, 1250), (360, 1280)],  # 左滑动路径
        False: [(420, 1210), (360, 1250), (420, 1280)]  # 右滑动路径
    }
    d.swipe_points(swipe_points[is_greater], duration=0.01)
    log_time("执行滑动", start_time)

def main():
    keyboard.add_hotkey('=', lambda: sys.exit("进程已结束"))  # 默认的退出快捷键

    try:
        while True:
            image = capture_area()  # 截取屏幕区域
            numbers = recognize_numbers(image)  # 从截取的图像中识别数字
            draw_comparison(numbers)  # 比较并绘制结果
            # time.sleep(0.01)
    except SystemExit as e:
        print(e)

if __name__ == "__main__":
    main()  # 启动主程序
```