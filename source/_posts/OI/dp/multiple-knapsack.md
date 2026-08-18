---
title: 多重背包
date: 2023-03-01 12:00:00
categories: 
- OI
- 动态规划
cover: assets/001.jpg
description: 多重背包问题及其二进制优化：将物品数量拆分为 2 的幂，转化为 01 背包求解。
math: true
mermaid: true
---

多重背包问题题意概要：

> 共有 $n$ 种物品，其中对于第 $i$ 个物品共有 $s_i$ 个，每个的代价为 $w_i$ ，价值为 $v_i$ 。求在最大能承受代价 $m$ 内能获得的最大价值

所谓「多重」就是在 01 背包上加一层个数的循环。但这样肯定会爆 TLE ，所以需要优化。

## 二进制优化
**$\forall n\in \mathbb{N_{+}}$ 可以被分解成 $1,2,4,…,2^{k-1},n-2^k+1$ 的和的形式。其中 $k$ 为满足 $n-2^k+1>0$ 的最大正整数**。

**时间复杂度为 $O(m\sum\log s)$ 。**

**$Code:$**

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 114514;
int n, m, w[N], v[N], f[N], cnt;

int main() {
	scanf("%d%d", &n, &m);
	for(int i = 1; i <= n; i++)
	{
		int wi, vi, s, k = 1;
		scanf("%d%d%d", &wi, &vi, &s);
		while(k <= s)
		{
			w[++cnt] = wi * k;
			v[cnt] = vi * k;
			s -= k;
			k *= 2;
		}
		if(s > 0)
		{
			w[++cnt] = wi * s;
			v[cnt] = vi * s;
		}
	}
	n = cnt;
	for(int i = 1; i <= n; i++)
		for(int j = m; j >= w[i]; j--)
			f[j] = max(f[j], f[j - w[i]] + v[i]);
	printf("%d", f[m]);
	return 0;
}
```

## 单调队列优化
二进制优化还是太慢了，所以就有了单调队列优化。

首先在拉回 01 背包改的的状态转移方程 $f_j=max(f_j,f_{j-kw_i}+kv_i)$ 。

不妨设 $m=k\times w_i+l$，则 $f$ 数组可表示为 $f_{w_i+l},f_{2w_i+l},\cdots,f_{kw_i+l}$ 。

那么
 
$$
\begin{aligned}
f_{kw_i+l}&=\max_{x=0}^{x\lt k}(f_{kw_i+l-xw_i}+xv_i)
\\&=\max_{x=0}^{x\lt k}(f_{(k-x)w_i+l}+xv_i)
\\&=\max_{x=1}^{x\le k}(f_{xw_i+l}+(k-x)v_i)
\\&=\max_{x=1}^{x\le k}(f_{xw_i+l}-xv_i)+kv_i
\end{aligned}
$$

行了，现在变成要求区间最大值了，就可以开始单调队列了。这样，每次入队的值是 $f_{kw_i+l}-kv_i$ 。

时间复杂度为 $O(mn)$ 。

**$Code:$**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 114514;
int n, m, f[N], pre[N], q[N];

int main() {
	scanf("%d%d", &n, &m);
	for(int i = 1; i <= n; i++)
	{
		int w, v, s;
		scanf("%d%d%d", &w ,&v, &s);
		memcpy(pre, f, sizeof(f));
		for(int j = 0; j < w; j++)
		{
			int hd = 0, tl = -1;
			for(int k = j; k <= m; k += w)
			{
				if(hd <= tl && k - s * w > q[hd]) ++hd;
				while(hd <= tl && pre[q[tl]] - (q[tl] - j) / w * v <= pre[k] - (k - j) / w * v) --tl;
				if(hd <= tl) f[k] = max(f[k], pre[q[hd]] + (k - q[hd]) / w * v);
				q[++tl] = k;
			}
		}
	}
	printf("%d", f[m]);
	return 0;
}
```