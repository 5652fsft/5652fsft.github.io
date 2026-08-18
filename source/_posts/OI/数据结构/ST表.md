---
title: ST表
date: 2023-03-01 12:00:00
categories: 
- OI
- 数据结构
cover: assets/002.jpg
description: 基于倍增思想的数据结构，O(n log n) 预处理后 O(1) 回答区间询问，适用于满足结合律的可重复贡献问题（如 RMQ）。
math: true
mermaid: true
---

ST 表是用于解决==可重复贡献问题==的==离线==数据结构。

用 ST 表求解需要==运算满足结合律==，==不支持修改操作==，因为每次修改后都要重新预处理。

**若题目是可重复贡献问题，且运算满足结合律、无需修改操作，则建议使用 ST 表。**

> **可重复贡献问题**是指对于运算 $\mathrm{opt} $ ，满足 $x\ \mathrm{opt}\ x=x$ ，则对应的区间询问就是一个可重复贡献问题。
若不满足，则求值时采用的预处理区间重叠，会导致重叠部分被计算两次，产生错误。

ST 表基于==倍增==思想，可以 $O(n\log n)$ 预处理， $O(1)$ 回答每个询问。

**可重复贡献问题**就算用来求解的预处理区间有重叠部分，只要这些区间的并是所求的区间，最终计算出的答案就是正确的，可**使用至多两个预处理过的区间来覆盖询问区间**。

## 实现

**令 $f_{i,j}$ 表示区间 $[i,i+2^j-1]$ 中 $\mathrm{opt}$ 运算的结果**，

显然 $[i,i+2^0-1]$ 区间中的最大值 $f_{i,0}=a_i$ ，

根据定义式，第二维就相当于倍增的时候「跳了 $2^j-1$ 步」，

故**状态转移方程为 $f_{i,j}=f_{i,j-1}\ \mathrm{opt}\ f_{i+2^{j-1},j-1}$** 。

查询时，对于询问 $[l,r]$ ，将其分为两个完全覆盖其而不超出其的区间 $[l,l+2^s-1]$ 和 $[r-2^s+1,r]$ ，其中 $s=\left \lfloor \log_{2}{(r-l+1)}  \right \rfloor$ ，

**回答为 $f_{l,s}\ \mathrm{opt}\ f_{r-2^s+1,s}$** 。

**RMQ 模板 $Code:$**

```cpp
#include <bits/stdc++.h>
using namespace std;
const int logn = 21, maxn = 2000001;
int f[maxn][logn + 1], Logn[maxn + 1];

int read()  // 快读
{
	ll x = 0; bool s = 0; char c = getchar();
	while(c < '0' || c > '9') {if(c=='-') s = 1; c = getchar();}
	while('0' <= c && c <= '9') {x = (x << 3) + (x << 1) + (c ^ 48); c = getchar();}
	return s ? -x : x;
}

void pre()  // 准备工作，初始化 Logn 数组
{
	Logn[1] = 0; Logn[2] = 1;
	for(int i = 3; i < maxn; i++) Logn[i] = Logn[i / 2] + 1;
}

int main()
{
	int n = read(), m = read();  // 输入数据总数、询问次数
	for (int i = 1; i <= n; i++) f[i][0] = read();  // 数据输入加初始化
	pre();
	for (int j = 1; j <= logn; j++)
		for (int i = 1; i + (1 << j) - 1 <= n; i++)  // 注意边界
			f[i][j] = max(f[i][j - 1], f[i + (1 << (j - 1))][j - 1]);  // ST 表的预处理，实质是动态规划
	for (int i = 1; i <= m; i++)
	{
		int l = read(), r = read();
		int s = Logn[r - l + 1];  // 注意 r - l + 1 才为区间长度
		printf("%d\n", max(f[l][s], f[r - (1 << s) + 1][s]));  // 输出结果，分别以左右两个端点为基础，向区间内跳 2 ^ s 的最大值
	}
	return 0;
}
```
